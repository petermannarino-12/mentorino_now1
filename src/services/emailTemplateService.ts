import { supabase } from '../lib/supabase';

export interface EmailTemplate {
  id: string;
  subject: string;
  body: string;
  updated_at: string;
}

export const emailTemplateService = {
  async fetchAll(): Promise<{ data: EmailTemplate[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('id');
    
    if (error) return { data: null, error: error.message };
    return { data: data as EmailTemplate[], error: null };
  },

  async update(id: string, subject: string, body: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('email_templates')
      .update({ subject, body, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error: error?.message || null };
  }
};
