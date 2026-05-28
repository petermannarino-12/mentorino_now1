import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import { Lock, Loader2, X, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const customToken = searchParams.get('token');

  // If using custom flow (token in URL param), skip Supabase session check
  const isCustomFlow = !!customToken;

  useEffect(() => {
    if (isCustomFlow) {
      setIsSessionValid(true);
      return;
    }

    let cancelled = false;
    let retries = 0;
    const maxRetries = 10;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setIsSessionValid(true);
        return true;
      }
      return false;
    };

    const tryCheck = async () => {
      const ok = await checkSession();
      if (!ok && retries < maxRetries) {
        retries++;
        setTimeout(tryCheck, 300);
      } else if (!ok && !cancelled) {
        const hash = window.location.hash;
        if (hash.includes('type=recovery') || hash.includes('access_token')) {
          setIsSessionValid(true);
        } else {
          setIsSessionValid(false);
        }
      }
    };

    tryCheck();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsSessionValid(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isCustomFlow]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSessionValid) {
      setError('This reset link is no longer valid.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      if (isCustomFlow) {
        const res = await fetch('/.netlify/functions/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: customToken, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        await signOut();
      }

      setSuccess(true);
      setTimeout(() => navigate('/auth'), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isSessionValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="animate-spin text-slate-300 mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid/expired link
  if (isSessionValid === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#FAFAFA] animate-in fade-in duration-700">
        <div className="w-full max-w-[400px] bg-white p-10 sm:p-12 rounded-[48px] border border-black/[0.03] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <X size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase tracking-tighter">Expired Link</h1>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              This password reset link is invalid or has expired. Please request a new one from the login page.
            </p>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#FAFAFA] animate-in fade-in duration-700">
        <div className="w-full max-w-[400px] bg-white p-10 sm:p-12 rounded-[48px] border border-black/[0.03] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase tracking-tighter">Password Updated</h1>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Your password has been updated successfully. Redirecting you to sign in...
            </p>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-[grow_2.5s_ease-in-out]" style={{ animation: 'grow 2.5s ease-in-out forwards' }} />
          </div>
        </div>
        <style>{`@keyframes grow { from { width: 0%; } to { width: 100%; } }`}</style>
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[#FAFAFA] animate-in fade-in duration-700">
      <SEO 
        title="Reset Password" 
        description="Reset your Mentorino account password."
      />
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-lg font-black mx-auto mb-4 shadow-xl shadow-black/10">M</div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1 uppercase">Reset Password</h1>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Enter your new password below</p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[48px] border border-black/[0.03] shadow-2xl">
          <form className="space-y-5" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  id="new-password"
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-11 py-4 bg-slate-50 border ${confirmPassword && password !== confirmPassword ? 'border-red-300' : 'border-slate-100'} rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all outline-none`}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[8px] text-red-500 font-bold uppercase ml-1 flex items-center gap-1">
                  <AlertCircle size={10} /> Passwords do not match
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/auth')}
            className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-black transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
