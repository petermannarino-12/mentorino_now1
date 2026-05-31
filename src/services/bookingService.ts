import { supabase } from '../lib/supabase';
import { Booking } from '../types';

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

export const bookingService = {
  async fetchAll(from: number = 0, to: number = 49) {
    return api(`/api/bookings?from=${from}&to=${to}`);
  },
  async fetchByUserId(userId: string, from: number = 0, to: number = 49) {
    return api(`/api/bookings?userId=${userId}&from=${from}&to=${to}`);
  },
  async insert(booking: Omit<Booking, 'id'>) {
    return api('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }
};
