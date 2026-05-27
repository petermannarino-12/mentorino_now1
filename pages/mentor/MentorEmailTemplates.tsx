import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Save, Edit3, X, Check, AlertCircle, Loader2, Info } from 'lucide-react';
import { emailTemplateService, EmailTemplate } from '../../src/services/emailTemplateService';
import { EmptyState } from '../../src/components/ui/EmptyState';

const TEMPLATE_LABELS: Record<string, { label: string; description: string }> = {
  application_submitted: {
    label: 'Application Submitted',
    description: 'Sent automatically when a student submits an application.'
  },
  application_accepted: {
    label: 'Application Accepted',
    description: 'Sent automatically when you approve a student\'s application.'
  },
  application_rejected: {
    label: 'Application Rejected',
    description: 'Sent automatically when you reject a student\'s application.'
  }
};

const DYNAMIC_VARIABLES = [
  { variable: '{{student_name}}', description: 'Student\'s full name' },
  { variable: '{{mentor_name}}', description: 'Mentor\'s name' },
  { variable: '{{program_name}}', description: 'Program/mentor type' },
  { variable: '{{login_url}}', description: 'Login page URL (accepted only)' },
];

interface MentorEmailTemplatesProps {}

export const MentorEmailTemplates: React.FC<MentorEmailTemplatesProps> = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { data, error } = await emailTemplateService.fetchAll();
    if (error) {
      setNotification(`Failed to load templates: ${error}`);
    }
    setTemplates(data || []);
    setLoading(false);
  };

  const startEditing = (template: EmailTemplate) => {
    setEditingId(template.id);
    setEditSubject(template.subject);
    setEditBody(template.body);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditSubject('');
    setEditBody('');
  };

  const saveTemplate = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await emailTemplateService.update(editingId, editSubject, editBody);
    if (error) {
      setNotification(`Failed to save: ${error}`);
    } else {
      setNotification('Template saved successfully.');
      setEditingId(null);
      await loadTemplates();
    }
    setSaving(false);
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState 
          title="No Email Templates" 
          description="Email templates have not been configured yet. Please run the email_templates_migration.sql script in your Supabase SQL Editor to set up the default templates." 
          icon={Mail}
          className="mt-8"
        />
        <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">Setup Required</p>
              <p className="text-xs text-amber-700">
                Go to your Supabase project → SQL Editor → Run the contents of <code className="bg-amber-100 px-1 rounded">email_templates_migration.sql</code> to create the table and seed default templates.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Dynamic Variables Reference */}
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <Info size={16} className="text-slate-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Dynamic Variables</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DYNAMIC_VARIABLES.map(v => (
            <div key={v.variable} className="bg-white p-3 rounded-2xl border border-slate-100">
              <code className="text-[10px] font-black text-indigo-600 block mb-1">{v.variable}</code>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{v.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Template Cards */}
      <div className="space-y-6">
        {templates.map(template => {
          const meta = TEMPLATE_LABELS[template.id] || { label: template.id, description: '' };
          const isEditing = editingId === template.id;

          return (
            <div 
              key={template.id} 
              className="bg-white p-6 md:p-8 rounded-[40px] border border-black/[0.03] shadow-sm space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">{meta.label}</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{meta.description}</p>
                    </div>
                  </div>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => startEditing(template)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={cancelEditing}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <X size={12} /> Cancel
                    </button>
                    <button 
                      onClick={saveTemplate}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                    </button>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Subject</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:bg-white focus:border-black transition-all outline-none"
                  />
                ) : (
                  <p className="px-5 py-3 bg-slate-50 rounded-2xl text-xs font-medium text-slate-700">{template.subject}</p>
                )}
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Body</label>
                {isEditing ? (
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={8}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-xs font-medium focus:bg-white focus:border-black transition-all outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <div className="px-5 py-4 bg-slate-50 rounded-[24px] text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {template.body}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in slide-in-from-top-4 duration-500">
          <div className="bg-black text-white p-5 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-3">
            <Check size={16} className="text-emerald-400 shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest">{notification}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
