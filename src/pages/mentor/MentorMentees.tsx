import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, MessageSquare, MoreVertical, Trash2, Users, X, Target, CheckCircle2, Circle, Clock3, Loader2 } from 'lucide-react';
import { Application, Task, Milestone } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';
import { supabase } from '../../lib/supabase';

interface MentorMenteesProps {
  mentees: Application[];
  onMessage: (menteeId: string) => void;
  onRemove: (menteeId: string) => void;
}

async function fetchStudentProfile(userId: string) {
  try {
    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token;
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`/api/profiles?id=${userId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch student profile:', err);
    return null;
  }
}

function getStudentId(mentee: Application): string {
  return (mentee as any).user_id || (mentee as any).userId || mentee.id;
}

interface GoalsModalProps {
  mentee: Application;
  onClose: () => void;
  onChat: (userId: string) => void;
}

function GoalsModal({ mentee, onClose, onChat }: GoalsModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfile(getStudentId(mentee)).then(p => {
      setProfile(p);
      setLoading(false);
    });
  }, [mentee]);

  const tasks: Task[] = profile?.tasks || [];
  const milestones: Milestone[] = profile?.milestones || [];
  const completedTasks = tasks.filter((t: Task) => t.status === 'completed').length;
  const completedMilestones = milestones.filter((m: Milestone) => m.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[32px] w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-black/[0.03] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">{mentee.user_name}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mentee.mentor_type}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-300" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-[20px] p-4 text-center">
                  <p className="text-2xl font-black">{tasks.length}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Tasks</p>
                </div>
                <div className="bg-slate-50 rounded-[20px] p-4 text-center">
                  <p className="text-2xl font-black">{completedMilestones}/{milestones.length}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Milestones</p>
                </div>
              </div>

              {/* Tasks */}
              {tasks.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Tasks {completedTasks}/{tasks.length}
                  </h3>
                  <div className="space-y-2">
                    {tasks.map((task: Task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-[16px] border border-black/[0.03]">
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Clock3 size={16} className="text-slate-300 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black uppercase truncate ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {task.title}
                          </p>
                          {task.due_date && (
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                              Due {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {milestones.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Milestones
                  </h3>
                  <div className="space-y-2">
                    {milestones.map((m: Milestone) => (
                      <div key={m.id} className="flex items-center gap-3 p-3 bg-white rounded-[16px] border border-black/[0.03]">
                        {m.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Circle size={16} className="text-slate-300 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black uppercase truncate ${m.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {m.title}
                          </p>
                          {m.description && (
                            <p className="text-[9px] text-slate-400 truncate">{m.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && milestones.length === 0 && (
                <div className="text-center py-8">
                  <Target size={32} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-xs font-black uppercase text-slate-400">No goals set yet</p>
                </div>
              )}

              <button
                onClick={() => onChat(mentee.user_id || mentee.id)}
                className="w-full py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} />
                Message {mentee.user_name}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export const MentorMentees: React.FC<MentorMenteesProps> = ({ mentees, onMessage, onRemove }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!activeMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeMenuId]);

  useEffect(() => {
    if (!showFilter) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilter]);

  const programTypes = useMemo(() => [...new Set(mentees.map(m => m.mentor_type))], [mentees]);

  const [goalsMentee, setGoalsMentee] = useState<Application | null>(null);

  const toggleProgram = (program: string) => {
    setSelectedPrograms(prev =>
      prev.includes(program) ? prev.filter(p => p !== program) : [...prev, program]
    );
  };

  const filteredMentees = mentees.filter(m => {
    const matchesSearch = m.user_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.user_email.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesProgram = selectedPrograms.length === 0 || selectedPrograms.includes(m.mentor_type);
    return matchesSearch && matchesProgram;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search mentees by name..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl sm:rounded-full text-[11px] sm:text-xs font-medium outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center justify-center gap-2 px-6 py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl sm:rounded-full whitespace-nowrap transition-all active:scale-95 shadow-sm ${
              selectedPrograms.length > 0
                ? 'bg-black text-white'
                : 'border border-emerald-500/20 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            <Filter size={14} /> {selectedPrograms.length > 0 ? `Filtered (${selectedPrograms.length})` : 'Advanced Filter'}
          </button>
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50"
              >
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Filter by Program</p>
                  {selectedPrograms.length > 0 && (
                    <button onClick={() => setSelectedPrograms([])} className="text-[8px] font-black uppercase tracking-widest text-indigo-600 hover:underline">Clear</button>
                  )}
                </div>
                <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                  {programTypes.length === 0 && (
                    <p className="text-[9px] text-slate-400 px-3 py-2">No programs available</p>
                  )}
                  {programTypes.map(program => (
                    <button
                      key={program}
                      onClick={() => toggleProgram(program)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        selectedPrograms.includes(program)
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedPrograms.includes(program) ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                        {selectedPrograms.includes(program) && <X size={10} className="text-white" />}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">{program}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredMentees.length === 0 ? (
          <EmptyState 
            title="No Mentees Found" 
            description="Your search criteria returned zero results, or you haven't authorized any mentees yet." 
            icon={Users} 
            className="border-none"
          />
        ) : (
          <>
            {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Trajectory Data</th>
                <th className="px-8 py-5">Program</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMentees.map((mentee) => (
                <tr key={mentee.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-sm group-hover:scale-105 transition-transform">
                        {mentee.user_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-slate-900 uppercase tracking-tight truncate">{mentee.user_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{mentee.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {mentee.mentor_type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                       <button onClick={() => onMessage(mentee.id)} className="p-2.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-full transition-all">
                          <MessageSquare size={18} />
                       </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === mentee.id ? null : mentee.id);
                          }} 
                          className={`p-2.5 rounded-full transition-all ${activeMenuId === mentee.id ? 'bg-slate-100 text-black' : 'text-slate-400 hover:text-black hover:bg-slate-100'}`}
                        >
                           <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === mentee.id && (
                            <motion.div
                              ref={menuContainerRef}
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-left"
                            >
                              <button
                                onClick={() => {
                                  setGoalsMentee(mentee);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Target size={16} />
                                View Goals
                              </button>
                              <button
                                onClick={() => {
                                  onRemove(mentee.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                                Delete Mentee
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredMentees.map((mentee) => (
            <div key={mentee.id} className="p-5 sm:p-6 space-y-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 bg-black text-white rounded-xl flex items-center justify-center font-black text-lg">
                    {mentee.user_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm truncate">{mentee.user_name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{mentee.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 relative">
                   <button onClick={() => onMessage(mentee.id)} className="p-2 text-slate-400 active:text-black active:bg-slate-200 rounded-full transition-colors">
                      <MessageSquare size={16} />
                   </button>
                   <div className="relative">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setActiveMenuId(activeMenuId === mentee.id ? null : mentee.id);
                       }} 
                       className={`p-2 rounded-full transition-colors ${activeMenuId === mentee.id ? 'bg-slate-200 text-black' : 'text-slate-400 active:text-black active:bg-slate-200'}`}
                     >
                        <MoreVertical size={16} />
                     </button>
                     
                      <AnimatePresence>
                         {activeMenuId === mentee.id && (
                           <motion.div
                             ref={menuContainerRef}
                             initial={{ opacity: 0, scale: 0.95, y: 10 }}
                             animate={{ opacity: 1, scale: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.95, y: 10 }}
                             className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-left"
                           >
                             <button
                               onClick={() => {
                                 setGoalsMentee(mentee);
                                 setActiveMenuId(null);
                               }}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-700 active:bg-slate-50 transition-colors"
                             >
                               <Target size={14} />
                               View Goals
                             </button>
                             <button
                               onClick={() => {
                                 onRemove(mentee.id);
                                 setActiveMenuId(null);
                               }}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-red-500 active:bg-red-50 transition-colors"
                             >
                               <Trash2 size={14} />
                               Delete Mentee
                             </button>
                           </motion.div>
                         )}
                       </AnimatePresence>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      <AnimatePresence>
        {goalsMentee && (
          <GoalsModal
            mentee={goalsMentee}
            onClose={() => setGoalsMentee(null)}
            onChat={(userId) => {
              setGoalsMentee(null);
              window.location.href = `/dashboard/chat`;
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
