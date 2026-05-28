import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface ChatBoxProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  apiBase?: string;
}

const API = '/api/emails';

export function ChatBox({ currentUserId, otherUserId, otherUserName, apiBase }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  async function getToken() {
    const session = (await supabase.auth.getSession()).data.session;
    return session?.access_token;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['conversation', currentUserId, otherUserId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${API}?from=get-conversation&with=${otherUserId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load messages');
      const json = await res.json();
      return json.messages as Message[];
    },
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const token = await getToken();
      const res = await fetch(`${API}?from=send-message`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ receiver_id: otherUserId, content }),
      });
      if (!res.ok) throw new Error('Failed to send');
    },
    onSuccess: () => {
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['conversation', currentUserId, otherUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  const markRead = async () => {
    const token = await getToken();
    if (!token) return;
    await fetch(`${API}?from=mark-read`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from_user_id: otherUserId }),
    });
  };

  useEffect(() => {
    if (data && data.length > 0) markRead();
  }, [data]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMutation.mutate(input.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 600, fontSize: 15 }}>
        {otherUserName}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoading && <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: 40 }}>Loading messages...</div>}
        {data && data.length === 0 && (
          <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: 40 }}>No messages yet. Start a conversation!</div>
        )}
        {data?.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                padding: '10px 16px',
                borderRadius: 18,
                fontSize: 14,
                lineHeight: 1.4,
                background: isMine ? '#000' : '#f0f0f0',
                color: isMine ? '#fff' : '#000',
                wordBreak: 'break-word',
              }}>
                {msg.content}
                <div style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.5)' : '#999', marginTop: 4 }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMine && !msg.read && <span style={{ marginLeft: 4 }}>✓</span>}
                  {isMine && msg.read && <span style={{ marginLeft: 4 }}>✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 28, border: '1px solid #ddd', outline: 'none', fontSize: 14 }}
        />
        <button
          onClick={handleSend}
          disabled={sendMutation.isPending || !input.trim()}
          style={{
            width: 40, height: 40, borderRadius: '50%', background: '#000', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: !input.trim() ? 0.4 : 1,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
