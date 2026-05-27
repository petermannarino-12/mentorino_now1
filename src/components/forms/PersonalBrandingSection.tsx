import React from 'react';
import { User, Linkedin, FileText, MessageSquare, Shirt, Mic2 } from 'lucide-react';

type Mode = 'checklist' | 'inputs';

type Props = {
  mode: Mode;
  values: Record<string, string | boolean>;
  onChange: (field: string, value: string | boolean) => void;
  errors?: Record<string, string>;
};

const checklistItems = [
  { field: 'pb_card_creation', label: 'Business Card Creation', icon: User },
  { field: 'pb_linkedin_review', label: 'LinkedIn Optimization', icon: Linkedin },
  { field: 'pb_resume_review', label: 'Resume Finalization', icon: FileText },
  { field: 'pb_cover_letter', label: 'Cover Letter Template', icon: MessageSquare },
  { field: 'pb_dress_code', label: 'Professional Attire Set', icon: Shirt },
  { field: 'pb_greeting_intro', label: 'The 30s Elevator Intro', icon: Mic2 },
];

const PersonalBrandingSection: React.FC<Props> = ({ mode, values, onChange, errors = {} }) => {
  if (mode === 'checklist') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklistItems.map(item => (
          <button
            key={item.field}
            type="button"
            onClick={() => onChange(item.field, !values[item.field])}
            className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${
              values[item.field]
                ? 'bg-black text-white border-black shadow-xl shadow-black/10'
                : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <item.icon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              values[item.field] ? 'bg-white border-white' : 'border-slate-300'
            }`}>
              {values[item.field] && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital or Paper Card Creation</label>
        <input
          type="text"
          value={(values.pb_card_details as string) || ''}
          onChange={e => onChange('pb_card_details', e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
          placeholder="Card design or physical status..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">LinkedIn Review Inquiry</label>
        <input
          type="url"
          value={(values.pb_linkedin_url as string) || ''}
          onChange={e => onChange('pb_linkedin_url', e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
          placeholder="LinkedIn Profile URL..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Resume Review Link</label>
        <input
          type="url"
          value={(values.pb_resume_link as string) || ''}
          onChange={e => onChange('pb_resume_link', e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
          placeholder="Drive/Dropbox link..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Letter Draft</label>
        <input
          type="url"
          value={(values.pb_cover_letter_link as string) || ''}
          onChange={e => onChange('pb_cover_letter_link', e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
          placeholder="Shareable link..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Dress Code</label>
        <textarea
          value={(values.pb_dress_code_notes as string) || ''}
          onChange={e => onChange('pb_dress_code_notes', e.target.value)}
          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[100px]"
          placeholder="Dress code plan or consultation notes..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Greeting & Intro</label>
        <textarea
          value={(values.pb_greeting_intro_notes as string) || ''}
          onChange={e => onChange('pb_greeting_intro_notes', e.target.value)}
          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[100px]"
          placeholder="Your elevator pitch / intro draft..."
        />
      </div>
    </div>
  );
};

export default PersonalBrandingSection;
