import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import SEO from '../components/SEO';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { notifyError, notifySuccess } from '../lib/toast';
import { loginSchema, signUpSchema, type LoginFormData, type SignUpFormData } from '../schemas/auth';

type AuthFormData = LoginFormData & SignUpFormData;

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we are in the middle of an OAuth redirect
    const hash = window.location.hash;
    const search = window.location.search;
    if ((hash && (hash.includes('access_token') || hash.includes('error'))) || 
        (search && (search.includes('code') || search.includes('error')))) {
      setIsAuthenticating(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Don't redirect during password recovery flow
      if (event === 'PASSWORD_RECOVERY') {
        setIsAuthenticating(false);
        return;
      }
      if (event === 'SIGNED_IN') {
        setIsAuthenticating(false);
        navigate('/dashboard');
      }
      if (event === 'INITIAL_SESSION' && (hash || search)) {
        // If initial session check finishes and we still have OAuth params but no user, 
        // we might have timed out or failed silently
        setTimeout(() => setIsAuthenticating(false), 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isSignUp ? signUpSchema : loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  const email = watch('email');
  const [resetCooldown, setResetCooldown] = React.useState(0);

  React.useEffect(() => {
    if (resetCooldown <= 0) return;
    const interval = setInterval(() => setResetCooldown(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resetCooldown]);

  const handleForgotPassword = async () => {
    if (resetCooldown > 0) return;
    if (!email) {
      notifyError('Please enter your email address to reset your password.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/.netlify/functions/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notifySuccess('Check your email for the password reset link.');
      setResetCooldown(60);
    } catch (err: any) {
      notifyError(err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminMode = initialRole === 'admin';
  const isMentorMode = initialRole === 'mentor';

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      notifyError(err.message || `Failed to sign in with ${provider}.`);
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Check if application is approved
        const appRes = await fetch('/.netlify/functions/check-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email.trim() }),
        });
        const appData = await appRes.json();

        if (appData.is_approved === false) {
          throw new Error('Your application has not been approved yet. Only accepted members can create an account.');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth`,
          }
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        // Send welcome email (async, non-blocking)
        fetch('/.netlify/functions/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email.trim(), name: data.fullName })
        }).catch(() => {});

        notifySuccess('Account created successfully! Please check your email to confirm your account.');
        setIsSignUp(false);
        reset();
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password
        });

        if (signInError) {
          if (signInError.message.toLowerCase().includes('email not confirmed')) {
            throw new Error('Please check your inbox and confirm your email address before signing in.');
          }
          throw new Error(signInError.message);
        }

        if (authData.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
             console.warn('Profile fetch error:', profileError);
          }

          const userRole = profile?.role || 'user';
          const userName = profile?.name || authData.user.user_metadata?.full_name || 'User';

          if (isAdminMode && userRole !== 'admin') {
            navigate('/dashboard');
            throw new Error('This account does not have admin privileges.');
          }
          if (isMentorMode && userRole !== 'mentor') {
            navigate('/dashboard');
            throw new Error('This account does not have mentor privileges.');
          }

          const currUser: User = {
            id: authData.user.id,
            email: authData.user.email!,
            full_name: userName,
            role: userRole,
            created_at: authData.user.created_at
          };

          onLogin(currUser);
          notifySuccess('Signed in successfully!');
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      notifyError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticating) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100] animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-24 h-24 border-[3px] border-slate-100 rounded-[32px] animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-black animate-spin" />
          </div>
        </div>
        <div className="mt-8 text-center space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tighter">Authenticating securely</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Verifying cryptographic session...</p>
        </div>
        <div className="absolute bottom-12 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
          Mentorino × Private Access
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12 animate-in fade-in duration-700">
      <SEO 
        title={isSignUp ? "Create Account" : "Sign In"} 
        description="Join Mentorino or sign in to your workspace. Secure access for students, mentors, and administrators."
      />
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-black transition-colors text-[10px] font-black uppercase tracking-widest">
        <ArrowLeft size={14} /> BACK
      </Link>

      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-lg font-black mx-auto mb-4 shadow-xl shadow-black/10">M</div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1 uppercase">
            {isAdminMode ? 'ADMIN PORTAL' : isMentorMode ? 'MENTOR PORTAL' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </h1>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
            {isAdminMode 
              ? 'SECURE ACCESS FOR MENTORINO'
              : isMentorMode ? 'MENTOR ACCESS TO MENTORINO WORKSPACE'
              : isSignUp ? 'JOIN THE MENTORINO COMMUNITY' : 'WELCOME BACK TO MENTORINO WORKSPACE'}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[40px] sm:rounded-[48px] border border-black/[0.03] shadow-2xl">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {isSignUp && !isLoading && (
              <div className="bg-indigo-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-100 flex flex-col items-center text-center gap-1 sm:gap-2">
                <p className="text-[8px] sm:text-[9px] font-black text-indigo-900 uppercase tracking-widest">INVITATION ONLY</p>
                <p className="text-[7px] sm:text-[8px] font-bold text-indigo-700/70 uppercase leading-relaxed tracking-wider">
                  You must have an approved application on file to register. Mentorino will review your request first.
                </p>
              </div>
            )}
            
            {isSignUp && (
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">FULL NAME</label>
                <div className="relative">
                  <input 
                    {...register('fullName')}
                    type="text" 
                    className={`w-full px-5 sm:px-6 py-3 sm:py-4 bg-slate-50 border ${errors.fullName ? 'border-red-500' : 'border-slate-100'} rounded-xl sm:rounded-[20px] text-xs font-medium text-center focus:bg-white focus:border-black transition-all outline-none`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-[8px] text-red-500 font-bold uppercase mt-1 ml-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.fullName.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">EMAIL ADDRESS</label>
              <div className="relative">
                <input 
                  {...register('email')}
                  type="email" 
                  className={`w-full px-5 sm:px-6 py-3 sm:py-4 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-100'} rounded-xl sm:rounded-[20px] text-xs font-medium text-center focus:bg-white focus:border-black transition-all outline-none`}
                  placeholder="name@example.com"
                />
                {errors.email && (
                  <p className="text-[8px] text-red-500 font-bold uppercase mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">PASSWORD</label>
                {!isSignUp && (
                  <button type="button" onClick={handleForgotPassword} disabled={resetCooldown > 0} className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-black disabled:opacity-30">{resetCooldown > 0 ? `${resetCooldown}s` : 'FORGOT?'}</button>
                )}
              </div>
              <div className="relative">
                <input 
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'} 
                  className={`w-full px-5 sm:px-6 py-3 sm:py-4 bg-slate-50 border ${errors.password ? 'border-red-500' : 'border-slate-100'} rounded-xl sm:rounded-[20px] text-xs font-medium text-center focus:bg-white focus:border-black transition-all outline-none`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && (
                  <p className="text-[8px] text-red-500 font-bold uppercase mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="btn-normal bg-black text-white w-full flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>



            {!isAdminMode && (
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    reset();
                  }}
                  className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-black transition-colors"
                >
                  {isSignUp ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : "DON'T HAVE AN ACCOUNT? SIGN UP"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;