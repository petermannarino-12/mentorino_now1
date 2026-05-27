import React from 'react';
import { TrendingUp } from 'lucide-react';

interface GrowthFeedStats {
  avgGoalClarity: string;
  sessionVelocity: string;
  retentionRate: string;
  successScore: string;
}

interface GrowthFeedProps {
  stats?: GrowthFeedStats;
}

const defaultStats: GrowthFeedStats = {
  avgGoalClarity: '—',
  sessionVelocity: '—',
  retentionRate: '—',
  successScore: '—'
};

const metricLabels: { key: keyof GrowthFeedStats; label: string }[] = [
  { key: 'avgGoalClarity', label: 'Avg. Goal Clarity' },
  { key: 'sessionVelocity', label: 'Session Velocity' },
  { key: 'retentionRate', label: 'Retention Rate' },
  { key: 'successScore', label: 'Success Score' }
];

export const GrowthFeed: React.FC<GrowthFeedProps> = ({ stats }) => {
  const s = stats || defaultStats;
  return (
    <div className="bg-black text-white p-6 sm:p-10 rounded-[32px] sm:rounded-[50px] relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none">
        <TrendingUp size={120} className="sm:size-[160px]" />
      </div>
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
        <div className="space-y-4 sm:space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mx-auto md:mx-0">
            Growth Intelligence
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-[0.9]">Mentees are reaching <br className="hidden sm:block" /> milestones 20% faster.</h3>
          <p className="text-white/40 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest leading-relaxed">System-wide performance increase due to new framework implementation.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {metricLabels.map((item, i) => (
            <div key={i} className="p-3 sm:p-6 bg-white/5 border border-white/10 rounded-xl sm:rounded-3xl backdrop-blur-sm">
              <p className="text-[6px] sm:text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5 sm:mb-1">{item.label}</p>
              <p className="text-base sm:text-xl font-black leading-none">{s[item.key]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
