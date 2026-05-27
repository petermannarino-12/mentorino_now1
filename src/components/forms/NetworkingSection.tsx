import React from 'react';
import { Users } from 'lucide-react';

type Props = {
  attended_event: string;
  people_met: string;
  contact_info: string;
  panel_summary: string;
  onChange: (field: string, value: string) => void;
  isRequired?: boolean;
};

const NetworkingSection: React.FC<Props> = ({ attended_event, people_met, contact_info, panel_summary, onChange, isRequired }) => (
  <div className="space-y-8">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Users size={20} /></div>
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter">Networking Feedback</h3>
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Connect & Summarize</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Attend an event</label>
        <input
          type="text"
          value={attended_event}
          onChange={e => onChange('attended_event', e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
          placeholder="Event name..."
          required={isRequired}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Meet at least one person</label>
        <input
          type="text"
          value={people_met}
          onChange={e => onChange('people_met', e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
          placeholder="Person's name..."
          required={isRequired}
        />
      </div>
      <div className="md:col-span-2 space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Submit contact info for who met</label>
        <input
          type="text"
          value={contact_info}
          onChange={e => onChange('contact_info', e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
          placeholder="Email/LinkedIn/Phone..."
          required={isRequired}
        />
      </div>
      <div className="md:col-span-2 space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Summarize which panel topic you enjoyed and why</label>
        <textarea
          value={panel_summary}
          onChange={e => onChange('panel_summary', e.target.value)}
          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[120px]"
          placeholder="Your takeaways..."
          required={isRequired}
        />
      </div>
    </div>
  </div>
);

export default NetworkingSection;
