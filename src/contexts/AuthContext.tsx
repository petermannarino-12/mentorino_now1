import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
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
        console.warn('No profile found for authenticated user. Account may have been revoked.');
        await supabase.auth.signOut();
        setUser(null);
        setRole('visitor');
        setAuthLoading(false);
        return;
      }

      const profile = await res.json();

      setUser({
        id: profile.id,
        email: profile.email,
        full_name: profile.name || '',
        role: profile.role,
        phone: profile.phone || '',
        created_at: profile.created_at
      });
      setRole(profile.role);
      
      Sentry.setUser({ id: profile.id, email: profile.email });
      posthog.identify(profile.id, {
        email: profile.email,
        name: profile.name || '',
        role: profile.role
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      await supabase.auth.signOut();
      setUser(null);
      setRole('visitor');
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
    Sentry.setUser(null);
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
