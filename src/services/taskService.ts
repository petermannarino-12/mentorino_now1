import { supabase } from '../lib/supabase';
import { TaskActivity } from '../types';

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

export const taskService = {
  async fetchAll(from: number = 0, to: number = 49) {
    return api(`/.netlify/functions/task-activities?from=${from}&to=${to}`);
  },
  async fetchByUserId(userId: string, from: number = 0, to: number = 49) {
    return api(`/.netlify/functions/task-activities?userId=${userId}&from=${from}&to=${to}`);
  },
  async insert(activity: Omit<TaskActivity, 'id' | 'created_at'>) {
    return api('/.netlify/functions/task-activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  },
  async updateStatus(id: string, status: string, response?: string) {
    return api('/.netlify/functions/task-activities', {
      method: 'POST',
      body: JSON.stringify({ id, status, admin_response: response }),
    });
  }
};
