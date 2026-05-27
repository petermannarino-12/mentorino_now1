import React from 'react';
import { LucideIcon, UserPlus } from 'lucide-react';

interface Stat {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

interface StatisticsProps {
  stats: Stat[];
  pendingApplicationsCount: number;
  onNavigate: (tab: string) => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ stats, pendingApplicationsCount, onNavigate }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
      <button 
        onClick={() => onNavigate('audits')}
        className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group text-left"
      >
        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
          <UserPlus className="text-indigo-600 sm:size-5" size={18} />
        </div>
        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">New Apps</p>
        <p className="text-xl sm:text-3xl font-black text-slate-900 leading-none">{pendingApplicationsCount}</p>
      </button>

      {stats.map((stat, i) => (
        <button 
          key={i} 
          onClick={() => {
            const tab = stat.label === 'Active Mentees' ? 'mentees' : 
                        stat.label === 'Upcoming Sessions' ? 'sessions' : 'reviews';
            onNavigate(tab);
          }}
          className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group text-left"
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
            <stat.icon className="text-indigo-600 sm:size-5" size={18} />
          </div>
          <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">{stat.label === 'Active Mentees' ? 'Mentees' : stat.label === 'Upcoming Sessions' ? 'Sessions' : 'Reviews'}</p>
          <p className="text-xl sm:text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
        </button>
      ))}
    </div>
  );
};
