
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Application } from '../types';
import SEO from '../components/SEO';
import { getNJISOString } from '../lib/dateUtils';
import { notifyError } from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';
import { useApplicationsQuery, useAddApplicationMutation } from '../hooks/useApplications';

interface ApplicationPageProps {
  // Compatibility props
  onApply?: any;
  existingApp?: any;
}

const ApplicationPage: React.FC<ApplicationPageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: applications } = useApplicationsQuery(user?.email || undefined);
  const addApplicationMutation = useAddApplicationMutation();

  const existingApp = applications?.find(a => 
    (a.user_id && a.user_id === user?.id) || 
    (a.user_email && user?.email && a.user_email.toLowerCase().trim() === user.email.toLowerCase().trim())
  );

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Form Fields
  const [mentorType, setMentorType] = useState('');
  const [name, setName] = useState('');
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [meetingPreference, setMeetingPreference] = useState<'Virtual' | 'In-Person' | 'Hybrid'>('Virtual');
  const [frequency, setFrequency] = useState('Weekly');
  const [goals, setGoals] = useState('');
  const [seriousness, setSeriousness] = useState(5);
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  
  const totalSteps = 4;

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (num: string) => /[\d]{7,}/.test(num);

  const validateFields = (currentStep: number): string | null => {
    switch (currentStep) {
      case 1:
        if (!mentorType) return "Please select a mentor type.";
        if (name.trim().length < 2) return "Please enter your full name.";
        if (!isValidEmail(email)) return "Please enter a valid email address.";
        if (!isValidPhone(phoneNumber)) return "Please enter a valid phone number.";
        return null;
      case 2:
        return null; // Meeting prefs are pre-selected
      case 3:
        if (goals.trim().length < 20) return "Please provide more detail about your goals (at least 20 characters).";
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateFields(step);
    if (error) {
      notifyError(error);
      return;
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    // Validate final step
    if (!agreed1 || !agreed2) {
      notifyError("Please agree to the commitment terms.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newApp: Application = {
        id: crypto.randomUUID(),
        user_name: name,
        user_email: email,
        user_phone: `${phoneCode} ${phoneNumber}`.trim(),
        mentor_type: mentorType,
        meeting_preference: meetingPreference,
        frequency,
        goals,
        seriousness,
        status: 'pending',
        created_at: getNJISOString(),
      };
      
      const result = await addApplicationMutation.mutateAsync(newApp) as any;
      if (result && result.error) {
        throw new Error(result.error);
      }
      setIsSubmitted(true);
    } catch (error: any) {
      notifyError(error.message || 'Failed to submit application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const countryCodes = [
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+1', country: 'CA', flag: '🇨🇦', label: 'Canada +1' },
    { code: '+44', country: 'GB', flag: '🇬🇧' },
    { code: '+61', country: 'AU', flag: '🇦🇺' },
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+49', country: 'DE', flag: '🇩🇪' },
    { code: '+33', country: 'FR', flag: '🇫🇷' },
    { code: '+81', country: 'JP', flag: '🇯🇵' },
    { code: '+86', country: 'CN', flag: '🇨🇳' },
    { code: '+55', country: 'BR', flag: '🇧🇷' },
    { code: '+52', country: 'MX', flag: '🇲🇽' },
    { code: '+234', country: 'NG', flag: '🇳🇬' },
    { code: '+27', country: 'ZA', flag: '🇿🇦' },
    { code: '+82', country: 'KR', flag: '🇰🇷' },
    { code: '+7', country: 'RU', flag: '🇷🇺' },
    { code: '+65', country: 'SG', flag: '🇸🇬' },
    { code: '+971', country: 'AE', flag: '🇦🇪' },
    { code: '+966', country: 'SA', flag: '🇸🇦' },
  ];

  if (isSubmitted || existingApp) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-xl">
          <CheckCircle2 size={40} className="sm:w-[48px] sm:h-[48px]" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 sm:mb-4 text-slate-900 uppercase tracking-tighter">Application Sent</h1>
        <p className="text-[10px] sm:text-sm md:text-lg text-slate-500 max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed font-medium">
          {(existingApp?.status === 'approved') 
            ? "Mentorino has accepted your application! Check your inbox for the welcome orientation."
            : "Mentorino is currently reviewing your intent. You will receive an automated response via email within 48 hours."}
        </p>
        <button 
          onClick={() => navigate('/')}
          className="btn-normal bg-black text-white px-8 sm:px-12 py-3.5 sm:py-5"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto py-6 sm:py-8 md:py-16 px-4">
      <SEO 
        title="Start Your Application" 
        description="Begin your journey with Mentorino. Complete the application to find your trajectory and get expert guidance."
      />
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 sm:mb-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white border border-black/[0.05] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all group"
      >
        <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-black group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">PROGRAM AUDIT • Step {step}</span>
          <span className="text-xs font-black text-black uppercase tracking-[0.2em]">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-1000 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 md:p-16 rounded-[32px] sm:rounded-[48px] md:rounded-[64px] border border-black/[0.03] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]">
        {step === 1 && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900">PROFILE & GOALS</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-black uppercase tracking-widest">Questions 1-4</p>
            </div>
            
            <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">1. What type of Mentor are you seeking?</label>
                <select 
                  value={mentorType} 
                  onChange={e => setMentorType(e.target.value)}
                  className="w-full px-4 py-3 sm:py-4 md:p-5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-3xl text-sm font-medium outline-none focus:border-black transition-all appearance-none" 
                >
                  <option value="" disabled>Select a mentor type...</option>
                  <option value="Career Strategist">Career Strategist</option>
                  <option value="Academic Guide">Academic Guide</option>
                  <option value="Research Mentor">Research Mentor</option>
                  <option value="Industry Expert">Industry Expert</option>
                  <option value="Life Coach">Life Coach</option>
                </select>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">2. Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 md:px-5 md:py-5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">3. Phone Number</label>
                  <div className="flex">
                    <select
                      value={phoneCode}
                      onChange={e => setPhoneCode(e.target.value)}
                      className="w-auto px-3 py-3 sm:py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-l-xl sm:rounded-l-3xl text-sm font-medium outline-none focus:border-black transition-all appearance-none cursor-pointer"
                    >
                      {countryCodes.map(cc => (
                        <option key={`${cc.code}-${cc.country}`} value={cc.code}>{cc.flag} {cc.code}</option>
                      ))}
                    </select>
                    <input 
                      type="tel" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="flex-1 min-w-0 px-4 py-3 sm:py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-r-xl sm:rounded-r-3xl text-sm font-medium outline-none focus:border-black transition-all -ml-px" 
                      placeholder="(555) 000-0000" 
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">4. Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 sm:py-4 md:pl-14 md:pr-5 md:py-5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-3xl text-sm font-medium outline-none focus:border-black transition-all" 
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900">MEETING PREF</h2>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Questions 5-6</p>
              <p className="text-xs text-slate-600 font-medium italic">Note: Your first meeting will be in person.</p>
            </div>
            
            <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4">
              <div className="space-y-3 sm:space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">5. What type of meeting would you prefer?</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {['Virtual', 'In-Person', 'Hybrid'].map((pref) => (
                    <button 
                      key={pref}
                      onClick={() => setMeetingPreference(pref as any)}
                      className={`
                        py-4 sm:py-5 rounded-2xl sm:rounded-3xl border transition-all text-xs font-black uppercase tracking-widest
                        ${meetingPreference === pref ? 'bg-black text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-black/10'}
                      `}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">6. Desired meeting frequency?</label>
                <select 
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                  className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl text-sm font-black uppercase tracking-[0.2em] outline-none focus:border-black appearance-none"
                >
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900">THE CORE</h2>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Questions 7-8</p>
            </div>
            
            <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col gap-1 ml-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">7. What is your main goal in working with a mentor?</label>
                  <p className="text-[10px] text-slate-400 font-bold uppercase italic tracking-widest">E.g., "I want to switch into tech..."</p>
                </div>
                <textarea 
                  value={goals}
                  onChange={e => setGoals(e.target.value)}
                  className="w-full p-5 sm:p-6 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-[32px] text-xs sm:text-sm font-medium outline-none focus:border-black transition-all min-h-[120px] sm:min-h-[160px] leading-relaxed" 
                  placeholder="Be specific about the clarity or achievement you are chasing..."
                ></textarea>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">8. How serious are you? (1-10)</label>
                  <span className="text-lg sm:text-xl font-black">{seriousness}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={seriousness}
                  onChange={e => setSeriousness(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-black cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  <span>Exploring</span>
                  <span>Extremely Serious</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900">COMMITMENT</h2>
              <p className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest">Final Audit Declaration</p>
            </div>
            
            <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                <div className="p-6 sm:p-8 bg-slate-50 rounded-[32px] sm:rounded-[40px] border border-slate-100 flex items-start gap-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => setAgreed1(!agreed1)}>
                <div className="mt-1">
                  <input type="checkbox" className="w-5 h-5 accent-black rounded-lg" checked={agreed1} onChange={() => setAgreed1(!agreed1)} required />
                </div>
                <p className="text-sm font-medium uppercase tracking-[0.05em] text-slate-700 leading-relaxed">
                  I understand that high-performance programs require 100% honesty and a willingness to be challenged by the guide.
                </p>
              </div>
              <div className="p-6 sm:p-8 bg-slate-50 rounded-[32px] sm:rounded-[40px] border border-slate-100 flex items-start gap-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                   onClick={() => setAgreed2(!agreed2)}>
                <div className="mt-1">
                  <input type="checkbox" className="w-5 h-5 accent-black rounded-lg" checked={agreed2} onChange={() => setAgreed2(!agreed2)} required />
                </div>
                <p className="text-sm font-medium uppercase tracking-[0.05em] text-slate-700 leading-relaxed">
                  I authorize Mentorino's office to communicate with me via the provided email and phone for session logistics.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 sm:mt-12 pt-6 sm:pt-10 border-t border-black/[0.02]">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] ${step === 1 ? 'opacity-20 pointer-events-none' : 'text-slate-400 hover:text-black'}`}
          >
            <ArrowLeft size={16} /> Back
          </button>
          {step < totalSteps ? (
            <button 
              onClick={nextStep}
              className="btn-compact bg-black text-white flex items-center gap-2"
            >
              Next Phase <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-compact bg-black text-white"
            >
              {isSubmitting ? 'SUBMITTING...' : 'Confirm Inquiry'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default ApplicationPage;
