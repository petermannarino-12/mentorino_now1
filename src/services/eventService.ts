import { supabase } from '../lib/supabase';
import { NetworkEvent } from '../types';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function api(url: string, options?: RequestInit) {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(url, { ...options, headers });
    const body = await res.json();
    if (!res.ok) return { data: null, error: body.error || 'Request failed' };
    return { data: body, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error' };
  }
}

export const eventService = {
  async fetchAll(from: number = 0, to: number = 49) {
    return api(`/.netlify/functions/events?from=${from}&to=${to}`);
  },
  async createEvent(event: Omit<NetworkEvent, 'id'>) {
    return api('/.netlify/functions/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },
  async delete(id: string) {
    return api(`/.netlify/functions/events?id=${id}`, {
      method: 'DELETE',
    });
  },
  async updateAttendees(id: string, userId: string) {
    return api('/.netlify/functions/events', {
      method: 'POST',
      body: JSON.stringify({ action: 'attend', eventId: id, userId }),
    });
  },
  async getById(id: string) {
    return api(`/.netlify/functions/events?id=${id}`);
  },
  async attend(id: string, userId: string) {
    return api('/.netlify/functions/events', {
      method: 'POST',
      body: JSON.stringify({ action: 'attend', eventId: id, userId }),
    });
  }
};
