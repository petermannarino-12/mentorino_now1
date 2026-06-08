import { supabase } from '../lib/supabase';
import { captureException } from '../lib/sentry';
import { Enquiry } from '../types';

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
    captureException(err, { handler: 'enquiryService.api', url });
    return { data: null, error: err.message || 'Network error' };
  }
}

export const enquiryService = {
  async fetchAll(): Promise<{ data: Enquiry[] | null; error: string | null }> {
    const result = await api('/api/enquiries');
    return { data: result.data as Enquiry[], error: result.error };
  },
  async submit(enquiry: { name: string; email: string; phone?: string; service_type: string; message?: string }): Promise<{ data: Enquiry | null; error: string | null }> {
    const result = await api('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiry),
    });
    return { data: result.data as Enquiry, error: result.error };
  },
  async updateStatus(id: string, status: 'new' | 'contacted' | 'closed'): Promise<{ data: Enquiry | null; error: string | null }> {
    const result = await api('/api/enquiries', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
    return { data: result.data as Enquiry, error: result.error };
  }
};
