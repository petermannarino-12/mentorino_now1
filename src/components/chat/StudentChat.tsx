import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { ChatBox } from './ChatBox';

interface StudentChatProps {
  currentUserId: string;
}

export function StudentChat({ currentUserId }: StudentChatProps) {
  const { data: mentorUser, isLoading } = useQuery({
    queryKey: ['my-mentor', currentUserId],
    queryFn: async () => {
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/profiles?limit=50', {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load profiles');
      const profiles = await res.json();
      const mentor = profiles.find((p: any) => p.role === 'mentor' || p.role === 'admin');
      if (!mentor) return null;
      return { id: mentor.id, name: mentor.full_name || 'Mentor' };
    },
  });

  if (isLoading) {
    return <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: 60 }}>Loading...</div>;
  }

  if (!mentorUser) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No mentor assigned yet</h3>
        <p style={{ color: '#666', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
          Once your application is approved and you're matched with a mentor, you'll be able to message them here.
        </p>
      </div>
    );
  }

  return (
    <ChatBox
      currentUserId={currentUserId}
      otherUserId={mentorUser.id}
      otherUserName={mentorUser.name}
    />
  );
}
