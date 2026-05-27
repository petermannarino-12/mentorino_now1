import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, MapPin, Calendar, Mail, Phone, Target, Star, Info, ArrowLeft } from 'lucide-react';
import { Application } from '../../src/types';
import { EmptyState } from '../../src/components/ui/EmptyState';

interface MentorApplicationsProps {
  pendingApplications: Application[];
  onAction: (id: string, action: 'approved' | 'rejected' | 'pending') => void;
}

export const MentorApplications: React.FC<MentorApplicationsProps> = ({ pendingApplications, onAction }) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    if (!selectedApp) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedApp(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedApp]);

  if (pendingApplications.length === 0) {
    return (
      <EmptyState 
        title="No Applications Pending" 
        description="Your funnel is perfectly synchronized. Check back later for new strategic queries." 
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
        {pendingApplications.map(app => (
          <div 
            key={app.id} 
            onClick={() => setSelectedApp(app)}
            className="bg-white p-5 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[32px] md:rounded-[40px] border border-black/[0.03] shadow-sm space-y-4 sm:space-y-6 flex flex-col hover:shadow-xl hover:border-black/10 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-lg md:text-xl group-hover:scale-110 transition-transform">
                {(app.user_name || '?').charAt(0)}
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-widest italic animate-pulse">New Lead</span>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight truncate">{app.user_name}</h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{app.user_email}</p>
              <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                 <div className="space-y-0.5 sm:space-y-1">
                   <p className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                     <Target size={8} /> Focus Area
                   </p>
                   <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-slate-900">{app.mentor_type}</p>
                 </div>
                 <div className="space-y-0.5 sm:space-y-1">
                   <p className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Star size={8} /> Growth Objective
                   </p>
                   <p className="text-[9px] sm:text-[10px] font-medium text-slate-600 leading-relaxed italic line-clamp-2">"{app.goals}"</p>
                 </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 mt-auto">
              <button 
                className="w-full py-3 bg-slate-50 text-slate-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] rounded-full group-hover:bg-black group-hover:text-white transition-all shadow-sm"
              >
                Review Strategy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Review Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] sm:rounded-[60px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Sidebar - Profile Summary */}
              <div className="w-full md:w-1/3 bg-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl font-black mb-8 border border-white/5">
                    {(selectedApp.user_name || '?').charAt(0)}
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{selectedApp.user_name}</h3>
                  <div className="space-y-4 pt-6">
                    <div className="flex items-center gap-3 text-white/40">
                      <Mail size={16} />
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate">{selectedApp.user_email}</p>
                    </div>
                    <div className="flex items-center gap-3 text-white/40">
                      <Phone size={16} />
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{selectedApp.user_phone}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-12 space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Commitment Grade</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-black">{selectedApp.seriousness}/10</p>
                      <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${selectedApp.seriousness * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white transition-colors py-4 text-[10px] font-black uppercase tracking-widest"
                  >
                    <ArrowLeft size={16} /> Minimize Audit
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-8 sm:p-12 md:p-16 overflow-y-auto flex flex-col">
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Application Deep-Dive</p>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 italic">Audit Inquiry.</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm group"
                  >
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <div className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Focus Strategy</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Target size={20} />
                        </div>
                        <p className="text-sm font-black uppercase text-slate-900">{selectedApp.mentor_type}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sync Preference</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                          <MapPin size={20} />
                        </div>
                        <p className="text-sm font-black uppercase text-slate-900">{selectedApp.meeting_preference}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Weekly Rhythm</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                          <Calendar size={20} />
                        </div>
                        <p className="text-sm font-black uppercase text-slate-900">{selectedApp.frequency}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Growth Velocity</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                          <Star size={20} />
                        </div>
                        <p className="text-sm font-black uppercase text-slate-900">{selectedApp.seriousness > 7 ? 'High Intent' : 'Standard'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-8 sm:p-10 rounded-[32px] sm:rounded-[40px] space-y-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Info size={16} className="text-slate-400" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategy Disclosure</p>
                    </div>
                    <blockquote className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed italic">
                      "{selectedApp.goals}"
                    </blockquote>
                  </div>

                  <div className="flex gap-4 pt-8">
                    <button 
                      onClick={() => {
                        onAction(selectedApp.id, 'rejected');
                        setSelectedApp(null);
                      }} 
                      className="flex-1 py-5 sm:py-6 border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95"
                    >
                      Pass on Application
                    </button>
                    <button 
                      onClick={() => {
                        onAction(selectedApp.id, 'approved');
                        setSelectedApp(null);
                      }} 
                      className="flex-1 py-5 sm:py-6 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
                    >
                      Authorize Access
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
