import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';

export const useUsersQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/.netlify/functions/profiles?limit=50', { headers });
      const profiles = await res.json();
      const mappedUsers: User[] = (Array.isArray(profiles) ? profiles : []).map((p: any) => ({
        id: p.id,
        full_name: p.name || '',
        email: p.email,
        role: p.role,
        created_at: p.created_at
      }));
      return mappedUsers;
    },
    enabled,
  });
};
