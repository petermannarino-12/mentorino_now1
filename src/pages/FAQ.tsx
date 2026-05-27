import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Search, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const faqs = [
  { q: "What is Mentorino?", a: "Mentorino is a premium career, education, and life guidance mentorship platform designed to help individuals achieve their full potential through personalized mentorship programs.", cat: "General" },
  { q: "How do I apply for mentorship?", a: "You can apply directly through our website by filling out the application form. Our team reviews each application carefully and matches you with the right mentor.", cat: "Application" },
  { q: "How long does the application review take?", a: "Most applications are reviewed within 48 hours. You will receive an email notification once your application status has been updated.", cat: "Application" },
  { q: "What programs do you offer?", a: "We offer various mentorship programs including career development, education guidance, and personal growth mentorship. Each program is tailored to your specific needs and goals.", cat: "Programs" },
  { q: "How are sessions conducted?", a: "Sessions are conducted virtually through video calls at scheduled times. We use a secure platform to ensure productive and focused mentorship sessions.", cat: "Sessions" },
  { q: "Can I change my mentor?", a: "Yes, if you feel your current mentor isn't the right fit, you can request a change through your dashboard. We aim to ensure every mentee finds the perfect match.", cat: "Support" },
  { q: "What is the cost of mentorship?", a: "Our programs are premium services with pricing varying by program type and duration. Detailed pricing information is available on our Programs page.", cat: "Pricing" },
  { q: "Is there a refund policy?", a: "Yes, we offer a satisfaction guarantee. If you're not happy with your first session, we provide a full refund. Please refer to our Terms of Service for details.", cat: "Pricing" },
];

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    f.a.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-16 px-4 sm:px-6 animate-in fade-in duration-700">
      <SEO 
        title="Frequently Asked Questions" 
        description="Find answers to common questions about our mentorship programs, sessions, and outcomes."
      />
      <div className="flex flex-col items-center mb-10 sm:mb-16">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 sm:mb-12 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white border border-black/[0.05] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all group"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-black group-hover:-translate-x-1 transition-transform" />
        </button>

        <header className="space-y-4 sm:space-y-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">The <br /><span className="text-slate-300">FAQ.</span></h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium px-4">Everything you need to know about starting your guidance journey.</p>
          <div className="relative max-w-md mx-auto pt-6 sm:pt-8 w-full">
            <Search className="absolute left-4 top-1/2 translate-y-1 sm:translate-y-2 text-slate-300 sm:w-[18px] sm:h-[18px]" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-6 py-3.5 sm:py-4 bg-white border border-black/[0.03] rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest focus:border-black outline-none transition-all shadow-sm"
            />
          </div>
        </header>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
          <div key={i} className="bg-white border border-black/[0.03] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-sm hover:border-black/10 transition-all">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-6 sm:p-8 flex items-center justify-between text-left group"
            >
              <div className="space-y-1">
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-400">{faq.cat}</span>
                <h3 className="font-black text-xs sm:text-sm uppercase tracking-tight group-hover:text-slate-600 transition-colors pr-4">{faq.q}</h3>
              </div>
              <div className={`shrink-0 p-1.5 sm:p-2 rounded-full transition-all ${openIndex === i ? 'bg-black text-white rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                {openIndex === i ? <Minus size={14} className="sm:w-4 sm:h-4" /> : <Plus size={14} className="sm:w-4 sm:h-4" />}
              </div>
            </button>
            {openIndex === i && (
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 animate-in slide-in-from-top-2 duration-300">
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold pt-4 sm:pt-6 border-t border-slate-50">{faq.a}</p>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-10 sm:py-20 text-slate-300 font-black uppercase text-[8px] sm:text-[10px]">No matches found</div>
        )}
      </div>

      <div className="mt-12 sm:mt-20 p-8 sm:p-12 bg-slate-900 text-white rounded-[32px] sm:rounded-[48px] text-center space-y-4 sm:space-y-6">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest">Still have questions?</h3>
        <p className="text-[10px] sm:text-xs text-white/40 font-medium">Our team is ready to help you find the right path.</p>
        <button onClick={() => navigate('/contact')} className="btn-normal bg-white text-black px-8 sm:px-10 py-4 sm:py-5">Contact Support</button>
      </div>
      <Footer />
    </div>
  );
};

export default FAQPage;