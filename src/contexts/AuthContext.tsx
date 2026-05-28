import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { setUser as setSentryUser } from '../lib/sentry';
import posthog from 'posthog-js';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  authLoading: boolean;
  isRecoveryMode: boolean;
  clearRecoveryMode: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'visitor',
  authLoading: true,
  isRecoveryMode: false,
  clearRecoveryMode: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('visitor');
  const [authLoading, setAuthLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const recoveryRef = useRef(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`/.netlify/functions/profiles?id=${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.warn('Profile fetch failed:', res.status, body);
        // Fall back to auth user metadata so login still works without a DB profile row
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const fallbackUser: User = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: (authUser.user_metadata?.full_name as string) || authUser.email?.split('@')[0] || 'User',
            role: 'user',
            created_at: authUser.created_at,
          };
          setUser(fallbackUser);
          setRole('user');
          setSentryUser({ id: authUser.id, email: authUser.email });
          posthog.identify(authUser.id, {
            email: authUser.email,
            name: fallbackUser.full_name,
            role: 'user',
          });
        } else {
          setUser(null);
          setRole('visitor');
        }
        setAuthLoading(false);
        return;
      }

      const profile = await res.json();

      setUser({
        id: profile.id,
        email: profile.email,
        full_name: profile.name || '',
        role: profile.role || 'user',
        phone: profile.phone || '',
        created_at: profile.created_at
      });
      setRole(profile.role || 'user');
      
      setSentryUser({ id: profile.id, email: profile.email });
      posthog.identify(profile.id, {
        email: profile.email,
        name: profile.name || '',
        role: profile.role || 'user',
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Fall back to auth user metadata on network error
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const fallbackUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: (authUser.user_metadata?.full_name as string) || authUser.email?.split('@')[0] || 'User',
          role: 'user',
          created_at: authUser.created_at,
        };
        setUser(fallbackUser);
        setRole('user');
      } else {
        setUser(null);
        setRole('visitor');
      }
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    // Detect recovery flow from URL hash before Supabase processes it
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      recoveryRef.current = true;
      setIsRecoveryMode(true);
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        supabase.auth.signOut().then(() => {
          setAuthLoading(false);
        });
        return;
      }
      // During recovery, don't treat session as a normal login
      if (session && !recoveryRef.current) {
        fetchUserProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    }).catch(err => {
      console.error('Unexpected error in getSession:', err);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        recoveryRef.current = true;
        setIsRecoveryMode(true);
        setAuthLoading(false);
        return;
      }

      // Skip normal auth processing during recovery mode
      if (recoveryRef.current) {
        setAuthLoading(false);
        return;
      }

      if (session) {
        setAuthLoading(true);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setRole('visitor');
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearRecoveryMode = React.useCallback(() => {
    recoveryRef.current = false;
    setIsRecoveryMode(false);
  }, []);

  const signOut = React.useCallback(async () => {
    recoveryRef.current = false;
    setIsRecoveryMode(false);
    await supabase.auth.signOut();
    // Clear telemetry context
    setUser(null);
    posthog.reset();
  }, []);

  const value = React.useMemo(
    () => ({ user, role, authLoading, isRecoveryMode, clearRecoveryMode, signOut }),
    [user, role, authLoading, isRecoveryMode, clearRecoveryMode, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
