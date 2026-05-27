import React from 'react';
import { Users, CalendarCheck } from 'lucide-react';

interface EngagementProps {
  activeMenteesCount: number;
  completedSessionsCount: number;
  onNavigate: (tab: string) => void;
}

export const Engagement: React.FC<EngagementProps> = ({ activeMenteesCount, completedSessionsCount, onNavigate }) => {
  return (
    <div className="space-y-4 sm:space-y-6 bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className="space-y-0.5 sm:space-y-1">
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Activity Overview</p>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase">Program Engagement</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <button 
          onClick={() => onNavigate('mentees')}
          className="bg-indigo-50/50 p-6 sm:p-8 rounded-[24px] sm:rounded-[28px] border border-indigo-100 flex items-center justify-between group text-left"
        >
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Active Mentees</p>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 leading-none">{activeMenteesCount}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Users className="text-indigo-600 sm:size-6" size={20} />
          </div>
        </button>
        <button 
          onClick={() => onNavigate('sessions')}
          className="bg-indigo-50/50 p-6 sm:p-8 rounded-[24px] sm:rounded-[28px] border border-indigo-100 flex items-center justify-between group text-left"
        >
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Completed Sessions</p>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 leading-none">{completedSessionsCount}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <CalendarCheck className="text-indigo-600 sm:size-6" size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};
