import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { ChatBox } from './ChatBox';

interface Conversation {
  other_user_id: string;
  last_message: string;
  last_message_at: string;
  unread: number;
}

interface MentorChatProps {
  currentUserId: string;
}

export function MentorChat({ currentUserId }: MentorChatProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  async function getToken() {
    const session = (await supabase.auth.getSession()).data.session;
    return session?.access_token;
  }

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/emails?from=get-conversations', {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load conversations');
      const json = await res.json();
      return json.conversations as Conversation[];
    },
    refetchInterval: 10000,
  });

  const { data: profileMap } = useQuery({
    queryKey: ['profiles-map'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return {};
      const res = await fetch('/api/profiles?limit=200', {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) return {};
      const profiles = await res.json();
      const map: Record<string, string> = {};
      profiles.forEach((p: any) => { map[p.id] = p.full_name || p.email || 'User'; });
      return map;
    },
  });

  const selectedConv = conversations?.find(c => c.other_user_id === selectedUserId);

  if (selectedUserId && selectedConv) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => setSelectedUserId(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#666', padding: '4px 0' }}
          >
            ← Back to conversations
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <ChatBox
            currentUserId={currentUserId}
            otherUserId={selectedUserId}
            otherUserName={profileMap?.[selectedUserId] || 'Student'}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: 60 }}>Loading conversations...</div>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No conversations yet</h3>
        <p style={{ color: '#666', fontSize: 14 }}>Messages from students will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 600, fontSize: 15 }}>
        Messages
      </div>
      {conversations.map((conv) => {
        const name = profileMap?.[conv.other_user_id] || 'Student';
        const time = new Date(conv.last_message_at).toLocaleDateString();
        return (
          <div
            key={conv.other_user_id}
            onClick={() => setSelectedUserId(conv.other_user_id)}
            style={{
              padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)',
              cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{name}</div>
              <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                {conv.last_message || 'No messages'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div style={{ fontSize: 11, color: '#aaa' }}>{time}</div>
              {conv.unread > 0 && (
                <div style={{
                  background: '#000', color: '#fff', borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
                }}>
                  {conv.unread}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
