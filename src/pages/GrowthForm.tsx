import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  ArrowRight,
  User,
  Linkedin,
  FileText,
  Shirt,
  MessageSquare,
  Map,
  Mic2,
  Save,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { TaskActivity, User as UserType } from '../types';
import { getNJISOString } from '../lib/dateUtils';
import { validationService } from '../services/validationService';
import PersonalBrandingSection from '../components/forms/PersonalBrandingSection';
import { Toaster, toast } from 'sonner';

const GrowthForm = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Record<string, string | boolean>>({
    pb_card_creation: false,
    pb_linkedin_review: false,
    pb_resume_review: false,
    pb_cover_letter: false,
    pb_dress_code: false,
    pb_greeting_intro: false,
    roadmap_topic: '',
    interview_recommendation: '',
    status: 'pending'
  });

  useEffect(() => {
    const fetchUserAndActivity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      const token = session.access_token;
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const profileRes = await fetch(`/api/profiles?id=${session.user.id}`, { headers: authHeaders });
      if (!profileRes.ok) {
        navigate('/auth');
        return;
      }
      const profile = await profileRes.json();
      if (profile.role === 'visitor') {
        navigate('/auth');
        return;
      }

      const user: UserType = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at
      };

      setCurrentUser(user);

      const actRes = await fetch(`/api/task-activities?userId=${user.id}`, { headers: authHeaders });
      const activities = await actRes.json();
      const existingActivity = Array.isArray(activities) && activities.length > 0 ? activities[0] : null;
      if (existingActivity) {
        const loaded: Record<string, string | boolean> = {};
        Object.keys(existingActivity).forEach(k => {
          loaded[k] = existingActivity[k];
        });
        setFormData(prev => ({ ...prev, ...loaded }));
      }
    };

    fetchUserAndActivity();
  }, [navigate]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const validationErrors = validationService.validateEntity('TaskActivity', formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Strategic audit contains validation errors.');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const activityData: Partial<TaskActivity> = {
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      status: 'pending',
      net_attended_event: '',
      net_people_met: '',
      net_contact_info: '',
      net_panel_summary: '',
      pw_introduction: '',
      pw_volunteer_hours: '',
      cert_topic: '',
      ...formData as any,
    };

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/task-activities', {
        method: 'POST',
        headers,
        body: JSON.stringify(activityData),
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error('Failed to save. Please try again.');
      return;
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <Loader2 size={32} className="animate-spin text-slate-300" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#FAFAFA]">
      <SEO 
        title="Growth Strategy" 
        description="Submit your growth strategy to Mentorino. Share your personal branding, networking, and career roadmap details."
      />
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Step 2: Growth Strategy</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-black">
              Career <span className="text-slate-300">Architecture.</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl">
               This form establishes your professional foundation. Complete these sections to prepare for Mentorino's review and strategic feedback.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white p-10 rounded-[48px] border border-black/[0.03] shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Linkedin size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Personal Branding</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Visibility & Identity</p>
                </div>
              </div>

              <PersonalBrandingSection
                mode="checklist"
                values={formData}
                onChange={handleChange}
                errors={errors}
              />
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-black/[0.03] shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Map size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Career Roadmap</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Strategy & Direction</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PRIMARY CAREER TOPIC/GOAL</label>
                <textarea
                  value={formData.roadmap_topic as string || ''}
                  onChange={(e) => handleInputChange('roadmap_topic', e.target.value)}
                  placeholder="Describe your 12-month career objective and the specific role you are targeting..."
                  className={`w-full p-8 bg-slate-50 border rounded-[32px] text-sm font-medium focus:bg-white focus:border-black transition-all min-h-[150px] ${errors.roadmap_topic ? 'border-red-500 bg-red-50/50' : 'border-slate-100'}`}
                  required
                />
                {errors.roadmap_topic && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                    <AlertCircle size={12} /> {errors.roadmap_topic}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-black/[0.03] shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Mic2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Interview Mastery</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">The Recommendation Process</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">INTERVIEW PREPARATION NOTES</label>
                <textarea
                  value={formData.interview_recommendation as string || ''}
                  onChange={(e) => handleInputChange('interview_recommendation', e.target.value)}
                  placeholder="Summarize your progress with the recommendation process and any specific hurdles in interview prep..."
                  className={`w-full p-8 bg-slate-50 border rounded-[32px] text-sm font-medium focus:bg-white focus:border-black transition-all min-h-[150px] ${errors.interview_recommendation ? 'border-red-500 bg-red-50/50' : 'border-slate-100'}`}
                  required
                />
                {errors.interview_recommendation && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                    <AlertCircle size={12} /> {errors.interview_recommendation}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-8">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
              >
                Cancel & Return
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={`flex items-center gap-3 px-12 py-6 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                  isSuccess
                    ? 'bg-emerald-500 text-white'
                    : 'bg-black text-white hover:scale-105 active:scale-95 shadow-2xl shadow-black/20'
                }`}
              >
                {isSubmitting ? (
                  <>Saving Strategy...</>
                ) : isSuccess ? (
                  <><Check size={16} /> Saved Successfully</>
                ) : (
                  <>Submit for Review <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default GrowthForm;
