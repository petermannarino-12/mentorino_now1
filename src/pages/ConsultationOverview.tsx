import React, { useState } from 'react';
import { Calendar, Clock, Star, ArrowRight, Video, ArrowLeft, XCircle, CheckCircle2, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { enquiryService } from '../services/enquiryService';

const ConsultationOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState<'free_intro_call' | 'rapid_response_call' | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenForm = (type: 'free_intro_call' | 'rapid_response_call') => {
    setShowForm(type);
    setSubmitted(false);
    setFormError('');
  };

  const handleCloseForm = () => {
    setShowForm(null);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setSubmitted(false);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setSubmitting(true);
    const { error } = await enquiryService.submit({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      service_type: showForm!,
      message: formData.message.trim() || undefined,
    });
    setSubmitting(false);
    if (error) {
      setFormError(error);
    } else {
      setSubmitted(true);
    }
  };

  const serviceLabel = showForm === 'free_intro_call' ? 'Free Program Introduction Call' : 'Rapid Response Call Booking';

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in duration-700">
      <SEO 
        title="Consultation Overview" 
        description="Explore Mentorino's consultation options — the 60-Minute Audit and 90-Minute Deep Dive for strategic guidance."
      />
      <button 
        onClick={() => navigate(-1)}
        className="mb-12 flex items-center justify-center w-12 h-12 bg-white border border-black/[0.05] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all group"
      >
        <ArrowLeft size={20} className="text-black group-hover:-translate-x-1 transition-transform" />
      </button>

      <header className="mb-20 text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">1:1 <br /><span className="text-slate-300">Consultation.</span></h1>
        <p className="text-slate-500 text-xl font-medium max-w-xl mx-auto">A high-impact, focused session designed to solve one specific problem with zero fluff.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        <div className="bg-white p-10 rounded-[48px] border border-black/[0.03] space-y-6 shadow-sm hover:border-black/10 transition-all flex flex-col">
          <div className="p-4 bg-slate-50 w-fit rounded-2xl text-black"><Video size={24} /></div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight">Free Program Introduction Call</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">A free 20-30 minute introductory call designed to help prospective participants understand the program, discuss their goals, ask questions, and determine whether the program is the right fit for them. No commitment required.</p>
          </div>
          <ul className="space-y-3">
            {["Understand the program structure", "Discuss goals and challenges", "Get answers to questions", "Explore program fit", "No commitment required"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <CheckCircle2 size={14} className="text-indigo-500" />
                {item}
              </li>
            ))}
          </ul>
          <div className="pt-4 mt-auto">
            <p className="text-3xl font-black">Free</p>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">No commitment</p>
          </div>
          <div className="pt-4">
            <button onClick={() => handleOpenForm('free_intro_call')} className="btn-normal w-full bg-slate-950 text-white hover:bg-black">
              Book Free Call
            </button>
          </div>
        </div>
        <div className="bg-black text-white p-10 rounded-[48px] space-y-6 shadow-2xl relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Star size={80} /></div>
          <div className="p-4 bg-white/10 w-fit rounded-2xl text-white"><Star size={24} /></div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tight">Rapid Response Call Booking</h3>
            <p className="text-white/40 text-sm leading-relaxed font-medium">Need quick guidance or answers to pressing questions? Book a rapid response call and get direct support within a short timeframe.</p>
          </div>
          <ul className="space-y-3 relative z-10">
            {["Urgent academic or career-related questions", "Program guidance and clarification", "Quick feedback on decisions", "Personalized advice", "Fast response and scheduling"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/50">
                <Star size={14} className="text-indigo-400" />
                {item}
              </li>
            ))}
          </ul>
          <div className="pt-4 mt-auto relative z-10">
            <p className="text-3xl font-black text-emerald-400">$25</p>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Priority Booking</p>
          </div>
          <div className="pt-4 relative z-10">
            <button onClick={() => handleOpenForm('rapid_response_call')} className="btn-normal w-full bg-white text-black hover:scale-105">
              Book Rapid Response Call
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-12">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-center">What's Included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { title: 'Secure Video Call', icon: Video, desc: 'Private, encrypted 1:1 video session via our platform.' },
            { title: 'Action Trajectory', icon: Star, desc: 'A custom-built step-by-step PDF of what to do next.' },
            { title: 'Follow-up Email', icon: Calendar, desc: 'Direct access for one follow-up question post-session.' },
            { title: 'Resource Access', icon: ArrowRight, desc: 'Complementary access to one relevant store asset.' }
          ].map((f, i) => (
            <div key={i} className="flex gap-4 p-8 bg-white border border-black/[0.03] rounded-[32px] shadow-sm hover:bg-slate-50 transition-colors">
              <div className="shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm"><f.icon size={18} /></div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight mb-1">{f.title}</h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-24 bg-slate-900 text-white p-12 md:p-20 rounded-[60px] text-center space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>
        <h2 className="text-3xl font-black uppercase tracking-tighter relative z-10">Ready to Solve It?</h2>
        <p className="text-white/40 max-w-md mx-auto font-medium leading-relaxed relative z-10">
          Note: You must have an approved application to book. Apply first, then book your slot once approved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <Link to="/apply" className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:scale-105 transition-all shadow-xl">
            Apply First
          </Link>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500">
            <button onClick={handleCloseForm} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
              <XCircle size={20} className="text-slate-400" />
            </button>
            {submitted ? (
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Request Submitted</h2>
                  <p className="text-sm text-slate-500 font-medium">Thank you, {formData.name}! We have received your enquiry for the <strong>{serviceLabel}</strong>. We will get back to you shortly.</p>
                </div>
                <button onClick={handleCloseForm} className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-slate-800 transition-all">
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto"><Calendar size={32} /></div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Book Your Call</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{serviceLabel}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all outline-none"
                      placeholder="John Doe" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Email *</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all outline-none"
                      placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all outline-none"
                      placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Message (optional)</label>
                    <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all outline-none min-h-[80px]"
                      placeholder="Any questions or details..." />
                  </div>
                  {formError && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{formError}</p>
                  )}
                  <button type="submit" disabled={submitting}
                    className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {submitting && <Loader size={14} className="animate-spin" />}
                    {submitting ? 'Submitting...' : `Submit ${showForm === 'free_intro_call' ? 'Free Call Request' : 'Booking Request'}`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationOverviewPage;
