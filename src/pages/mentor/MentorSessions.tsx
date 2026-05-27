import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Booking } from '../../types';
import { formatToNJ } from '../../lib/dateUtils';

interface MentorSessionsProps {
  bookings: Booking[];
  onStartCall: (booking: Booking) => void;
  onUpdateOfficeHours: () => void;
}

export const MentorSessions: React.FC<MentorSessionsProps> = ({ bookings, onStartCall, onUpdateOfficeHours }) => {
  const mentorBookings = bookings.filter(b => b.status === 'upcoming');

  return (
    <div className="space-y-8">
      <div className="bg-black rounded-[32px] sm:rounded-[40px] md:rounded-[50px] p-6 sm:p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 sm:p-10 md:p-20 opacity-10 pointer-events-none">
          <Calendar size={120} className="sm:size-[180px] md:size-[220px]" />
        </div>
        <div className="relative z-10 space-y-3 sm:space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 uppercase tracking-[0.2em] text-[7px] sm:text-[8px] md:text-[9px] font-black">
            Executive Schedule
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">Your Live <br /> Engagement.</h2>
          <h1 className="text-white/40 text-[10px] sm:text-xs md:text-sm max-w-xs sm:max-w-md font-medium leading-relaxed">Manage your 1-on-1 strategy sessions with all active mentees globally.</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-4">
          <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-slate-400 px-4">Today & Upcoming</h3>
          <div className="space-y-3 sm:space-y-4">
            {mentorBookings.map(session => (
              <div key={session.id} className="bg-white p-5 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[32px] md:rounded-[40px] border border-black/[0.03] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 group hover:border-black/10 hover:shadow-xl hover:shadow-black/5 transition-all">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-50 text-black rounded-xl sm:rounded-2xl md:rounded-3xl flex flex-col items-center justify-center group-hover:bg-black group-hover:text-white transition-all shrink-0">
                    <span className="text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase mb-0.5 md:mb-1">{formatToNJ(session.date, { month: '2-digit' })}</span>
                    <span className="text-lg sm:text-xl md:text-2xl font-black leading-none">{formatToNJ(session.date, { day: '2-digit' })}</span>
                  </div>
                    <div className="min-w-0">
                    <h4 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-tight truncate">{session.user_name}</h4>
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 truncate">
                       <Clock size={10} className="sm:size-12" /> {session.time} • Strategy
                    </p>
                    {session.notes && (
                      <p className="text-[7px] sm:text-[8px] text-slate-400 italic truncate mt-1 border-l-2 border-slate-200 pl-2">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => onStartCall(session)} className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-black text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10">
                   Start Call
                </button>
              </div>
            ))}
            {mentorBookings.length === 0 && (
              <div className="p-12 sm:p-20 bg-slate-50 rounded-[28px] sm:rounded-[40px] text-center border-2 border-dashed border-slate-200">
                <Calendar size={32} className="mx-auto mb-4 text-slate-200 sm:size-12" />
                <p className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Clear Schedule</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[28px] sm:rounded-[32px] md:rounded-[40px] border border-black/[0.03] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8 h-fit shadow-sm">
           <div className="space-y-1 sm:space-y-2">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter">Availability</h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Timezone Sync Active</p>
           </div>
           
           <div className="space-y-3 sm:space-y-4">
              {['Monday', 'Wednesday', 'Friday'].map(day => (
                <div key={day} className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group">
                   <span className="text-[10px] sm:text-sm font-black uppercase truncate min-w-0 mr-2">{day}</span>
                   <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-white/50 px-2 py-0.5 rounded-lg border border-slate-200/50">09:00 - 17:00</span>
                      <div className="w-8 h-5 sm:w-10 sm:h-6 bg-emerald-500 rounded-full relative shrink-0 shadow-sm">
                         <div className="absolute right-0.5 sm:right-1 top-0.5 sm:top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <button onClick={onUpdateOfficeHours} className="w-full py-4 sm:py-5 border-2 border-black text-black text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all shadow-sm">
              Update Office Hours
           </button>
        </div>
      </div>
    </div>
  );
};
