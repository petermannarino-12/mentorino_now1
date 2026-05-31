import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, Loader2, X, Flag } from 'lucide-react';
import { Milestone } from '../../types';
import { supabase } from '../../lib/supabase';

type Props = {
  milestones: Milestone[];
  userId: string;
};

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const MilestoneList: React.FC<Props> = ({ milestones, userId }) => {
  const [items, setItems] = useState<Milestone[]>(milestones);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const toggleMilestone = async (id: string, current: boolean) => {
    setSaving(id);
    const updated = items.map(m => m.id === id ? { ...m, completed: !current } : m);
    setItems(updated);
    const headers = await getAuthHeaders();

    const profileRes = await fetch(`/api/profiles?id=${userId}`, { headers });
    const profile = await profileRes.json();
    const existingMilestones = profile?.milestones || [];
    const updatedMilestones = existingMilestones.map((m: Milestone) => m.id === id ? { ...m, completed: !current } : m);

    await fetch('/api/profiles', {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestones: updatedMilestones }),
    });
    setSaving(null);
  };

  const addMilestone = async () => {
    if (!title.trim()) return;
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      date: new Date().toISOString().split('T')[0],
    };
    const headers = await getAuthHeaders();

    const profileRes = await fetch(`/api/profiles?id=${userId}`, { headers });
    const profile = await profileRes.json();
    const existing = profile?.milestones || [];

    await fetch('/api/profiles', {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestones: [...existing, newMilestone] }),
    });
    setItems(prev => [...prev, newMilestone]);
    setTitle('');
    setDescription('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Milestones</h4>
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">
          {items.filter(m => m.completed).length}/{items.length} Complete
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {items.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-4 rounded-[24px] border border-black/[0.03] flex items-center gap-4 group hover:border-black/10 transition-all"
            >
              <button
                onClick={() => toggleMilestone(m.id, m.completed)}
                disabled={saving === m.id}
                className="shrink-0"
              >
                {saving === m.id ? (
                  <Loader2 size={20} className="animate-spin text-slate-300" />
                ) : m.completed ? (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                ) : (
                  <Circle size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black uppercase truncate ${m.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                  {m.title}
                </p>
                {m.description && (
                  <p className="text-[9px] font-medium text-slate-400 truncate mt-0.5">{m.description}</p>
                )}
                {m.date && (
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{m.date}</p>
                )}
              </div>
              {m.completed && (
                <div className="px-2 py-0.5 bg-emerald-50 rounded-full text-[7px] font-black uppercase tracking-widest text-emerald-500">
                  Done
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-[24px] border border-black/[0.03] space-y-3"
        >
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Milestone title..."
            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-black/10"
            autoFocus
          />
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Short description (optional)..."
            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-xs font-medium text-slate-500 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-black/10"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => { setShowAdd(false); setTitle(''); setDescription(''); }}
              className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addMilestone}
              disabled={!title.trim()}
              className="px-5 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Milestone
            </button>
          </div>
        </motion.div>
      )}

      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 bg-slate-50 rounded-[24px] border border-dashed border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Add Milestone
        </button>
      )}
    </div>
  );
};

export default MilestoneList;
