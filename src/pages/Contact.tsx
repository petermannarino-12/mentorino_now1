import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Globe, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneCode: '+1',
    subject: 'Program Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, phone: `${formData.phoneCode} ${formData.phone}`.trim() };
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Message failure');
      
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const countryCodes = [
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+1', country: 'CA', flag: '🇨🇦' },
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

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Message Sent.</h2>
        <p className="text-slate-400 font-medium max-w-xs mx-auto">Mentorino reviews all inquiries personally. Expect a response within 48 hours.</p>
        <div className="flex gap-4 mt-10">
          <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">Dashboard</button>
          <button onClick={() => setSubmitted(false)} className="px-8 py-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest rounded-full">Send Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-16 px-4 sm:px-6 animate-in fade-in duration-700">
      <SEO 
        title="Contact Us" 
        description="Get in touch with Mentorino's team for program inquiries, consultation questions, or technical support."
      />
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 sm:mb-12 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white border border-black/[0.05] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all group"
      >
        <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-black group-hover:-translate-x-1 transition-transform" />
      </button>

      <header className="mb-12 sm:mb-20 space-y-4 sm:space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Reach <br /><span className="text-slate-300 font-black">Out.</span></h1>
        <p className="text-slate-500 text-base sm:text-xl font-medium max-w-xl">Start the conversation here.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
        <div className="space-y-8 sm:space-y-12">
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 border-b border-black/[0.03] pb-4">Contact Details</h3>
            <div className="space-y-4 sm:space-y-6">
              {[
                { icon: Mail, label: 'Inquiry', val: 'peter@mentorino.me' },
                { icon: MessageSquare, label: 'Support', val: 'support@mentorino.me' },
                { icon: Globe, label: 'Location', val: 'Global (Online Only)' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 sm:gap-6 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-black/[0.03] rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shadow-sm"><item.icon size={16} className="sm:w-[18px] sm:h-[18px]" /></div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5 sm:mb-1">{item.label}</p>
                    <p className="text-xs sm:text-sm font-black uppercase tracking-tight">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-slate-900 text-white rounded-[32px] sm:rounded-[48px] space-y-4 sm:space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-5"><MessageSquare size={80} className="sm:w-[100px] sm:h-[100px]" /></div>
            <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight relative z-10">Serious Inquiries Only</h4>
            <p className="text-white/40 text-[10px] sm:text-xs font-semibold leading-relaxed relative z-10">Mentorino prioritizes requests that show clarity, professional intent, and research.</p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[40px] sm:rounded-[60px] border border-black/[0.03] shadow-sm">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="contact-name" className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                <input id="contact-name" required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl text-sm font-medium focus:bg-white focus:border-black outline-none transition-all" placeholder="John Doe" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="contact-email" className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input id="contact-email" required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl text-sm font-medium focus:bg-white focus:border-black outline-none transition-all" placeholder="name@example.com" />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="contact-phone" className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="flex">
                <select
                  value={formData.phoneCode}
                  onChange={e => setFormData({...formData, phoneCode: e.target.value})}
                  className="w-auto px-3 py-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl rounded-r-none text-sm font-medium outline-none focus:border-black transition-all appearance-none cursor-pointer"
                >
                  {countryCodes.map(cc => (
                    <option key={`${cc.code}-${cc.country}`} value={cc.code}>{cc.flag} {cc.code}</option>
                  ))}
                </select>
                <input id="contact-phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex-1 min-w-0 p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl rounded-l-none text-sm font-medium focus:bg-white focus:border-black outline-none transition-all -ml-px" placeholder="(555) 000-0000" />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="contact-subject" className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <select id="contact-subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-black outline-none transition-all appearance-none">
                <option>Program Inquiry</option>
                <option>Consultation Question</option>
                <option>Technical Support</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="contact-message" className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
              <textarea id="contact-message" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl text-sm font-medium focus:bg-white focus:border-black outline-none transition-all min-h-[120px] sm:min-h-[150px]" placeholder="Tell us how we can help..."></textarea>
            </div>
            <button 
              disabled={isSubmitting}
              className="btn-normal w-full py-4 sm:py-6 bg-black text-white"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Send Message <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;