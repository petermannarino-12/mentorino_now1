import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings,
  LogOut,
  User,
  ClipboardList,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Activity,
  Sparkles,
  Lock,
  Mail,
  Star,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const { signOut: onLogout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['user', 'mentor', 'admin'] },
    { label: 'Mentees', path: '/dashboard/mentees', icon: Users, roles: ['mentor', 'admin'] },
    { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar, roles: ['user', 'mentor', 'admin'] },
    { label: 'Chat', path: '/dashboard/chat', icon: MessageCircle, roles: ['mentor', 'admin'] },
    { label: 'Programs', path: '/programs', icon: BookOpen, roles: ['user', 'mentor', 'admin'] },
    { label: 'Events', path: '/dashboard/events', icon: Sparkles, roles: ['mentor', 'admin'] },
    { label: 'Reviews', path: '/dashboard/reviews', icon: Star, roles: ['mentor', 'admin'] },
    { label: 'Inquiries', path: '/dashboard/audits', icon: ClipboardList, roles: ['mentor', 'admin'] },
    { label: 'Access Requests', path: '/dashboard/access-requests', icon: Lock, roles: ['mentor', 'admin'] },
    { label: 'Email Templates', path: '/dashboard/emails', icon: Mail, roles: ['mentor', 'admin'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['user', 'mentor', 'admin'] },
    { label: 'Messages', path: '/dashboard/chat', icon: MessageCircle, roles: ['user'] },
    { label: 'Roadmap', path: '/dashboard/roadmap', icon: Activity, roles: ['user'] },
    { label: 'Vault', path: '/vault', icon: BookOpen, roles: ['user'] },
    { label: 'Network', path: '/dashboard/networking', icon: Sparkles, roles: ['user'] },
  ].filter(item => item.roles.includes(role));

  const helpItems = [
    { label: 'About Mentor', path: '/about', icon: User },
    { label: 'FAQ', path: '/faq', icon: HelpCircle },
    { label: 'Contact', path: '/contact', icon: MessageCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    const currentFull = location.pathname + location.search;
    if (path.includes('?')) {
      return currentFull === path;
    }
    // For nested routes like /dashboard/sessions
    if (location.pathname.startsWith(path) && path !== '/dashboard') {
      return true;
    }
    // Exact match for /dashboard or /settings
    return location.pathname === path && (location.search === '' || path === '/dashboard');
  };
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex bg-[#FDFDFD] flex-col lg:flex-row relative overflow-x-hidden">
      {/* Decorative Background Patterns */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[80px]"></div>
      </div>
      {/* Mobile Top Bar */}
      {role !== 'visitor' && !isLandingPage && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-black/[0.03] z-50 flex items-center justify-between px-6"
        >
          <Link to="/" className="text-sm font-black tracking-tighter text-black uppercase">Mentorino</Link>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </motion.div>
      )}

      {/* Mobile Drawer */}
      {role !== 'visitor' && !isLandingPage && (
        <>
          {isMobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-[70]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
          <motion.aside
            initial={false}
            animate={isMobileMenuOpen ? { x: 0 } : { x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="lg:hidden fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-100 z-[80] flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
              <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">M</span>
                MENTORINO
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              <nav className="space-y-1">
                <p className="px-4 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Main Menu</p>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="pt-4 mt-4 border-t border-slate-50">
                <p className="px-4 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Information</p>
                {helpItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-slate-100 text-black' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-50 mt-auto">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); if (window.confirm('Are you sure you want to log out?')) onLogout(); }}
                className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
              >
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}

      {/* Desktop Sidebar */}
      {role !== 'visitor' && !isLandingPage && (
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-100 z-[60] transition-transform duration-500
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          hidden lg:flex flex-col
        `}>
          <div className="p-8">
            <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 group">
              <span className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">M</span>
              MENTORINO
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <nav className="px-4 space-y-1">
              <div className="pb-4">
                <p className="px-4 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Main Menu</p>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="px-4 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Information</p>
                {helpItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-slate-100 text-black' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-50 mt-auto">
            <button 
              onClick={() => { if (window.confirm('Are you sure you want to log out?')) onLogout(); }}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
            >
              <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full ${(role === 'visitor' || isLandingPage) ? '' : 'pt-16 lg:pt-0'}`}>
        <div className="h-full">
          {children}
        </div>
      </main>

    </div>
  );
};

export default Layout;