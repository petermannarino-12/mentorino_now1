import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-black py-16 sm:py-24 px-6 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16 mb-16 sm:mb-20">
          {/* Brand Column */}
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-black italic">M</div>
              <span className="text-lg sm:text-xl font-black uppercase tracking-tighter">Mentorino.</span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-xs">
              Clarity in career, schooling, and life. We build the trajectory you were meant to follow.
            </p>
            <div className="flex items-center gap-4 sm:gap-5">
              {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-black hover:text-white transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:block sm:space-y-4">
            <div>
              <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6 sm:mb-8">Programs</h4>
              <ul className="space-y-3 sm:space-y-4">
                <li>
                  <Link to="/programs" className="text-slate-500 hover:text-black transition-colors text-xs sm:text-sm font-medium">Programs</Link>
                </li>
              </ul>
            </div>

            <div className="sm:mt-8">
              <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6 sm:mb-8">Company</h4>
              <ul className="space-y-3 sm:space-y-4">
                <li>
                  <Link to="/about" className="text-slate-500 hover:text-black transition-colors text-xs sm:text-sm font-medium">About Mentor</Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-500 hover:text-black transition-colors text-xs sm:text-sm font-medium">Contact</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-10 sm:pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-center sm:text-left">
            © 2024 Mentorino Trajectory Coaching. ALL RIGHTS RESERVED.
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
