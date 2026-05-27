import React, { useState } from 'react';
import { Target, User, Users, GraduationCap, Compass, Send, CheckCircle2 } from 'lucide-react';
import { TaskActivity } from '../types';
import { validationService } from '../services/validationService';
import PersonalBrandingSection from './forms/PersonalBrandingSection';
import NetworkingSection from './forms/NetworkingSection';

interface TaskActivityFormProps {
  onSubmit: (activity: Omit<TaskActivity, 'id' | 'user_id' | 'user_name' | 'status' | 'created_at'>) => Promise<void>;
  isNetworkingOnly?: boolean;
  isBrandingOnly?: boolean;
  defaultEventName?: string;
}

const TaskActivityForm: React.FC<TaskActivityFormProps> = ({ onSubmit, isNetworkingOnly, isBrandingOnly, defaultEventName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [pb, setPb] = useState({
    card_details: '',
    linkedin_url: '',
    resume_link: '',
    cover_letter_link: '',
    dress_code_notes: '',
    greeting_intro_notes: ''
  });

  const [net, setNet] = useState({
    attended_event: defaultEventName || '',
    people_met: '',
    contact_info: '',
    panel_summary: ''
  });

  const [pw, setPw] = useState({
    introduction: '',
    volunteer_hours: ''
  });

  const [certTopic, setCertTopic] = useState('');
  const [roadmapTopic, setRoadmapTopic] = useState('');
  const [interviewRec, setInterviewRec] = useState('');

  const pbValues = {
    pb_card_details: pb.card_details,
    pb_linkedin_url: pb.linkedin_url,
    pb_resume_link: pb.resume_link,
    pb_cover_letter_link: pb.cover_letter_link,
    pb_dress_code_notes: pb.dress_code_notes,
    pb_greeting_intro_notes: pb.greeting_intro_notes,
  };

  const handlePbChange = (field: string, value: string | boolean) => {
    const map: Record<string, keyof typeof pb> = {
      pb_card_details: 'card_details',
      pb_linkedin_url: 'linkedin_url',
      pb_resume_link: 'resume_link',
      pb_cover_letter_link: 'cover_letter_link',
      pb_dress_code_notes: 'dress_code_notes',
      pb_greeting_intro_notes: 'greeting_intro_notes',
    };
    const key = map[field];
    if (key) setPb(prev => ({ ...prev, [key]: value as string }));
  };

  const handleNetChange = (field: string, value: string) => {
    setNet(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData: Partial<TaskActivity> = {
      pb_card_details: pb.card_details,
      pb_linkedin_url: pb.linkedin_url,
      pb_resume_link: pb.resume_link,
      pb_cover_letter_link: pb.cover_letter_link,
      pb_dress_code_notes: pb.dress_code_notes,
      pb_greeting_intro_notes: pb.greeting_intro_notes,
      net_attended_event: net.attended_event,
      net_people_met: net.people_met,
      net_contact_info: net.contact_info,
      net_panel_summary: net.panel_summary,
      pw_introduction: pw.introduction,
      pw_volunteer_hours: pw.volunteer_hours,
      cert_topic: certTopic,
      roadmap_topic: roadmapTopic,
      interview_recommendation: interviewRec,
    };

    const validationErrors = validationService.validateEntity('TaskActivity', formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    setErrors({});

    try {
      await onSubmit(formData as Omit<TaskActivity, 'id' | 'user_id' | 'user_name' | 'status' | 'created_at'>);
      setIsSuccess(true);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[40px] text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-emerald-900">Task List Submitted</h3>
        <p className="text-emerald-700/70 font-medium max-w-sm mx-auto">Your activity list has been sent to Mentorino for review. You will receive feedback shortly.</p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 px-10 py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-emerald-700 transition-all shadow-lg"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {(!isNetworkingOnly || isBrandingOnly) && (
        <>
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><User size={20} /></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Personal Branding</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Digital Presence & Presentation</p>
              </div>
            </div>
            <PersonalBrandingSection
              mode="inputs"
              values={pbValues}
              onChange={handlePbChange}
              errors={errors}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Compass size={20} /></div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Career Roadmap</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">(Add the topic only)</label>
                <input
                  type="text"
                  value={roadmapTopic}
                  onChange={e => setRoadmapTopic(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
                  placeholder="Roadmap target topic..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Target size={20} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Interview Prep</h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Recommendation process</p>
                </div>
              </div>
              <div className="space-y-2">
                <textarea
                  value={interviewRec}
                  onChange={e => setInterviewRec(e.target.value)}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[100px]"
                  placeholder="Details on recommendations or prep status..."
                />
              </div>
            </div>
          </div>
        </>
      )}

      {!isBrandingOnly && (
        <div className="pt-6">
          <NetworkingSection
            attended_event={net.attended_event}
            people_met={net.people_met}
            contact_info={net.contact_info}
            panel_summary={net.panel_summary}
            onChange={handleNetChange}
            isRequired={isNetworkingOnly}
          />
        </div>
      )}

      {(!isNetworkingOnly && !isBrandingOnly) && (
        <>
          <div className="space-y-8 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Users size={20} /></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Partner Work</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Collaborations & volunteering</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Introduce someone from the event to your peer</label>
                <input
                  type="text"
                  value={pw.introduction}
                  onChange={e => setPw({ ...pw, introduction: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
                  placeholder="Who did you introduce?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Volunteer hours</label>
                <input
                  type="text"
                  value={pw.volunteer_hours}
                  onChange={e => setPw({ ...pw, volunteer_hours: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
                  placeholder="e.g. 5 hours"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><GraduationCap size={20} /></div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Certification Planning</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">(Add the topic only)</label>
                <input
                  type="text"
                  value={certTopic}
                  onChange={e => setCertTopic(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
                  placeholder="Topic only..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Compass size={20} /></div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Career Roadmap</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">(Add the topic only)</label>
                <input
                  type="text"
                  value={roadmapTopic}
                  onChange={e => setRoadmapTopic(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-black transition-all"
                  placeholder="Topic only..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><Target size={20} /></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Interview prep</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Next steps preparation</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Recommendation process</label>
              <textarea
                value={interviewRec}
                onChange={e => setInterviewRec(e.target.value)}
                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:border-black transition-all min-h-[100px]"
                placeholder="Details..."
              />
            </div>
          </div>
        </>
      )}

      <div className="pt-10">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-6 bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-4"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>{isBrandingOnly ? 'SUBMIT BRANDING PROFILE' : isNetworkingOnly ? 'SUBMIT NETWORKING REPORT' : 'SUBMIT FOR AUDIT'} <Send size={18} /></>
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskActivityForm;
