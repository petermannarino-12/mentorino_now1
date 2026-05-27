import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Menu,
  X,
  MoveDown,
  Briefcase,
  GraduationCap,
  Compass,
  CheckCircle2,
  Minus,
  Plus,
  Target,
  Users,
  User,
  Award,
  Star,
  Sparkles,
  ClipboardList,
  Search,
  Video,
  Map,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail
} from 'lucide-react';

import SEO from '../src/components/SEO';
import { UserRole } from '../src/types';
import SynapseSection from '../src/components/SynapseSection';
import Footer from '../src/components/Footer';
interface LandingPageProps {
  currentRole?: UserRole;
}

const LandingPage: React.FC<LandingPageProps> = ({ currentRole = 'visitor' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const navLinks = [
    { name: 'About Mentor', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Consultation', path: '/consultation' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' }
  ];

  const faqs = [
    { q: "Is this program only for IT people?", a: "No. It covers career, education, and life guidance for people across all disciplines seeking clarity." },
    { q: "Do I need to know my goals before applying?", a: "No. Many people apply precisely because they feel unsure. Our process helps define those goals." },
    { q: "Is this paid?", a: "The program is for serious applicants only. While mentorship sessions are part of the guidance, your first step is simply to apply so we can audit if there is a good fit." },
    { q: "How are sessions conducted?", a: "We offer a variety of options ranging from in-person, virtual or hybrid. This allows the people to customize their program." },
    { q: "Do you accept everyone?", a: "No. Applications are reviewed to ensure a good fit and that the person is truly ready for structured guidance." }
  ];

  const testimonials = [
    { 
      name: "Mauricio L.", 
      role: "Information Technology Major", 
      text: "Working with Peter has had a huge impact on my growth. He has been an amazing role model and mentor, pushing me to improve while trusting me with real responsibilities. I’ve developed stronger technical, communication, and leadership skills. I’m now on track to obtain my CompTIA A+ certification and I'm currently interviewing for IT positions all before my graduation in May 2026. None of this would have been possible without his mentorship." 
    },
    { 
      name: "David C.", 
      role: "Cybersecurity Professional", 
      text: "Peter has played a key role in helping me bring structure and focus to my career. Under his mentorship, I’ve developed the habit of setting three specific goals each day, which has significantly improved my productivity and overall direction. Previously, I approached challenges without a clear plan, often taking on tasks reactively." 
    },
    { 
      name: "Mohamed R.", 
      role: "MS Cybersecurity | PC Support Specialist", 
      text: "Peter’s mentorship gave me clarity and direction when I needed it most. Over the past couple of years, I’ve grown not just technically, but in how I think, plan, and approach challenges. His guidance helped me stay focused, build discipline, and make smarter decisions about my future. It's pushed me to level up my career." 
    },
    { 
      name: "Connor C.", 
      role: "IT Graduate | Future Masters CS", 
      text: "Pete has supported me in countless meaningful ways. Whether it has been through direct instruction, sharing his resources, or pointing me toward the exact tools and information I need to reach my goals. He consistently demonstrates a genuine investment in my success, checking in regularly to see how I’m progressing and making sure I stay on track." 
    }
  ];

  // Using the specified Google Drive direct link
  const mentorImageUrl = "https://lh3.googleusercontent.com/uc?id=1u6X_oVTZvmMVfiITy0Felr6yukTDkW9y";

  return (
    <div className="bg-transparent font-['Inter'] antialiased relative">
      <SEO 
        title="Find Your Trajectory" 
        description="Structured 1-on-1 mentorship for college students and recent grads. Build your career strategy and find clarity in your direction."
      />
      {/* Decorative patterns for Landing specifically */}
      <div className="absolute top-[20%] right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[60%] left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      {/* Navigation */}
      <header className="fixed top-0 left-0 w-full glass-panel z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
              <span className="text-[10px] md:text-xs font-black italic">M</span>
            </div>
            <span className="text-sm md:text-xl font-black tracking-tighter text-black uppercase">Mentorino</span>
          </Link>

          <nav className="hidden xl:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link 
                key={item.name}
                to={item.path} 
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-600 transition-all duration-300"
              >
                {item.name}
              </Link>
            ))}
            <Link to={currentRole !== 'visitor' ? '/dashboard' : '/auth'} className="btn-compact bg-black text-white px-6 py-2.5">
              {currentRole !== 'visitor' ? 'DASHBOARD' : 'MEMBERS PORTAL'}
            </Link>
          </nav>

          <div className="flex items-center gap-4 xl:hidden">
            <Link to={currentRole !== 'visitor' ? '/dashboard' : '/auth'} className="btn-compact bg-black text-white px-3 py-2 text-[9px]">
              {currentRole !== 'visitor' ? 'DASHBOARD' : 'MEMBERS PORTAL'}
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-black hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Open Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] transition-all duration-500 ease-in-out xl:hidden"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black">
                    <span className="text-[10px] font-black italic">M</span>
                  </div>
                  <span className="text-sm font-black uppercase tracking-tighter">Mentorino</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-8 overflow-y-auto no-scrollbar pb-10">
                {navLinks.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center justify-between py-2 border-b border-white/10"
                    >
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">0{i+1}</span>
                        <span className="text-2xl font-black uppercase tracking-tighter text-white group-hover:text-white/70 transition-colors duration-300">{item.name}</span>
                      </div>
                      <ArrowRight size={24} className="text-white/20 group-hover:text-white transition-colors" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div 
                className="mt-auto space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link 
                  to={currentRole !== 'visitor' ? '/dashboard' : '/auth'} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl hover:scale-105 transition-all"
                >
                  {currentRole !== 'visitor' ? 'DASHBOARD' : 'MEMBERS PORTAL'}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-40 pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[40px] md:rounded-[80px] overflow-hidden bg-black min-h-[70vh] md:min-h-[80vh] flex items-center justify-center p-6 sm:p-12 md:p-24 text-center shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2400" 
                alt="Architecture" 
                className="w-full h-full object-cover opacity-20 grayscale transition-transform duration-1000 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black"></div>
              
              {/* Dynamic light effects */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-10 md:space-y-16">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 w-fit mx-auto"
              >
                <Sparkles size={12} className="md:w-[14px] md:h-[14px] text-amber-400" />
                <span className="text-[8px] md:text-[9px] font-black tracking-[0.3em] md:tracking-[0.4em] text-white/50 uppercase">High Intensity Programs v2.4</span>
              </motion.div>
              
              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter text-white leading-[0.85] md:leading-[0.8] uppercase"
                >
                  CONFUSED <br />
                  ABOUT <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/20 via-white/50 to-white/20 italic">DIRECTION?</span>
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <h2 className="text-xl md:text-4xl font-black text-white/90 tracking-tight uppercase">Let’s Figure It Out Together.</h2>
                </motion.div>
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-sm md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium px-4"
              >
                For college students, recent grads, or anyone stuck choosing their next step. 1-on-1 mentoring with a clear step-by-step plan.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full"
              >
                <Link to="/apply" className="btn-normal bg-white text-black w-full sm:w-auto shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                  START APPLICATION
                </Link>
                <Link to="/booking" className="btn-normal bg-transparent border border-white/20 text-white w-full sm:w-auto hover:bg-white/5">
                  VIEW CONSULTATION
                </Link>
              </motion.div>

              
              <div className="pt-8 flex flex-col items-center gap-4 opacity-30">
                <MoveDown size={24} className="text-white animate-subtle-float" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar / Recognition */}
      <div className="py-16 md:py-24 border-y border-black/[0.03] bg-white overflow-hidden flex flex-col items-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-12">Guidance related to</span>
        
        <div className="w-full relative flex overflow-hidden">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-16 md:gap-32 opacity-30 hover:opacity-100 transition-all duration-700 shrink-0 px-8"
          >
            {[
              "CAREER STRATEGY", "ACADEMIC PLANNING", "LIFE ARCHITECTURE", "PERSONAL GROWTH", 
              "DECISION MASTERY", "MENTAL FRAMEWORKS", "SKILL ACQUISITION", "GOAL ALIGNMENT",
              "FUTURE MAPPING", "DISCIPLINE SYSTEMS", "CLARITY AUDITS", "PROFESSIONAL PRESENCE"
            ].map((name, i) => (
              <span key={i} className="text-xl md:text-3xl font-black tracking-tighter whitespace-nowrap px-4">{name}</span>
            ))}
            {/* Duplicate for infinite effect */}
            {[
              "CAREER STRATEGY", "ACADEMIC PLANNING", "LIFE ARCHITECTURE", "PERSONAL GROWTH", 
              "DECISION MASTERY", "MENTAL FRAMEWORKS", "SKILL ACQUISITION", "GOAL ALIGNMENT",
              "FUTURE MAPPING", "DISCIPLINE SYSTEMS", "CLARITY AUDITS", "PROFESSIONAL PRESENCE"
            ].map((name, i) => (
              <span key={`dup-${i}`} className="text-xl md:text-3xl font-black tracking-tighter whitespace-nowrap px-4">{name}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Process Section */}
      <section className="py-20 md:py-32 px-6 bg-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.02] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="black" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[1px] bg-indigo-600"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">The Journey</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                OUR STRATEGIC <br />
                <span className="text-slate-200">PROCESS.</span>
              </h2>
            </div>
            <p className="max-w-md text-slate-500 font-medium leading-relaxed">
              We've refined a results-driven methodology to ensure every student finds their ideal trajectory through structured introspection and action.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-24 left-0 w-full h-[1px] bg-slate-100 z-0"></div>


            {[
              { 
                step: "01", 
                title: "APPLY", 
                label: "The Intent",
                desc: "Complete the 2-minute application. We look for seriousness and readiness for guidance.",
                icon: ClipboardList,
                color: "bg-indigo-600"
              },
              { 
                step: "02", 
                title: "REVIEW", 
                label: "The Audit",
                desc: "We review your current goal. Your application is approved within 48 hours.",
                icon: Search,
                color: "bg-emerald-600"
              },
              { 
                step: "03", 
                title: "CONSULT", 
                label: "The Clarity",
                desc: "A 1-on-1 session to verify goals and identify the exact hurdles in your way.",
                icon: Video,
                color: "bg-amber-500"
              },
              { 
                step: "04", 
                title: "ROADMAP", 
                label: "The Growth",
                desc: "Get your custom trajectory plan. Weekly audits, tasks, and real-time support.",
                icon: Map,
                color: "bg-black"
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
                className="group relative z-10 space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon size={24} />
                  </div>
                  <div className="md:hidden">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Step {item.step}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="hidden md:block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Phase {item.step}</span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-black transition-colors">{item.title}</h3>
                  <div className="w-10 h-1 bg-slate-100 group-hover:w-20 group-hover:bg-black transition-all duration-500"></div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{item.label}</p>
                  <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Mentor Section */}
      <section id="mentor" className="py-24 md:py-40 px-6 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative group"
            >
              <div className="aspect-[4/5] bg-slate-900 rounded-[64px] overflow-hidden border border-white/10 relative">
                <img 
                  src="/images/peter-mannarino.jpg" 
                  alt="Mentorino" 
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-12 left-12">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Lead Strategist</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight">Mentorino</h3>
                </div>
              </div>
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 md:-top-10 md:-right-10 bg-indigo-600 text-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl border border-white/20 hidden md:block"
              >
                <div className="text-center">
                  <p className="text-4xl font-black mb-1">1k+</p>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-70">People Guided</p>
                </div>
              </motion.div>
            </motion.div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-indigo-500"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Since 2010</span>
                </div>
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                  Guidance From <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/20 via-white to-white/20 italic">Experience.</span>
                </h2>
              </div>

              <div className="space-y-6 text-slate-400 font-medium text-base md:text-lg leading-relaxed">
                <p>
                  Leveraging over 25 years of professional experience, I have been guiding college students, recent grads, and people in the game of life for 15 years.
                </p>
                <p className="text-white/80">
                  I help people make better decisions through calm, structured, and practical guidance — not pressure or motivation talk.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: "CAREER", val: "Strategic Paths" },
                  { label: "LIFE", val: "Decision Mastery" },
                  { label: "ACADEMIC", val: "Future Clarity" },
                  { label: "GROWTH", val: "Discipline Systems" }
                ].map((item, i) => (
                  <div key={i} className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-[28px] sm:rounded-[32px] hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 sm:mb-2">{item.label}</p>
                    <p className="text-sm sm:text-base font-black uppercase tracking-tight text-white">{item.val}</p>
                  </div>
                ))}
              </div>


              <div className="pt-6">
                <Link 
                  to="/about"
                  className="inline-flex items-center gap-4 py-5 px-10 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:scale-105 transition-all shadow-2xl"
                >
                  Read The Backstory <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Problem & Solution */}
      <section className="py-32 bg-black text-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24">
          <div className="space-y-10">
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Most People <br /><span className="text-white/30">Feel Lost.</span></h3>
            <p className="text-white/50 text-xl font-medium leading-relaxed">It's normal, but it's a guidance gap. You might be unsure which career path to choose, feeling family pressure, or stuck without direction.</p>
            <ul className="space-y-4">
              {["Unsure which career path to choose", "Confused about education path", "Feeling pressure from Family & Society", "Overthinking your future"].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/40">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-10">
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Programs That <br /><span className="text-emerald-500">Bring Clarity.</span></h3>
            <p className="text-white/50 text-xl font-medium leading-relaxed">No hype. No shortcuts. Just clear guidance to help you understand yourself and move forward with a realistic plan.</p>
            <ul className="space-y-4">
              {["Understand yourself better", "Make confident decisions", "Build a realistic plan", "Reduce stress and confusion"].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
                  <CheckCircle2 size={16} /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto bg-transparent">
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter">
            The 3 Pillars.
          </h2>
          <p className="text-slate-400 font-medium text-lg">Focused guidance for every aspect of your growth.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           {[
              { title: 'Schooling', icon: GraduationCap, color: 'text-emerald-500', desc: 'Education choices, course decisions, study planning, and academic confidence.' },
              { title: 'Career', icon: Briefcase, color: 'text-indigo-500', desc: 'Career clarity, skill roadmap, job preparation, and long-term planning.' },
              { title: 'Life', icon: Compass, color: 'text-amber-500', desc: 'Decision clarity, confidence, stress management, and personal direction.' }
            ].map((p, i) => (
             <div 
               key={i} 
               className="p-8 md:p-12 relative bg-white border border-black/[0.02] rounded-[48px] shadow-sm premium-card overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                  <p.icon size={24} className={p.color} />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4 relative z-10 text-black">{p.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed text-sm md:text-base relative z-10">{p.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Investment Options Section */}
      <section id="programs" className="py-20 md:py-40 px-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.01] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="black" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                THE PATHS TO <br />
                <span className="text-slate-200">MASTERY.</span>
              </h2>
            </div>
            <p className="max-w-md text-slate-500 font-medium leading-relaxed">
              We offer two distinct engagement models depending on your current goals and need for ongoing structural support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 sm:p-12 md:p-16 rounded-[48px] md:rounded-[64px] border border-black/[0.03] shadow-sm hover:shadow-2xl hover:md:-translate-y-2 transition-all duration-700 flex flex-col items-start gap-6 md:gap-8"
            >

              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                <Video className="text-indigo-600" size={24} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tight">The 1-on-1 Strategy Call.</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  A high-intensity audit for people who are stuck at a specific crossroads and need immediate outside perspective.
                </p>
              </div>
              <ul className="space-y-4">
                {["60min Deep-Dive session", "Personalized Strategy PDF", "Action-Item Checklist"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <CheckCircle2 size={14} className="text-indigo-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-8 mt-auto w-full">
                <Link to="/consultation" className="btn-normal w-full bg-slate-950 text-white hover:bg-black">
                  Book A Call
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-black p-8 sm:p-12 md:p-16 rounded-[48px] md:rounded-[64px] shadow-2xl relative overflow-hidden flex flex-col items-start gap-6 md:gap-8 group"
            >

              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-1000">
                <Sparkles size={120} className="text-indigo-400" />
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10">
                <Star className="text-white" size={24} />
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-3xl font-black uppercase tracking-tight text-white">The Growth Engine.</h3>
                <p className="text-white/40 leading-relaxed font-medium">
                  A continuous engagement model. Full access to the trajectory roadmap, weekly audits, and real-time support.
                </p>
              </div>
              <ul className="space-y-4 relative z-10">
                {["Weekly Audit sessions", "Private Dashboard access", "Real-time query support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/50">
                    <Star size={14} className="text-indigo-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-8 mt-auto w-full relative z-10">
                <Link to="/apply" className="btn-normal w-full bg-white text-black hover:scale-105">
                  Join The Program
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20 space-y-4">
            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter">Success <br /><span className="text-slate-300">Stories.</span></h2>
            <p className="text-slate-400 font-medium text-sm md:text-lg">Real stories from people who found their trajectory.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-white p-8 md:p-10 rounded-[40px] md:rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-500 fill-amber-500" />)}
                </div>
                <p className="text-slate-600 font-medium leading-relaxed mb-8 italic text-sm md:text-base">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-[10px]">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tight">{t.name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Common Questions.</h2>
          <p className="text-slate-400 font-medium">Everything you need to know about starting your program journey.</p>
        </div>
        <div className="space-y-4">
           {faqs.map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -10 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: '-50px' }}
               transition={{ delay: i * 0.05 }}
               className="bg-slate-50 border border-slate-100 rounded-[32px] overflow-hidden shadow-sm"
             >
               <button onClick={() => toggleFaq(i)} className="w-full p-8 flex items-center justify-between text-left group">
                 <span className="font-black text-sm uppercase tracking-tight group-hover:text-black transition-colors">{item.q}</span>
                 <motion.div
                   animate={{ rotate: openFaq === i ? 180 : 0 }}
                   transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                 >
                   {openFaq === i ? <Minus size={18} /> : <Plus size={18} />}
                 </motion.div>
               </button>
               <AnimatePresence>
                 {openFaq === i && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.3, ease: 'easeInOut' }}
                     className="overflow-hidden"
                   >
                     <div className="px-8 pb-8 text-slate-500 text-sm font-medium">
                       {item.a}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Synapse Experience Section */}
      <SynapseSection />

      <Footer />

    </div>
  );
};

export default LandingPage;