import React from 'react';
import { Award, Target, Users, Shield, ArrowLeft } from 'lucide-react';
import Footer from '../src/components/Footer';
import SEO from '../src/components/SEO';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const mentorImageUrl = "/images/peter-mannarino.jpg";

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 animate-in fade-in duration-700 relative">
      <SEO 
        title="About Peter Mannarino" 
        description="Learn about Peter Mannarino's journey, philosophy, and over 15 years of experience in career and life guidance."
      />
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 md:top-0 md:left-0 flex items-center justify-center w-12 h-12 bg-white border border-black/[0.05] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all z-20 group"
      >
        <ArrowLeft size={20} className="text-black group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Hero Header Section */}
      <header className="mb-16 sm:mb-24 pt-12 sm:pt-16 md:pt-0 text-center flex flex-col items-center">
        <h1 className="flex flex-col items-center leading-[0.85] tracking-tighter">
          <span className="text-5xl sm:text-7xl md:text-[110px] font-black uppercase text-black">Peter</span>
          <span className="text-5xl sm:text-7xl md:text-[110px] font-black uppercase bg-black text-white px-6 sm:px-8 py-2 mt-2 sm:mt-4 inline-block">Mentorino</span>
        </h1>
        <p className="text-[9px] sm:text-[11px] md:text-[13px] font-black uppercase tracking-[0.35em] sm:tracking-[0.45em] text-slate-400 mt-8 sm:mt-12 border border-slate-200 px-8 sm:px-12 py-4 sm:py-5">
          Mentor & Strategic Consultant
        </p>
      </header>

      {/* Main Bio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 md:gap-24 items-start mb-20 sm:mb-32">
        <div className="md:col-span-5 lg:col-span-5 px-4 sm:px-0">
          <div className="relative aspect-[4/5] rounded-[60px] sm:rounded-[80px] md:rounded-[120px] overflow-hidden bg-slate-100 shadow-2xl">
            <img 
              src={mentorImageUrl} 
              alt="Peter Mannarino" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
              loading="lazy"
            />
          </div>
        </div>

        <div className="md:col-span-7 lg:col-span-7 space-y-8 sm:space-y-12 sm:pt-6">
          <div className="space-y-6 sm:space-y-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">THE BIO</h2>
            <div className="space-y-4 sm:space-y-6">
              <p className="text-slate-500 text-base sm:text-lg md:text-xl font-medium leading-relaxed px-2 sm:px-0">
                Leveraging over 25 years of high-performance leadership in specialized sectors, I have dedicated the last 15 years to bridging the guidance gap for the next generation. Since 2010, I have guided over 1,000 people in this game called life, helping them navigate the complexities of career, education, and personal purpose.
              </p>
              <p className="text-slate-400 text-sm sm:text-base md:text-lg font-medium leading-relaxed px-2 sm:px-0">
                My approach is built on "Calm Clarity"—stripping away the noise and pressure of modern expectations to help college students, recent grads, and those seeking direction make decisions rooted in their own strengths and realistic trajectories.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center sm:justify-start gap-12 sm:gap-20 pt-4">
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-black">25+</p>
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">Years Exp</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-black">15y</p>
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">Guidance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-16 sm:space-y-24">
        {/* Backstory Section */}
        <section className="max-w-3xl mx-auto text-center space-y-8 sm:space-y-12 px-4">
          <div className="space-y-4 sm:space-y-6">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 bg-slate-50 px-4 py-2 rounded-full inline-block">
              The Backstory
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter">Why Mentorino Exists.</h2>
          </div>
          <div className="space-y-6 text-slate-500 text-base sm:text-lg md:text-xl font-medium leading-relaxed text-left sm:text-center">
            <p>
              Before Mentorino, I spent over 25 years in corporate and entrepreneurial environments — across multiple sectors and leadership roles. I saw the same pattern repeat: talented, smart people stalling not because they lacked ability, but because they lacked clarity and structured guidance.
            </p>
            <p>
              In 2010, I started mentoring on the side. One conversation led to another. Within a few years, I had guided over 1,000 individuals — college students, recent grads, career changers — helping them navigate the noise and build real, actionable trajectories.
            </p>
            <p>
              Mentorino was built to formalize what was already working. No hype, no motivation talk. Just calm, structured, honest guidance rooted in real-world experience.
            </p>
          </div>
        </section>

        <section className="space-y-10 sm:space-y-12">
          <div className="flex flex-col items-center gap-2 sm:gap-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">Program Approach</h2>
            <div className="w-10 sm:w-12 h-1 bg-black rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { title: 'Calm Clarity', desc: 'No hype, no motivation talk. Just structured analysis of your current state vs your desired state.', icon: Shield },
              { title: 'Real Experience', icon: Award, desc: 'Advice rooted in two decades of corporate and entrepreneurial reality, not textbook theory.' },
              { title: 'Extreme Truth', icon: Target, desc: 'Honest feedback that others are too polite to give, but you need to hear to grow.' }
            ].map((p, i) => (
              <div key={i} className="p-8 sm:p-12 bg-white border border-black/[0.03] rounded-[40px] sm:rounded-[60px] space-y-4 sm:space-y-6 shadow-sm hover:shadow-xl transition-all duration-500 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                  <p.icon size={22} className="sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">{p.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black text-white p-10 sm:p-24 rounded-[60px] sm:rounded-[100px] space-y-8 sm:space-y-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter relative z-10">Philosophy & Vision</h2>
          <p className="text-white/40 max-w-3xl mx-auto text-lg sm:text-3xl md:text-4xl font-medium leading-relaxed italic relative z-10 px-4">
            "Direction is more important than speed. Many people are running fast toward a wall. My mission is to show them where the door is."
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 relative z-10">
            {['Integrity', 'Impact', 'Strategic Thought', 'Discipline'].map(v => (
              <span key={v} className="px-4 sm:px-8 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">{v}</span>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;