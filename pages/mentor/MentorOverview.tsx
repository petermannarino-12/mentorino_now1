import React from 'react';
import { motion } from 'motion/react';
import { Statistics } from '../../src/components/mentor/Statistics';
import { Engagement } from '../../src/components/mentor/Engagement';
import { ActivitySnapshot } from '../../src/components/mentor/ActivitySnapshot';
import { GrowthFeed } from '../../src/components/mentor/GrowthFeed';
import { PendingActions } from '../../src/components/mentor/PendingActions';
import { Application, Booking, TaskActivity } from '../../src/types';
import { Users, Calendar, CheckCircle, LogOut } from 'lucide-react';

interface MentorOverviewProps {
  applications: Application[];
  bookings: Booking[];
  tasks: TaskActivity[];
  onReviewTask: (task: TaskActivity) => void;
  onApplicationAction: (id: string, action: 'approved' | 'rejected') => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const MentorOverview: React.FC<MentorOverviewProps> = ({
  applications,
  bookings,
  tasks,
  onReviewTask,
  onApplicationAction,
  onNavigate,
  onLogout
}) => {
  const mentees = applications.filter(app => app.status === 'approved');
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const mentorBookings = bookings.filter(b => b.status === 'upcoming');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const stats = [
    { label: 'Active Mentees', value: mentees.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Upcoming Sessions', value: mentorBookings.length, icon: Calendar, color: 'bg-emerald-500' },
    { label: 'Pending Reviews', value: pendingTasks.length, icon: CheckCircle, color: 'bg-purple-500' },
  ];

  const avgSeriousness = applications.length
    ? applications.reduce((sum, a) => sum + (a.seriousness || 0), 0) / applications.length
    : 0;
  const totalBookings = mentorBookings.length + completedBookings.length;
  const velocity = totalBookings > 0
    ? Math.round((mentorBookings.length / totalBookings) * 100)
    : 0;
  const retentionRate = mentees.length > 0
    ? Math.round((mentees.filter(m => m.status === 'approved').length / applications.filter(a => a.status === 'approved' || a.status === 'pending').length) * 100)
    : 0;
  const compositeScore = avgSeriousness > 7 ? 'A+' : avgSeriousness > 5 ? 'A' : 'B';

  const growthStats = {
    avgGoalClarity: `${avgSeriousness.toFixed(1)}/10`,
    sessionVelocity: `+${velocity}%`,
    retentionRate: `${retentionRate}%`,
    successScore: compositeScore
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-10"
    >
      <Statistics stats={stats} pendingApplicationsCount={pendingApplications.length} onNavigate={onNavigate} />

      <PendingActions 
        pendingTasks={pendingTasks}
        pendingApplications={pendingApplications}
        onReviewTask={onReviewTask}
        onApplicationAction={onApplicationAction}
        onViewTasks={() => onNavigate('reviews')}
        onViewApplications={() => onNavigate('audits')}
      />

      <Engagement activeMenteesCount={mentees.length} completedSessionsCount={bookings.filter(b => b.status === 'completed').length || 0} onNavigate={onNavigate} />

      <ActivitySnapshot upcomingBookings={mentorBookings} recentActivities={tasks} onNavigate={onNavigate} />

      <GrowthFeed stats={growthStats} />

      <div className="lg:hidden pt-10 pb-20 sm:pb-0 flex flex-col items-center gap-4">
        <div className="w-px h-12 bg-black/[0.05]"></div>
        <button 
          onClick={onLogout}
          className="group flex flex-col items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="w-12 h-12 rounded-full border border-rose-100 bg-rose-50/50 flex items-center justify-center text-rose-500 transition-all group-hover:bg-rose-100 group-hover:scale-110">
            <LogOut size={20} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 group-hover:text-rose-500 transition-colors">Terminate Session</p>
        </button>
      </div>
    </motion.div>
  );
};
