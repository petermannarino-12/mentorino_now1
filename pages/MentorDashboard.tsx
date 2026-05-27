import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell,
  Info,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { Booking, NetworkEvent } from '../src/types';
import { useMentorDashboardActions } from '../src/hooks/useMentorDashboardActions';
import { Loader } from '../src/components/ui/Loader';
import { MentorOverview } from './mentor/MentorOverview';
import { MentorMentees } from './mentor/MentorMentees';
import { MentorSessions } from './mentor/MentorSessions';
import { MentorReviews } from './mentor/MentorReviews';
import { MentorApplications } from './mentor/MentorApplications';
import { MentorEvents } from './mentor/MentorEvents';
import { MentorEmailTemplates } from './mentor/MentorEmailTemplates';
import { MentorAccounts } from './mentor/MentorAccounts';
import { useMentorDashboardData } from '../src/hooks/useMentorDashboardData';
import { useAuth } from '../src/contexts/AuthContext';
import SEO from '../src/components/SEO';

const MentorDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, signOut } = useAuth();
  const [notification, setNotification] = useState<string | null>(null);
  
  const {
    applications: allApplications,
    bookings: allBookings,
    tasks: allTasks,
    events: allEvents,
    reviews: allReviews,
    isLoading,
    error
  } = useMentorDashboardData();

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

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader />
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

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview';
    if (path === '/dashboard/mentees') return 'Active Mentees';
    if (path === '/dashboard/sessions') return 'Schedule';
    if (path === '/dashboard/reviews') return 'Reviews';
    if (path === '/dashboard/audits') return 'Inquiry Audit';
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

      {/* Header for Mobile */}
      <header className="lg:hidden pt-8 pb-4 px-6 bg-[#FDFDFD]">
        <div className="flex items-center gap-4">
          {location.pathname !== '/dashboard' && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-full shadow-md text-slate-900 active:scale-90 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Mentor Console</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">
               {getTitle()}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-12">
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
                onReviewTask={(t) => navigate('/dashboard/reviews')}
                onApplicationAction={handleApplicationAction}
                onNavigate={(path) => navigate(`/dashboard/${path}`)}
                onLogout={signOut}
              />
            } />
            <Route path="mentees" element={
              <MentorMentees 
                mentees={allApplications?.filter(a => a.status === 'approved') || []}
                onMessage={(id) => setNotification('Messaging interface opening...')}
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
