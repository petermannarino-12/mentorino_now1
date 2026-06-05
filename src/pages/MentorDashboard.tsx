import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell,
  Info,
  ArrowLeft,
  AlertCircle,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Calendar,
  Star,
  ClipboardList,
  Lock,
  Sparkles,
  Mail,
  User,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { Booking, NetworkEvent } from '../types';
import { useMentorDashboardActions } from '../hooks/useMentorDashboardActions';
import { Loader } from '../components/ui/Loader';
import { MentorOverview } from './mentor/MentorOverview';
import { MentorMentees } from './mentor/MentorMentees';
import { MentorSessions } from './mentor/MentorSessions';
import { MentorReviews } from './mentor/MentorReviews';
import { MentorApplications } from './mentor/MentorApplications';
import { MentorAccessRequests } from './mentor/MentorAccessRequests';
import { MentorEvents } from './mentor/MentorEvents';
import { MentorEmailTemplates } from './mentor/MentorEmailTemplates';
import { MentorAccounts } from './mentor/MentorAccounts';
import { MentorChat } from '../components/chat/MentorChat';
import { useMentorDashboardData } from '../hooks/useMentorDashboardData';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const MentorDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, signOut } = useAuth();
  const [notification, setNotification] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const {
    applications: allApplications,
    bookings: allBookings,
    tasks: allTasks,
    events: allEvents,
    reviews: allReviews,
    isPending,
    error
  } = useMentorDashboardData();

  useEffect(() => {
    if (!isPending) { setTimedOut(false); return; }
    const timer = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, [isPending]);

  const {
    handleReviewTask,
    handleApplicationAction,
    handleDeleteApplication,
    handleCreateEvent,
    submitFeedback,
    handleDeleteEvent
  } = useMentorDashboardActions(
    setNotification,
    () => {}, // setSelectedTask placeholder
    () => {}, // setFeedbackResponse placeholder
    () => {}, // setIsAddingEvent placeholder
    () => {}  // setNewEvent placeholder
  );

  const refresh = () => {
    window.location.reload();
  };

  if (isPending && !timedOut) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (isPending && timedOut) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-6">
        <div className="bg-white rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm p-12 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-amber-500" size={48} />
          <p className="text-[10px] sm:text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Taking Longer Than Expected</p>
          <p className="text-sm text-slate-500 mb-6">The dashboard is still loading. This may be due to a cold start. Please try again.</p>
          <button onClick={refresh} className="px-6 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-600 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-6">
        <div className="bg-white rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm p-12 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-rose-500" size={48} />
          <p className="text-[10px] sm:text-xs font-black text-rose-600 uppercase tracking-widest mb-2">Failed to Load Dashboard</p>
          <p className="text-sm text-slate-500 mb-6">{(error as Error)?.message || 'An unexpected error occurred.'}</p>
          <button onClick={refresh} className="px-6 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-600 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const mentorNavItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mentees', path: '/dashboard/mentees', icon: Users },
    { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
    { label: 'Reviews', path: '/dashboard/reviews', icon: Star },
    { label: 'Inquiry Audit', path: '/dashboard/audits', icon: ClipboardList },
    { label: 'Access Requests', path: '/dashboard/access-requests', icon: Lock },
    { label: 'Events', path: '/dashboard/events', icon: Sparkles },
    { label: 'Email Templates', path: '/dashboard/emails', icon: Mail },
    { label: 'Accounts', path: '/dashboard/accounts', icon: User },
    { label: 'Chat', path: '/dashboard/chat', icon: MessageCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview';
    if (path === '/dashboard/mentees') return 'Active Mentees';
    if (path === '/dashboard/sessions') return 'Schedule';
    if (path === '/dashboard/reviews') return 'Reviews';
    if (path === '/dashboard/audits') return 'Inquiry Audit';
    if (path === '/dashboard/access-requests') return 'Access Requests';
    if (path === '/dashboard/events') return 'Networking Setup';
    if (path === '/dashboard/emails') return 'Email Templates';
    if (path === '/dashboard/accounts') return 'Accounts';
    return 'Management';
  };

  const handleStartCall = (session: Booking) => {
    setNotification(`Initiating secure link for session with ${session.user_name}...`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="bg-[#FDFDFD] flex flex-col min-h-screen">
      <SEO 
        title="Mentor Console | Mentorino" 
        description="Strategic management for high-performance mentees. Review audits, manage sessions, and guide the next generation."
      />
      {/* Header for Tablet/Desktop */}
      <header className="hidden lg:flex items-center justify-between py-8 px-12 bg-white border-b border-slate-50 sticky top-0 z-30">
        <div className="flex items-center gap-6">
          {location.pathname !== '/dashboard' && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full hover:bg-black hover:text-white transition-all active:scale-95 group shadow-sm border border-slate-100"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Mentor Console</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
               {getTitle()}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Sync</span>
          </div>
          <button onClick={() => setNotification('No new notifications.')} className="p-3 text-slate-400 hover:text-black transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
          </button>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-black uppercase tracking-tight leading-none mb-0.5">{currentUser?.full_name || ''}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Growth Lead</p>
            </div>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-sm">
              {(currentUser?.full_name || '?').charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-black/[0.03] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          {location.pathname !== '/dashboard' && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 truncate">{getTitle()}</span>
        </div>
      </header>

      {/* Mobile Drawer */}
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
              <p className="px-4 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Console</p>
              {mentorNavItems.map((item) => (
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
          </div>

          <div className="p-4 border-t border-slate-50 mt-auto">
            <button 
              onClick={() => { setIsMobileMenuOpen(false); if (window.confirm('Are you sure you want to log out?')) signOut(); }}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
            >
              <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </motion.aside>
      </>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 pt-20 lg:pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
            <Route index element={
              <MentorOverview 
                applications={allApplications || []}
                bookings={allBookings || []}
                tasks={allTasks || []}
                onReviewTask={(t) => navigate('/dashboard/reviews', { state: { preselectedTask: t } })}
                onApplicationAction={handleApplicationAction}
                onNavigate={(path) => navigate(`/dashboard/${path}`)}
                onLogout={signOut}
              />
            } />
            <Route path="mentees" element={
              <MentorMentees 
                mentees={allApplications?.filter(a => a.status === 'approved') || []}
                onMessage={(id) => navigate('/dashboard/chat')}
                onRemove={handleDeleteApplication}
              />
            } />
            <Route path="sessions" element={
              <MentorSessions 
                bookings={allBookings || []}
                onStartCall={handleStartCall}
                onUpdateOfficeHours={() => setNotification('Office hours update interface opening...')}
              />
            } />
            <Route path="reviews" element={
              <MentorReviews 
                pendingTasks={allTasks?.filter(t => t.status === 'pending') || []}
                reviews={allReviews || []}
                onSubmitFeedback={submitFeedback}
              />
            } />
            <Route path="audits" element={
              <MentorApplications 
                pendingApplications={allApplications?.filter(a => a.status === 'pending') || []}
                onAction={handleApplicationAction}
              />
            } />
            <Route path="access-requests" element={
              <MentorAccessRequests />
            } />
            <Route path="events" element={
              <MentorEvents 
                events={allEvents}
                onAddEvent={handleCreateEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            } />
            <Route path="emails" element={
              <MentorEmailTemplates />
            } />
            <Route path="accounts" element={
              <MentorAccounts />
            } />
            <Route path="chat" element={
              <MentorChat currentUserId={currentUser?.id || ''} />
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black text-white p-6 rounded-3xl shadow-2xl z-[200] animate-in slide-in-from-top-4 duration-500 border border-white/10 whitespace-pre-wrap">
           <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-500 text-white rounded-xl"><Info size={20} /></div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Notification</p>
                <p className="text-[11px] font-medium leading-relaxed opacity-70">{notification}</p>
                <button onClick={() => setNotification(null)} className="text-[8px] font-black uppercase text-white/40 pt-2">Dismiss</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
