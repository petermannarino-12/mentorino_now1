import React, { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Loader, XCircle } from 'lucide-react';
import Hls from 'hls.js';
import { enquiryService } from '../services/enquiryService';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = memo(({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: Hls | null = null;

    if (videoRef.current) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().catch(() => {/* Ignore autoplay failure */});
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current?.play().catch(() => {/* Ignore autoplay failure */});
        });
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      muted
      loop
      playsInline
      autoPlay
    />
  );
});

VideoPlayer.displayName = 'VideoPlayer';

const SynapseSection: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const handleOpenForm = () => {
    setShowForm(true);
    setSubmitted(false);
    setFormError('');
  };

  const handleCloseForm = () => {
    setShowForm(false);
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
      service_type: 'free_intro_call',
      message: formData.message.trim() || undefined,
    });
    setSubmitting(false);
    if (error) {
      setFormError(error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <section className="relative w-full bg-black min-h-screen overflow-hidden flex flex-col font-sans">
      {/* Background Video */}
      <div className="absolute inset-x-0 bottom-[35vh] h-[80vh] z-0 overflow-hidden">
        <VideoPlayer src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center max-w-5xl mx-auto">
        {/* Headline */}
        <motion.h1 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase mb-8"
        >
          READY FOR <br />
          CLARITY?
        </motion.h1>

        {/* Subtext */}
        <div className="space-y-4 mb-12">
          <motion.p 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-slate-400 text-lg md:text-2xl font-medium max-w-2xl leading-relaxed"
          >
            Take your next step with confidence. Apply or book today.
          </motion.p>
          
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6, duration: 0.8 }}
            className="space-y-2"
          >
            <p className="text-white text-sm md:text-base font-bold uppercase tracking-widest">Apply for Programs (takes 2 minutes)</p>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Once approved, you'll be able to book your consultation.</p>
          </motion.div>
        </div>

        {/* Buttons */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <button onClick={() => navigate('/apply')} className="px-12 py-6 bg-black border border-white text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-white hover:text-black transition-all">
            Apply for Programs
          </button>
          <button onClick={handleOpenForm} className="px-12 py-6 bg-white/5 backdrop-blur-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-white/10 transition-all">
            Book Consultation
          </button>
        </motion.div>
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
                  <p className="text-sm text-slate-500 font-medium">Thank you, {formData.name}! We have received your consultation request. We will get back to you shortly to schedule your free intro call.</p>
                </div>
                <button onClick={handleCloseForm} className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-slate-800 transition-all">
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto"><Calendar size={32} /></div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Book a Consultation</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Program Introduction Call</p>
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
                      placeholder="Your questions or details..." />
                  </div>
                  {formError && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{formError}</p>
                  )}
                  <button type="submit" disabled={submitting}
                    className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {submitting && <Loader size={14} className="animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SynapseSection;
