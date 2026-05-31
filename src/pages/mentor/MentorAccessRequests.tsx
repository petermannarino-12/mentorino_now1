import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Mail, Info, Loader2, Check, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { EmptyState } from '../../components/ui/EmptyState';

interface AccessRequest {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  product_id: string;
  product_name: string;
  message: string | null;
  status: string;
  mentor_notes: string | null;
  granted_at: string | null;
  created_at: string;
}

async function fetchRequests(): Promise<AccessRequest[]> {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const res = await fetch('/api/list-product-requests', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch requests');
  const data = await res.json();
  return data.requests || [];
}

export const MentorAccessRequests: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AccessRequest | null>(null);
  const [mentorNotes, setMentorNotes] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests()
      .then(setRequests)
      .catch(() => toast.error('Failed to load access requests'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected]);

  const handleAction = async (requestId: string, action: 'grant' | 'deny') => {
    setActioningId(requestId);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/handle-product-access', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action, mentor_notes: mentorNotes || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Access ${action === 'grant' ? 'granted' : 'denied'}`);
      // Update local state
      setRequests(prev => prev.filter(r => r.id !== requestId));
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title="No Access Requests"
        description="No pending product access requests. Students will appear here when they request access to your products."
        icon={Users}
        className="mt-8"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {requests.map(req => (
          <div
            key={req.id}
            onClick={() => { setSelected(req); setMentorNotes(''); }}
            className="bg-white p-5 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[32px] md:rounded-[40px] border border-black/[0.03] shadow-sm space-y-4 sm:space-y-6 flex flex-col hover:shadow-xl hover:border-black/10 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-violet-50 text-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-lg md:text-xl group-hover:scale-110 transition-transform">
                {(req.student_name || '?').charAt(0)}
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-widest">Pending</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight truncate">{req.student_name}</h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{req.student_email}</p>
              <div className="pt-3 sm:pt-4 space-y-2">
                <div className="space-y-0.5">
                  <p className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-widest">Product</p>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-slate-900">{req.product_name}</p>
                </div>
                {req.message && (
                  <div className="space-y-0.5">
                    <p className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-widest">Message</p>
                    <p className="text-[9px] sm:text-[10px] font-medium text-slate-600 leading-relaxed italic line-clamp-2">"{req.message}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 sm:pt-6 mt-auto">
              <button className="w-full py-3 bg-slate-50 text-slate-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] rounded-full group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                Review Request
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] sm:rounded-[48px] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all group"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform" />
              </button>

              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-6">
                {(selected.student_name || '?').charAt(0)}
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{selected.student_name}</h3>
              <div className="flex items-center gap-2 text-slate-400 mb-6">
                <Mail size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest">{selected.student_email}</p>
              </div>

              <div className="h-px bg-slate-100 mb-6" />

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Product</p>
                  <p className="text-sm font-black uppercase tracking-tight">{selected.product_name}</p>
                </div>
                {selected.message && (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Message</p>
                    <p className="text-sm text-slate-700 leading-relaxed italic">"{selected.message}"</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Mentor Notes</p>
                <textarea
                  value={mentorNotes}
                  onChange={e => setMentorNotes(e.target.value)}
                  placeholder="Optional notes about this decision..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:bg-white focus:border-black transition-all outline-none resize-none h-24"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selected.id, 'deny')}
                  disabled={actioningId === selected.id}
                  className="flex-1 py-4 border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actioningId === selected.id ? <Loader2 size={14} className="animate-spin" /> : <><XCircle size={14} /> Deny</>}
                </button>
                <button
                  onClick={() => handleAction(selected.id, 'grant')}
                  disabled={actioningId === selected.id}
                  className="flex-1 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actioningId === selected.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Grant Access</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
