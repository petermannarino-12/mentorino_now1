import React from 'react';
import { Booking, TaskActivity } from '../../types';
import { Calendar, Activity } from 'lucide-react';

interface ActivitySnapshotProps {
  upcomingBookings: Booking[];
  recentActivities: TaskActivity[];
  onNavigate: (tab: string) => void;
}

export const ActivitySnapshot: React.FC<ActivitySnapshotProps> = ({ upcomingBookings, recentActivities, onNavigate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
      <button 
        onClick={() => onNavigate('sessions')}
        className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md text-left w-full"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="text-indigo-600" size={16} />
            </div>
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 leading-none">Upcoming Sessions</h3>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600">View All</span>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {upcomingBookings.slice(0, 3).map(booking => (
            <div key={booking.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl hover:bg-indigo-50/30 transition-colors">
              <p className="text-xs sm:text-sm font-black text-slate-900">{booking.user_name}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">{booking.time}</p>
            </div>
          ))}
          {upcomingBookings.length === 0 && (
            <div className="py-6 sm:py-8 text-center bg-slate-50 rounded-xl sm:rounded-2xl">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">No upcoming sessions</p>
            </div>
          )}
        </div>
      </button>

      <button 
        onClick={() => onNavigate('reviews')}
        className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md text-left w-full"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Activity className="text-indigo-600" size={16} />
            </div>
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 leading-none">Recent Activity</h3>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600">View All</span>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {recentActivities.slice(0, 3).map(activity => (
            <div key={activity.id} className="flex items-center gap-3 sm:gap-4 group">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full group-hover:scale-150 transition-transform shrink-0"></span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-black text-slate-900 leading-none mb-1 truncate">{activity.user_name}</p>
                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono truncate">Submitted Task Review</p>
              </div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="py-6 sm:py-8 text-center bg-slate-50 rounded-xl sm:rounded-2xl">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">No recent activity</p>
            </div>
          )}
        </div>
      </button>
    </div>
  );
};
