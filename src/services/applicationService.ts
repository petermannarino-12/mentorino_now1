import { supabase } from '../lib/supabase';
import { Application } from '../types';

export const applicationService = {
  async fetchAll(from: number = 0, to: number = 49): Promise<{ data: Application[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) return { data: null, error: error.message };
    
    const flattenedData = data?.map(app => ({
      ...(app.responses || {}),
      id: app.id,
      user_email: app.user_email,
      mentor_type: app.mentor_type,
      status: app.status,
      created_at: app.created_at
    })) as Application[];

    return { data: flattenedData, error: null };
  },

  async fetchByEmail(email: string): Promise<{ data: Application | null; error: string | null }> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_email', email)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: null };

    const flattened = {
      ...(data.responses || {}),
      id: data.id,
      user_email: data.user_email,
      mentor_type: data.mentor_type,
      status: data.status,
      created_at: data.created_at
    } as Application;

    return { data: flattened, error: null };
  },

  async insert(app: Omit<Application, 'id' | 'created_at'>): Promise<{ data: Application | null; error: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/submit-application', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ application: app })
      });

      const result = await response.json();

      if (!response.ok) {
        return { data: null, error: result.error || `Server responded with status ${response.status}` };
      }

      return { data: app as unknown as Application, error: null };
    } catch (err: any) {
      console.error('Error submitting application:', err);
      return { data: null, error: err.message || 'Failed to submit application.' };
    }
  },

  async updateStatus(id: string, status: string): Promise<{ data: Application | null; error: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/update-application-status', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const result = await response.json();
      const flattened = {
        ...(result.responses || {}),
        id: result.id,
        user_email: result.user_email,
        mentor_type: result.mentor_type,
        status: result.status,
        created_at: result.created_at
      } as Application;

      return { data: flattened, error: null };
    } catch (err: any) {
      console.error('Error updating application status:', err);
      throw new Error(err.message || 'Failed to update application status.');
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/delete-application?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.error || `Server responded with status ${response.status}` };
      }

      return { error: null };
    } catch (err: any) {
      console.error('Error calling delete application endpoint:', err);
      return { error: err.message || 'An unexpected error occurred.' };
    }
  }
};
