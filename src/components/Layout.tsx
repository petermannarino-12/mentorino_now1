import React, { useState, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

const AIChatWidget = lazy(() => import('./ai/AIChatWidget'));
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings,
  LogOut,
  Home,
  User,
  ClipboardList,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Activity,
  Sparkles,
  Lock,
  Mail,
  Star
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = React.memo(({ children, role }) => {
  const { signOut: onLogout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { label: 'Home', path: '/', icon: Home, roles: ['user', 'mentor', 'admin'] },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['user', 'mentor', 'admin'] },
    { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar, roles: ['user', 'mentor', 'admin'] },
    { label: 'Roadmap', path: '/dashboard/roadmap', icon: Activity, roles: ['user'] },
    { label: 'Vault', path: '/vault', icon: BookOpen, roles: ['user'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['user', 'mentor', 'admin'] },
    { label: 'Mentees', path: '/dashboard/mentees', icon: Users, roles: ['mentor', 'admin'] },
    { label: 'Chat', path: '/dashboard/chat', icon: MessageCircle, roles: ['mentor', 'admin'] },
    { label: 'Messages', path: '/dashboard/chat', icon: MessageCircle, roles: ['user'] },
    { label: 'Reviews', path: '/dashboard/reviews', icon: Star, roles: ['mentor', 'admin'] },
    { label: 'Events', path: '/dashboard/events', icon: Sparkles, roles: ['mentor', 'admin'] },
    { label: 'Network', path: '/dashboard/networking', icon: Sparkles, roles: ['user'] },
    { label: 'Inquiries', path: '/dashboard/audits', icon: ClipboardList, roles: ['mentor', 'admin'] },
    { label: 'Access Requests', path: '/dashboard/access-requests', icon: Lock, roles: ['mentor', 'admin'] },
    { label: 'Email Templates', path: '/dashboard/emails', icon: Mail, roles: ['mentor', 'admin'] },
  ].filter(item => item.roles.includes(role));

  const helpItems = [
    { label: 'About Mentor', path: '/about', icon: User },
    { label: 'Programs', path: '/programs', icon: BookOpen },
    { label: 'FAQ', path: '/faq', icon: HelpCircle },
    { label: 'Contact', path: '/contact', icon: MessageCircle },
  ];

  const mobileNavItems = role === 'mentor' ? [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mentees', path: '/dashboard/mentees', icon: Users },
    { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
    { label: 'Reviews', path: '/dashboard/reviews', icon: MessageCircle },
    { label: 'Account', path: '/settings', icon: User },
  ] : role === 'admin' ? [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mentees', path: '/dashboard/mentees', icon: Users },
    { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
    { label: 'Account', path: '/settings', icon: User },
  ] : [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
    { label: 'Roadmap', path: '/dashboard/roadmap', icon: Activity },
    { label: 'Vault', path: '/vault', icon: BookOpen },
    { label: 'Account', path: '/settings', icon: User },
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
      {/* Mobile Top Bar - Hidden on landing page to avoid overlap */}
      {role !== 'visitor' && !isLandingPage && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-black/[0.03] z-50 flex items-center justify-between px-6"
        >
           <Link to="/" className="text-sm font-black tracking-tighter text-black uppercase">Mentorino</Link>
        </motion.div>
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
      <main className={`flex-1 w-full ${(role === 'visitor' || isLandingPage) ? '' : 'pb-24 sm:pb-32 lg:pb-12 pt-16 lg:pt-0'}`}>
        <div className="h-full">
          {children}
        </div>
      </main>

      {/* Premium Bottom Nav (Mobile) */}
      {role !== 'visitor' && !isLandingPage && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-sm z-[100]">
          <motion.nav 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-black/95 backdrop-blur-2xl border border-white/10 rounded-[28px] p-2 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {mobileNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link 
                  key={item.path + (item.label === 'Sessions' ? 'sessions' : '')} 
                  to={item.path}
                  className="relative py-2.5 px-1 flex flex-col items-center gap-1 group min-w-[56px]"
                >
                  <div className={`relative z-10 transition-all duration-300 ${
                    active ? 'text-white scale-110' : 'text-slate-500 scale-100 group-hover:text-slate-300'
                  }`}>
                    <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                  </div>
                  <span className={`relative z-10 text-[7px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                    active ? 'text-white' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                  
                  {active && (
                    <motion.div
                      layoutId="active-nav-global"
                      className="absolute inset-0 bg-white/10 rounded-2xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </motion.nav>
        </div>
      )}
      {role !== 'visitor' && <Suspense fallback={null}><AIChatWidget /></Suspense>}
    </div>
  );
});

export default Layout;