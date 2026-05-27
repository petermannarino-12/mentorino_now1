import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, PlusCircle, LogOut, Users, X } from 'lucide-react';
import { NetworkEvent } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';

interface MentorEventsProps {
  events: NetworkEvent[];
  onAddEvent: (event: NetworkEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const MentorEvents: React.FC<MentorEventsProps> = ({ events, onAddEvent, onDeleteEvent }) => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<NetworkEvent>({
    id: '',
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    attendees: [],
    created_at: '',
    type: 'online'
  });

  const handleCreate = () => {
    onAddEvent({ ...newEvent, id: '' }); // Backend generates the ID
    setIsAddingEvent(false);
    setNewEvent({
      id: '',
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      attendees: [],
      created_at: '',
      type: 'online'
    });
  };

  useEffect(() => {
    if (!isAddingEvent) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsAddingEvent(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isAddingEvent]);

  if (events.length === 0 && !isAddingEvent) {
    return (
      <EmptyState 
        title="No Broadcasts Active" 
        description="Share a private strategy session or networking event with your mentee group." 
        icon={Calendar} 
        actionLabel="List Event"
        onAction={() => setIsAddingEvent(true)}
        className="mt-8"
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
         <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-slate-400">Networking Catalog</h2>
         <button 
          onClick={() => setIsAddingEvent(true)}
          className="w-full sm:w-auto justify-center px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
         >
           <PlusCircle size={14} /> Create Event
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] border border-black/[0.03] shadow-sm flex items-start justify-between gap-4 md:items-center group hover:shadow-md transition-all">
            <div className="flex items-start md:items-center gap-4 md:gap-6">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-black shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                <Calendar size={18} className="sm:size-6" />
              </div>
              <div className="min-w-0">
                 <h4 className="text-sm sm:text-lg font-black uppercase tracking-tight mb-0.5 sm:mb-1 leading-tight truncate">{event.title}</h4>
                 <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{event.date} @ {event.location}</p>
                 <p className="text-[8px] sm:text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1.5 sm:mt-2 flex items-center gap-2">
                   <Users size={12} /> {event.attendees.length} Students Attending
                 </p>
              </div>
            </div>
            <button 
              onClick={() => onDeleteEvent(event.id)}
              className="p-2 sm:p-3 text-slate-300 hover:text-rose-500 transition-colors shrink-0"
            >
              <LogOut className="rotate-180 sm:size-5" size={16} />
            </button>
          </div>
        ))}
        {events.length === 0 && (
          <div className="md:col-span-2 p-10 sm:p-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] sm:rounded-[50px]">
             <Calendar className="mx-auto text-slate-200 mb-4 sm:size-10" size={32} />
             <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">No events currently active</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAddingEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] shadow-2xl space-y-6 sm:space-y-8 overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-black">List Event</h3>
                <button onClick={() => setIsAddingEvent(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-black"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                  <input 
                    type="text" 
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="E.g. NY Tech Week Panel"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date" 
                      value={newEvent.date}
                      onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                    <input 
                      type="time" 
                      value={newEvent.time}
                      onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Location / Link</label>
                  <input 
                    type="text" 
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="E.g. Javits Center, NYC"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Context</label>
                  <textarea 
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="What should students prep for?"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black text-sm text-black min-h-[80px]"
                  />
                </div>
              </div>

              <button 
                onClick={handleCreate}
                className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                Publish Broadcast
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
