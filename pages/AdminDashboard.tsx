
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Search, 
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
  Plus,
  Package,
  CreditCard,
  Settings,
  ChevronRight,
  Star,
  BookOpen,
  LogOut,
  Mail,
  Phone,
  Activity,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getApplicationSummary, chatWithAssistant, getPreSessionBrief } from '../src/services/geminiService';
import { Application, Booking, User, AIChatMessage, TaskActivity, NetworkEvent, Announcement } from '../src/types';
import { formatToNJ, getNJISOString } from '../src/lib/dateUtils';
import ValidationRulesManager from '../src/components/admin/ValidationRulesManager';
import SEO from '../src/components/SEO';

interface AdminDashboardProps {
  applications: Application[];
  users: User[];
  onUpdateApp: (id: string, status: 'approved' | 'rejected' | 'pending' | 'deleted') => void;
  onDeleteApp: (id: string) => void;
  bookings: Booking[];
  taskActivities: TaskActivity[];
  events: NetworkEvent[];
  onUpdateTaskActivity: (id: string, status: 'reviewed', response?: string) => void;
  onAddEvent: (event: NetworkEvent) => void;
  onDeleteEvent: (id: string) => void;
  onLogout: () => void;
  onRefresh?: () => void;
  announcements?: Announcement[];
  onAddAnnouncement?: (ann: Announcement) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

type AdminTab = 'home' | 'applications' | 'sessions' | 'activities' | 'networking' | 'students' | 'more' | 'ai' | 'crm' | 'broadcast' | 'validation';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  applications, 
  users, 
  onUpdateApp, 
  onDeleteApp, 
  taskActivities, 
  onUpdateTaskActivity, 
  bookings, 
  events,
  onAddEvent,
  onDeleteEvent,
  onLogout, 
  onRefresh,
  announcements: propAnnouncements = [],
  onAddAnnouncement: _onAddAnnouncement,
  onDeleteAnnouncement
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') as AdminTab || 'home';
  
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [announcements, setAnnouncements] = useState<Announcement[]>(propAnnouncements);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<TaskActivity | null>(null);
  const [appInsights, setAppInsights] = useState<Record<string, any>>({});
  const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'low'|'medium'|'high'>('medium');

  const [localStudents, setLocalStudents] = useState<User[]>(users || []);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showBin, setShowBin] = useState(false);

  const localApplications = applications.filter(a => a.status !== 'deleted');
  const binApplications = applications.filter(a => a.status === 'deleted');

  const ACCEPT_EMAIL_TEMPLATE = `Dear {name},

Congratulations! Your application for mentorship with Mentorino has been reviewed and successfully accepted.

We were impressed with your application and your stated goals. Mentorino is looking forward to working with you.

{review_points}

Next Steps:
1. Log in to your dashboard.
2. Book your initial consultation session.
3. Review the onboarding materials.

Welcome to the program!

Best regards,
Mentorino Support Team`;

  const REJECT_EMAIL_TEMPLATE = `Dear {name},

Thank you for your interest in the mentorship program with Mentorino.

After careful consideration, we regret to inform you that we cannot move forward with your application at this stage. 

{review_points}

We wish you the very best in your professional growth and encourage you to re-apply in the future.

Best regards,
Mentorino Support Team`;

  useEffect(() => {
    if (users && users.length > 0) {
      setLocalStudents(users);
    }
  }, [users]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab') as AdminTab;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const REVENUE_DATA = [
    { name: 'Mon', amount: 1200 },
    { name: 'Tue', amount: 1900 },
    { name: 'Wed', amount: 1500 },
    { name: 'Thu', amount: 2100 },
    { name: 'Fri', amount: 2800 },
    { name: 'Sat', amount: 3200 },
    { name: 'Sun', amount: 2400 },
  ];

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pendingApps = localApplications.filter(a => a.status === 'pending');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const analyzeApplication = async (app: Application) => {
    setAppInsights(prev => ({ ...prev, [app.id]: { loading: true } }));
    const insight = await getApplicationSummary(app as any);
    setAppInsights(prev => ({ ...prev, [app.id]: { ...insight, loading: false } }));
  };

  const handleApprove = (app: Application) => {
    onUpdateApp(app.id, 'approved');
    const points = comment ? `Mentorino's Review Comments:\n${comment}\n` : '';
    const emailBody = ACCEPT_EMAIL_TEMPLATE
      .replace('{name}', app.user_name)
      .replace('{review_points}', points);
      
    setSelectedApp(null);
    setComment('');
    showNotification(`OFFICIAL EMAIL SENT TO ${app.user_email}:\n\n${emailBody}`);
  };

  const handleReject = (app: Application) => {
    onUpdateApp(app.id, 'rejected');
    const points = comment ? `Review Feedback:\n${comment}\n` : '';
    const emailBody = REJECT_EMAIL_TEMPLATE
      .replace('{name}', app.user_name)
      .replace('{review_points}', points);

    setSelectedApp(null);
    setComment('');
    showNotification(`OFFICIAL EMAIL SENT TO ${app.user_email}:\n\n${emailBody}`);
  };

  const handleAiChat = async (presetMsg?: string) => {
    const msg = presetMsg || userInput;
    if (!msg.trim()) return;
    
    if (!presetMsg) setUserInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
    setIsAiLoading(true);
    const response = await chatWithAssistant(chatHistory.map(m => ({ role: m.role, text: m.content })), msg);
    setChatHistory(prev => [...prev, { role: 'model', content: response || "Analysis unavailable." }]);
    setIsAiLoading(false);
  };

  const startBriefing = async (booking: Booking) => {
    setActiveTab('ai');
    setIsAiLoading(true);
    const contextStr = "General Program Session.";
    const ownedProductNames = [];

    const brief = await getPreSessionBrief(booking, contextStr, ownedProductNames);
    setChatHistory(prev => [
      ...prev, 
      { role: 'user', content: `Briefing for ${booking.user_name}` },
      { role: 'model', content: brief || "Briefing could not be generated at this time." }
    ]);
    setIsAiLoading(false);
  };

  const handleJoinSession = (booking: Booking) => {
    setNotification(`Starting session with ${booking.user_name}...\nCheck your secure mentor dashboard for materials.`);
    setTimeout(() => {
      window.open('https://meet.google.com/new', '_blank');
      setNotification(null);
    }, 2000);
  };

  const handleUpdateApp = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await onUpdateApp(id, status);
      setNotification(`Application ${status} successfully.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification('Failed to update application.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleSendBroadcast = () => {
    if (!broadcastTitle || !broadcastContent) {
      setNotification('Please enter a title and content for the broadcast.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    const newBroadcast = {
      id: `bc_${Date.now()}`,
      title: broadcastTitle,
      content: broadcastContent,
      priority: broadcastPriority,
      created_at: new Date().toISOString()
    };
    alert('Simulating sending broadcast: ' + JSON.stringify(newBroadcast));
    setBroadcastTitle('');
    setBroadcastContent('');
    setNotification('Broadcast sent successfully.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddTag = (studentId: string) => {
    const tag = "Strategist"; // Default tag for now to avoid prompt
    setLocalStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, tags: [...(s.tags || []), tag] } : s
    ));
    setNotification(`Tag "${tag}" added to student.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddTask = (studentId: string) => {
    const title = "New Strategic Task"; // Default title
    const newTask = { id: Date.now().toString(), title, description: '', status: 'pending' as const, due_date: 'Next Week' };
    setLocalStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, tasks: [...(s.tasks || []), newTask] } : s
    ));
    setNotification(`Task "${title}" assigned.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddNote = (studentId: string) => {
    const note = "Follow up required."; // Default note
    setLocalStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, notes: [...(s.notes || []), note] } : s
    ));
    setNotification(`Note added to student profile.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const renderHome = () => (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-700 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'New Apps', value: pendingApps.length, icon: ClipboardList, color: 'text-amber-500', tab: 'applications', trend: 'Review' },
          { label: 'Networking', value: events.length, icon: Sparkles, color: 'text-indigo-500', tab: 'networking', trend: 'Live' },
          { label: 'Strategy Audits', value: taskActivities.filter(t => t.status === 'pending').length, icon: Activity, color: 'text-emerald-500', tab: 'activities', trend: 'Action' },
          { label: 'Sessions', value: upcomingBookings.length, icon: Calendar, color: 'text-blue-500', tab: 'sessions', trend: '+5%' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveTab(stat.tab as AdminTab)} 
            className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-black/[0.03] space-y-3 sm:space-y-4 cursor-pointer hover:border-black/10 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${stat.color.replace('text', 'bg')}/10 ${stat.color} group-hover:scale-110 transition-transform`} aria-hidden="true">
                <stat.icon size={20} className="sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">{stat.trend}</span>
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <h4 className="text-3xl sm:text-4xl font-black tracking-tighter">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-6 sm:space-y-8">
          <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[40px] sm:rounded-[56px] border border-black/[0.03] shadow-sm space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Activity Overview</h3>
                <p className="text-xl sm:text-2xl font-black">Program Engagement</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-6 sm:p-8 bg-slate-50 rounded-[32px] sm:rounded-[40px] space-y-1 sm:space-y-2">
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Mentees</p>
                <p className="text-4xl sm:text-5xl font-black">{localStudents.filter(s => s.mentorship_status === 'active').length}</p>
              </div>
              <div className="p-6 sm:p-8 bg-slate-50 rounded-[32px] sm:rounded-[40px] space-y-1 sm:space-y-2">
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed Sessions</p>
                <p className="text-4xl sm:text-5xl font-black">{bookings.filter(b => b.status === 'completed').length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Recent Applications Mini-List */}
            <div className="bg-white p-6 sm:p-8 rounded-[36px] sm:rounded-[48px] border border-black/[0.03] shadow-sm space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Inbound</h3>
                <button onClick={() => setActiveTab('applications')} className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-500 hover:opacity-70 transition-opacity">View All</button>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {localApplications.slice(0, 4).map(app => (
                  <div key={app.id} className="flex items-center justify-between group cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-[10px] sm:text-xs font-black">{(app.user_name || '?').charAt(0)}</div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] sm:text-xs font-black uppercase truncate max-w-[100px] sm:max-w-[120px]">{app.user_name}</p>
                        <p className="text-[7px] sm:text-[9px] text-slate-400 font-bold uppercase">{app.mentor_type}</p>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-200 group-hover:text-black transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions Mini-List */}
            <div className="bg-white p-6 sm:p-8 rounded-[36px] sm:rounded-[48px] border border-black/[0.03] shadow-sm space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Next Sessions</h3>
                <button onClick={() => setActiveTab('sessions')} className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-500 hover:opacity-70 transition-opacity">View All</button>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {upcomingBookings.slice(0, 4).map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-[10px] sm:text-xs font-black">{(s.user_name || '?').charAt(0)}</div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] sm:text-xs font-black uppercase truncate max-w-[100px] sm:max-w-[120px]">{s.user_name}</p>
                        <p className="text-[7px] sm:text-[9px] text-slate-400 font-bold uppercase">{s.time}</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200">
                      <span className="sr-only">Active Session</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-4 space-y-8">
          {/* AI Quick Strategy */}
          <div className="bg-black text-white p-8 sm:p-10 rounded-[40px] sm:rounded-[56px] shadow-2xl space-y-6 sm:space-y-8 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="space-y-3 sm:space-y-4 relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center"><Sparkles size={20} className="text-amber-400 sm:w-6 sm:h-6" /></div>
              <div className="space-y-1 sm:space-y-2">
                <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tighter leading-none">AI Strategy <br />Partner</h4>
                <p className="text-[8px] sm:text-[10px] text-white/50 font-bold uppercase tracking-widest leading-relaxed">Instantly audit programs and generate pre-session briefs.</p>
              </div>
            </div>
            <button onClick={() => setActiveTab('ai')} className="w-full py-4 sm:py-5 bg-white text-black text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-slate-200 transition-all active:scale-95 relative">Launch Assistant</button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 sm:p-10 rounded-[40px] sm:rounded-[56px] border border-black/[0.03] shadow-sm space-y-6 sm:space-y-8">
            <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Command</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button onClick={() => setShowAvailabilityModal(true)} className="p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-[32px] flex flex-col items-center gap-2 sm:gap-3 hover:bg-black hover:text-white transition-all duration-500 group">
                <Clock size={18} className="text-slate-400 group-hover:text-white sm:w-5 sm:h-5" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Schedule</span>
              </button>
              <button onClick={() => setActiveTab('activities')} className="p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-[32px] flex flex-col items-center gap-2 sm:gap-3 hover:bg-black hover:text-white transition-all duration-500 group">
                <ClipboardList size={18} className="text-slate-400 group-hover:text-white sm:w-5 sm:h-5" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Audits</span>
              </button>
              <button onClick={() => setActiveTab('students')} className="p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-[32px] flex flex-col items-center gap-2 sm:gap-3 hover:bg-black hover:text-white transition-all duration-500 group">
                <Users size={18} className="text-slate-400 group-hover:text-white sm:w-5 sm:h-5" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Students</span>
              </button>
              <button onClick={() => setShowGuidelinesModal(true)} className="p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-[32px] flex flex-col items-center gap-2 sm:gap-3 hover:bg-black hover:text-white transition-all duration-500 group">
                <BookOpen size={18} className="text-slate-400 group-hover:text-white sm:w-5 sm:h-5" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">SOPs</span>
              </button>
              <button onClick={() => setActiveTab('broadcast')} className="p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-[32px] flex flex-col items-center gap-2 sm:gap-3 hover:bg-black hover:text-white transition-all duration-500 group col-span-2">
                <Star size={18} className="text-slate-400 group-hover:text-white sm:w-5 sm:h-5" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Global Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Program Inbound</h3>
          <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Total: {localApplications.length}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button 
            onClick={() => setShowBin(!showBin)}
            className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all ${showBin ? 'bg-black text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            {showBin ? 'Hide Bin' : 'Show Bin'}
          </button>
          <button 
            onClick={() => onRefresh ? onRefresh() : setNotification('Refreshing data...')} 
            className="text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full hover:bg-black hover:text-white transition-all"
          >
            Refresh Data
          </button>
          <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-full">{localApplications.filter(a => a.status === 'pending').length} New Audit</span>
        </div>
      </div>

      <div className="space-y-4">
        {localApplications.length > 0 ? localApplications.map(app => (
          <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-white p-6 rounded-[40px] border border-black/[0.03] shadow-sm flex items-center justify-between group cursor-pointer hover:border-black/10 active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4 overflow-hidden">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-lg">
                 {(app.user_name || '?').charAt(0)}
               </div>
               <div className="overflow-hidden">
                 <h4 className="text-sm font-black uppercase truncate">{app.user_name}</h4>
                 <div className="flex items-center gap-2">
                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{app.mentor_type}</span>
                   <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full {(app.status === 'approved') ? 'bg-emerald-50 text-emerald-500' : app.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>{app.status}</span>
                 </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (!window.confirm(`Delete ${app.user_name}'s application? This cannot be undone.`)) return;
                  onUpdateApp(app.id, 'deleted');
                  setNotification('Application moved to bin.');
                  setTimeout(() => setNotification(null), 3000);
                }}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                aria-label={`Move ${app.user_name}'s application to bin`}
              >
                <XCircle size={16} />
              </button>
              <ChevronRight size={16} className="text-slate-200" />
            </div>
          </div>
        )) : <div className="text-center py-20 text-slate-400 font-black uppercase text-[10px]">No applications found</div>}
      </div>

      {showBin && (
        <div className="pt-12 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-2 mb-4">Recycle Bin</h3>
          <div className="space-y-4">
            {binApplications.length > 0 ? binApplications.map(app => (
              <div key={app.id} className="bg-white p-6 rounded-[40px] border border-black/[0.03] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-lg">
                     {(app.user_name || '?').charAt(0)}
                   </div>
                   <div className="overflow-hidden">
                     <h4 className="text-sm font-black uppercase truncate">{app.user_name}</h4>
                     <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{app.mentor_type}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      onUpdateApp(app.id, 'pending');
                      setNotification('Application restored.');
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"
                    aria-label={`Restore ${app.user_name}'s application`}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if (!window.confirm(`Permanently delete ${app.user_name}'s application? This cannot be undone.`)) return;
                      onDeleteApp(app.id);
                      setNotification('Application permanently deleted.');
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    aria-label={`Delete ${app.user_name}'s application permanently`}
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            )) : <div className="text-center py-10 text-slate-400 font-black uppercase text-[10px]">Bin is empty</div>}
          </div>
        </div>
      )}
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sessions</h3>
        <Link to="/booking" className="text-[9px] font-black uppercase tracking-widest border-b border-black">Block Time</Link>
      </div>

      <div className="space-y-4">
        {upcomingBookings.length > 0 ? upcomingBookings.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-[40px] border border-black/[0.03] shadow-sm space-y-4 hover:border-black/10 transition-all">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-black">{(s.user_name || '?').charAt(0)}</div>
                  <div>
                    <h4 className="text-xs font-black uppercase">{s.user_name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{s.time} • Kickoff Call</p>
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase">{formatToNJ(s.date, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
             </div>
             <div className="flex gap-2">
               <button onClick={() => handleJoinSession(s)} className="flex-1 py-4 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 active:scale-95 transition-all">Start Call</button>
               <button onClick={() => startBriefing(s)} className="px-5 py-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-black active:scale-95 transition-all" aria-label="View AI Briefing"><Star size={16} /></button>
             </div>
          </div>
        )) : <div className="text-center py-20 text-slate-400 font-black uppercase text-[10px]">No sessions today</div>}
      </div>
    </div>
  );

  const handleReviewActivity = (activityId: string) => {
    onUpdateTaskActivity(activityId, 'reviewed', comment);
    setSelectedActivity(null);
    setComment('');
    showNotification('Activity audit completed and feedback sent to student.');
  };

  const renderActivities = () => (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Activity Audits</h3>
        <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-full">{taskActivities.filter(t => t.status === 'pending').length} Unreviewed</span>
      </div>

      <div className="space-y-4">
        {taskActivities.length > 0 ? taskActivities.map(activity => (
          <div key={activity.id} onClick={() => setSelectedActivity(activity)} className="bg-white p-6 rounded-[40px] border border-black/[0.03] shadow-sm flex items-center justify-between group cursor-pointer hover:border-black/10 active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-lg">
                 {(activity.user_name || '?').charAt(0)}
               </div>
               <div>
                 <h4 className="text-sm font-black uppercase">{activity.user_name}</h4>
                 <div className="flex items-center gap-2">
                   <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                     {activity.roadmap_topic ? 'Growth Strategy' : 'Networking Update'}
                   </p>
                   <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${activity.status === 'reviewed' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>{activity.status}</span>
                 </div>
               </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[8px] font-bold text-slate-300 uppercase">{formatToNJ(activity.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <ChevronRight size={16} className="text-slate-200" />
            </div>
          </div>
        )) : (
          <div className="bg-slate-50 p-12 rounded-[48px] text-center border border-dashed border-slate-200">
            <Activity size={32} className="mx-auto text-slate-300 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No activities found</p>
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#FAFAFA] w-full max-w-2xl rounded-[56px] shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 pb-4 flex items-center justify-between border-b border-black/[0.03] bg-white">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black">{(selectedActivity.user_name || '?').charAt(0)}</div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">{selectedActivity.user_name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit ID: {selectedActivity.id.slice(0, 8)}</p>
                 </div>
               </div>
               <button onClick={() => setSelectedActivity(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors" aria-label="Close activity detail"><XCircle size={20} className="text-slate-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
               {/* 2nd Form Data (Growth Strategy) */}
               {selectedActivity.roadmap_topic && (
                 <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Personal Branding Audit</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Business Card', val: selectedActivity.pb_card_details },
                          { label: 'LinkedIn', val: selectedActivity.pb_linkedin_url },
                          { label: 'Resume', val: selectedActivity.pb_resume_link },
                          { label: 'Cover Letter', val: selectedActivity.pb_cover_letter_link },
                          { label: 'Dress Code', val: selectedActivity.pb_dress_code_notes },
                          { label: 'Greeting', val: selectedActivity.pb_greeting_intro_notes },
                        ].map(item => (
                          <div key={item.label} className={`flex items-center justify-between p-4 rounded-2xl border ${item.val ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50'}`}>
                             <span className="text-[9px] font-black uppercase">{item.label}</span>
                             {item.val ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Career Roadmap</h4>
                      <div className="bg-white p-6 rounded-3xl border border-black/[0.03] shadow-sm">
                        <p className="text-xs font-medium text-slate-600 italic leading-relaxed">"{selectedActivity.roadmap_topic}"</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Interview Prep</h4>
                      <div className="bg-white p-6 rounded-3xl border border-black/[0.03] shadow-sm">
                        <p className="text-xs font-medium text-slate-600 italic leading-relaxed">"{selectedActivity.interview_recommendation}"</p>
                      </div>
                    </div>
                 </div>
               )}

               {/* Networking Data */}
               {selectedActivity.net_attended_event && (
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Networking Report</h4>
                    <div className="bg-white p-6 rounded-3xl border border-black/[0.03] shadow-sm space-y-4">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Event Attended</p>
                        <p className="text-xs font-black uppercase">{selectedActivity.net_attended_event}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">People Met</p>
                        <p className="text-[11px] font-medium">{selectedActivity.net_people_met}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Contact Info</p>
                        <p className="text-[11px] font-medium">{selectedActivity.net_contact_info}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Key Takeaways</p>
                        <p className="text-[11px] font-medium italic">"{selectedActivity.net_panel_summary}"</p>
                      </div>
                    </div>
                 </div>
               )}

               {/* Mentor Feedback Area */}
               <div className="space-y-4 pt-6 border-t border-black/[0.03]">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Send Feedback</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide professional feedback on this progress..."
                    className="w-full p-6 bg-white border border-black/[0.05] rounded-[32px] text-xs font-medium focus:border-black outline-none min-h-[120px] shadow-sm"
                  />
                  <div className="flex gap-4">
                    <button onClick={() => setSelectedActivity(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-100 transition-all">Cancel</button>
                    <button onClick={() => handleReviewActivity(selectedActivity.id)} className="flex-[2] py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-black/10">Audit & Send Feedback</button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const updateStudent = (updatedStudent: User) => {
    setLocalStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (selectedStudent && selectedStudent.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }
  };

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: NetworkEvent = {
      id: crypto.randomUUID(),
      ...newEvent,
      attendees: [],
      created_at: getNJISOString()
    };
    onAddEvent(event);
    setNewEvent({ title: '', description: '', date: '', time: '', location: '' });
    showNotification('Networking event listed successfully and students notified.');
  };

  const renderNetworking = () => (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Live Events</h3>
            <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{events.length} Active</span>
          </div>
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="bg-white p-8 rounded-[48px] border border-black/[0.03] shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <button 
                    onClick={() => onDeleteEvent(event.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    aria-label="Delete event"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black uppercase tracking-tight">{event.title}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{formatToNJ(event.date, { month: 'short', day: 'numeric', year: 'numeric' })} • {event.time}</p>
                  <p className="text-xs text-slate-500">{event.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {event.attendees.slice(0, 3).map(id => (
                      <div key={id} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black uppercase">
                        {(users.find(u => u.id === id)?.full_name || '?').charAt(0)}
                      </div>
                    ))}
                    {event.attendees.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                        +{event.attendees.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{event.attendees.length} Students Attending</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Event Form */}
        <div className="bg-white p-10 rounded-[56px] border border-black/[0.03] shadow-sm space-y-8 h-fit lg:sticky lg:top-8">
          <div className="space-y-2 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto"><Plus size={32} /></div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">List New Event</h3>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mentorino Attending</p>
          </div>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
              <input 
                type="text" 
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all" 
                placeholder="Tech Networking Mixer" 
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <input 
                  type="date" 
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                <input 
                  type="time" 
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all" 
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
              <input 
                type="text" 
                value={newEvent.location}
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all" 
                placeholder="Innovation Lab" 
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-xs font-medium focus:bg-white focus:border-black transition-all min-h-[100px]" 
                placeholder="Details for students..." 
                required
              />
            </div>
            <button type="submit" className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-black/10">Publish & Notify Students</button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderCRM = () => (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Lead Management</h3>
        <div className="flex gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{localApplications.filter(a => a.status === 'pending').length} Unverified</span>
          <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">{localApplications.filter(a => a.status === 'approved').length} Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {localApplications.map(app => (
          <div key={app.id} className="bg-white p-6 rounded-[40px] border border-black/[0.03] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black">{(app.user_name || '?').charAt(0)}</div>
                <div>
                  <h4 className="text-xs font-black uppercase">{app.user_name}</h4>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Source: {app.source || 'Direct'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {(app.tags || []).map(tag => (
                  <span key={tag} className="text-[7px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedApp(app)} className="flex-1 py-3 bg-slate-50 text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">View Details</button>
              <button onClick={() => handleAddTag(app.id)} className="px-4 py-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all" aria-label="Add tag"><Plus size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Mentee Directory</h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" className="pl-9 pr-4 py-2 bg-white border border-black/[0.03] rounded-full text-[10px] w-40 outline-none focus:border-black/20" placeholder="Search..." />
        </div>
      </div>

      <div className="space-y-4">
        {localStudents.map(s => (
          <div key={s.id} onClick={() => setSelectedStudent(s)} className="bg-white p-6 rounded-[40px] border border-black/[0.03] flex items-center justify-between hover:border-black/10 active:scale-[0.99] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">{(s.full_name || '?').charAt(0)}</div>
               <div>
                 <h4 className="text-sm font-black uppercase">{s.full_name}</h4>
                 <div className="flex items-center gap-2">
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.mentorship_status}</p>
                   {(s.tags || []).map(tag => (
                     <span key={tag} className="text-[7px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{tag}</span>
                   ))}
                 </div>
               </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] font-black uppercase">Progress</p>
                <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(s.milestones?.filter(m => m.completed).length || 0) / (s.milestones?.length || 1) * 100}%` }}></div>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBroadcast = () => (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Strategy Broadcast</h3>
        <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">{announcements.length} Live Updates</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2">Active Updates</h4>
          {announcements.map(ann => (
            <div key={ann.id} className="bg-white p-6 rounded-[40px] border border-black/[0.03] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  ann.priority === 'high' ? 'bg-red-50 text-red-500' : 
                  ann.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 
                  'bg-slate-50 text-slate-400'
                }`}>
                  {ann.priority}
                </div>
                <button 
                  onClick={() => {
                    if (!window.confirm('Delete this broadcast?')) return;
                    const filtered = announcements.filter(a => a.id !== ann.id);
                    setAnnouncements(filtered);
                    if (onDeleteAnnouncement) onDeleteAnnouncement(ann.id);
                    showNotification('Broadcast removed.');
                  }}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  aria-label="Delete broadcast"
                >
                  <XCircle size={16} />
                </button>
              </div>
              <div>
                <h5 className="text-sm font-black uppercase">{ann.title}</h5>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed mt-2">{ann.content}</p>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-300">
                <span>{ann.program_type || 'All Students'}</span>
                <span>{formatToNJ(ann.created_at, { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-black text-white p-10 rounded-[56px] shadow-2xl space-y-8 h-fit lg:sticky lg:top-8">
          <div className="space-y-2 text-center">
             <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center mx-auto"><Star size={32} /></div>
             <h3 className="text-2xl font-black uppercase tracking-tighter">New Broadcast</h3>
             <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Sent to Mentorino's Mentees</p>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="Broadcast Title" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium focus:border-white transition-all"
            />
            <textarea 
              value={broadcastContent}
              onChange={(e) => setBroadcastContent(e.target.value)}
              placeholder="Strategic update content..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium focus:border-white transition-all min-h-[120px]"
            ></textarea>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setBroadcastPriority(p as any)}
                  className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${broadcastPriority === p ? 'bg-white text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button 
              onClick={handleSendBroadcast}
              className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-slate-200 transition-all"
            >
              Send Global Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMore = () => (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Availability', icon: Clock, onClick: () => setShowAvailabilityModal(true) },
          { label: 'Digital Products', icon: Package, onClick: () => navigate('/store') },
          { label: 'Revenue/Fin', icon: CreditCard, onClick: () => navigate('/admin/revenue') },
          { label: 'AI Partner', icon: Sparkles, onClick: () => setActiveTab('ai') },
          { label: 'Guidelines', icon: BookOpen, onClick: () => setShowGuidelinesModal(true) },
          { label: 'Data Rules', icon: ShieldCheck, onClick: () => setActiveTab('validation') },
          { label: 'Settings', icon: Settings, onClick: () => navigate('/settings') },
        ].map(item => (
          <button key={item.label} onClick={item.onClick} className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-sm hover:shadow-xl hover:border-black/10 hover:scale-[1.02] active:scale-95 transition-all group">
             <div className="p-4 bg-slate-50 rounded-3xl group-hover:bg-black group-hover:text-white transition-all"><item.icon size={24} /></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black">{item.label}</span>
          </button>
        ))}
      </div>
      <button onClick={onLogout} className="w-full py-5 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-full border border-red-100 flex items-center justify-center gap-3 hover:bg-red-100 active:scale-95 transition-all">
        <LogOut size={16} /> System Logout
      </button>
    </div>
  );

  const renderAI = () => (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 flex flex-col h-[70vh] md:h-[75vh]">
      <div className="space-y-2">
        <h3 className="text-3xl font-black uppercase tracking-tighter">AI Assistant</h3>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Admin Strategic Support</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-1 bg-slate-50/30 rounded-[32px] p-2">
        {chatHistory.length === 0 && (
          <div className="py-10 text-center space-y-4">
             <Sparkles size={32} className="mx-auto text-amber-500" />
             <p className="text-xs text-slate-400 max-w-[200px] mx-auto font-medium leading-relaxed italic">"Summarize newest applications or generate a pre-session brief."</p>
          </div>
        )}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[28px] text-[11px] leading-relaxed shadow-sm ${
              msg.role === 'user' ? 'bg-black text-white' : 'bg-white border border-black/[0.03] text-slate-900 font-medium'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isAiLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-black/[0.03] p-4 rounded-[28px] flex items-center gap-3">
              <Star size={14} className="text-amber-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Generating Strategy...</span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button 
          onClick={() => setUserInput("You are accepted I'm looking forward to meeting with you to discuss your goals.")}
          className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-2 rounded-full hover:bg-emerald-100 transition-all mb-2"
        >
          Rubberstamp Acceptance
        </button>
        <div className="relative">
          <input 
            type="text" 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
            placeholder="Ask strategy brief..." 
            className="w-full bg-white border border-black/[0.03] rounded-[24px] px-6 py-4 text-xs font-medium focus:border-black outline-none transition-all pr-12 shadow-sm"
          />
          <button onClick={() => handleAiChat()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full active:scale-90 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent relative">
      <SEO 
        title="Admin Control | Mentorino Executive" 
        description="Core management system for the Mentorino platform. Security, audits, and strategic control."
      />
      {/* Simulation Notification */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black text-white p-6 rounded-3xl shadow-2xl z-[200] animate-in slide-in-from-top-4 duration-500 border border-white/10">
           <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-500 text-white rounded-xl"><Mail size={20} /></div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Notification</p>
                <p className="text-[11px] font-medium leading-relaxed opacity-70">{notification}</p>
              </div>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="px-4 sm:px-6 py-8 sm:py-10 space-y-4 sm:space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="black" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#smallGrid)" />
            </svg>
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
               <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
               <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Admin Console</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-black leading-none">
            {activeTab === 'home' && <>Home <br /><span className="text-slate-200">Today.</span></>}
            {activeTab === 'applications' && <>Review <br /><span className="text-slate-200">Inbound.</span></>}
            {activeTab === 'sessions' && <>Manage <br /><span className="text-slate-200">Workflow.</span></>}
            {activeTab === 'activities' && <>Audit <br /><span className="text-slate-200">Activity.</span></>}
            {activeTab === 'networking' && <>Strategic <br /><span className="text-slate-200">Events.</span></>}
            {activeTab === 'students' && <>Active <br /><span className="text-slate-200">Participants.</span></>}
            {activeTab === 'crm' && <>Lead <br /><span className="text-slate-200">Management.</span></>}
            {activeTab === 'broadcast' && <>Strategy <br /><span className="text-slate-200">Broadcast.</span></>}
            {activeTab === 'more' && <>System <br /><span className="text-slate-200">Tools.</span></>}
            {activeTab === 'ai' && <>AI <br /><span className="text-slate-200">Partner.</span></>}
            {activeTab === 'validation' && <>Validation <br /><span className="text-slate-200">Engine.</span></>}
          </h1>
        </header>

        <main className="px-4 sm:px-6 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {activeTab === 'home' && renderHome()}
              {activeTab === 'applications' && renderApplications()}
              {activeTab === 'sessions' && renderSessions()}
              {activeTab === 'activities' && renderActivities()}
              {activeTab === 'networking' && renderNetworking()}
              {activeTab === 'students' && renderStudents()}
              {activeTab === 'crm' && renderCRM()}
              {activeTab === 'broadcast' && renderBroadcast()}
              {activeTab === 'more' && renderMore()}
              {activeTab === 'ai' && renderAI()}
              {activeTab === 'validation' && <ValidationRulesManager />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {showAvailabilityModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500">
            <button onClick={() => setShowAvailabilityModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><XCircle size={20} className="text-slate-400" /></button>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto"><Clock size={32} /></div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Set Availability</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage your program hours</p>
              </div>
              <div className="space-y-4">
                {['Monday', 'Wednesday', 'Friday'].map(day => (
                  <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-black uppercase">{day}</span>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold text-slate-400">09:00 - 17:00</span>
                      <button onClick={() => showNotification("Time slot settings opened.")} className="text-blue-500 hover:text-blue-600"><Settings size={14} /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => {
                  showNotification('Availability updated successfully.');
                  setShowAvailabilityModal(false);
                }} className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all">Save Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Modal */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500 max-h-[80vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setShowGuidelinesModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><XCircle size={20} className="text-slate-400" /></button>
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto"><BookOpen size={32} /></div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Mentor Guidelines</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Operating Procedures</p>
              </div>
              <div className="space-y-6 text-[11px] font-medium leading-relaxed text-slate-600">
                <section className="space-y-2">
                  <h4 className="font-black text-black uppercase tracking-widest">1. Application Review</h4>
                  <p>Review all inbound applications within 48 hours. Use the AI Strategy Audit to identify high-potential participants who align with your core expertise.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-black text-black uppercase tracking-widest">2. Session Conduct</h4>
                  <p>Always start sessions on time. Use the Pre-Session Briefing tool to review participant progress and previous notes before joining the call.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-black text-black uppercase tracking-widest">3. CRM Management</h4>
                  <p>Keep participant tags updated. Use tags like "High Seriousness", "Career Pivot", or "Technical Growth" to segment your audience for targeted resources.</p>
                </section>
                <button onClick={() => setShowGuidelinesModal(false)} className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all">I Understand</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh]">
             <button onClick={() => setSelectedStudent(null)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full z-[120] hover:bg-slate-100 transition-colors"><XCircle size={20} className="text-slate-400" /></button>
             <div className="p-10 overflow-y-auto no-scrollbar space-y-10">
                <div className="text-center space-y-2">
                   <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto">{(selectedStudent.full_name || '?').charAt(0)}</div>
                   <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedStudent.full_name}</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedStudent.email}</p>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Tasks</h4>
                      <div className="space-y-2">
                         {(selectedStudent.tasks || []).map(task => (
                           <div key={task.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-black/[0.02]">
                              <div>
                                 <p className="text-xs font-black uppercase">{task.title}</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">Due: {task.due_date}</p>
                              </div>
                              <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{task.status}</span>
                           </div>
                         ))}
                         <button onClick={() => handleAddTask(selectedStudent.id)} className="w-full py-3 border border-dashed border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all">+ Assign Task</button>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Milestones</h4>
                      <div className="space-y-2">
                         {(selectedStudent.milestones || []).map(m => (
                           <div key={m.id} className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-black/[0.02]">
                              <div className={`w-2 h-2 rounded-full ${m.completed ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                              <p className="text-xs font-black uppercase">{m.title}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mentor Notes</h4>
                      <div className="space-y-2">
                         {(selectedStudent.notes || []).map((note, i) => (
                           <div key={i} className="p-4 bg-slate-50 rounded-2xl text-[10px] font-medium leading-relaxed italic border border-black/[0.02]">
                              "{note}"
                           </div>
                         ))}
                         <button onClick={() => handleAddNote(selectedStudent.id)} className="w-full py-3 border border-dashed border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all">+ Add Note</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {selectedActivity && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh]">
              <button onClick={() => setSelectedActivity(null)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full z-[120] hover:bg-slate-100 transition-colors" aria-label="Close activity details"><XCircle size={20} className="text-slate-400" /></button>
              <div className="p-10 overflow-y-auto no-scrollbar space-y-10">
                <div className="text-center space-y-2">
                   <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto">{(selectedActivity.user_name || '?').charAt(0)}</div>
                   <h2 className="text-2xl font-black uppercase tracking-tighter">Task Audit</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedActivity.user_name}</p>
                </div>

                <div className="space-y-6">
                  {/* Branding Summary */}
                  <div className="p-6 bg-slate-50 rounded-[32px] space-y-4 border border-black/[0.02]">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Personal Branding Details</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Card Details', val: selectedActivity.pb_card_details },
                        { label: 'LinkedIn', val: selectedActivity.pb_linkedin_url, isLink: true },
                        { label: 'Resume', val: selectedActivity.pb_resume_link, isLink: true },
                        { label: 'Cover Letter', val: selectedActivity.pb_cover_letter_link, isLink: true },
                        { label: 'Dress Code', val: selectedActivity.pb_dress_code_notes },
                        { label: 'Greeting & Intro', val: selectedActivity.pb_greeting_intro_notes },
                      ].map(item => (
                        <div key={item.label} className="space-y-1">
                          <p className="text-[7px] font-black text-slate-300 uppercase">{item.label}</p>
                          {item.isLink && item.val ? (
                            <a href={item.val} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-600 truncate block hover:underline">{item.val}</a>
                          ) : (
                            <p className="text-[10px] font-bold text-slate-900">{item.val || 'N/A'}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Networking & Other Sections */}
                  <div className="space-y-4">
                    <div className="p-6 bg-slate-50 rounded-[32px] space-y-3 border border-black/[0.02]">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Networking</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[7px] font-black text-slate-300 uppercase">Event</p>
                          <p className="text-[10px] font-bold">{selectedActivity.net_attended_event || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-black text-slate-300 uppercase">People Met</p>
                          <p className="text-[10px] font-bold">{selectedActivity.net_people_met || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-black text-slate-300 uppercase">Contact info</p>
                          <p className="text-[10px] font-bold">{selectedActivity.net_contact_info || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-black text-slate-300 uppercase">Panel Summary</p>
                          <p className="text-[10px] font-medium italic">"{selectedActivity.net_panel_summary || 'N/A'}"</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[32px] space-y-3 border border-black/[0.02]">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Partner Work</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[7px] font-black text-slate-300 uppercase">Introduction</p>
                          <p className="text-[10px] font-bold">{selectedActivity.pw_introduction || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-black text-slate-300 uppercase">Volunteer Hours</p>
                          <p className="text-[10px] font-bold">{selectedActivity.pw_volunteer_hours || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-[32px] space-y-1 border border-black/[0.02]">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cert Planning</p>
                        <p className="text-[10px] font-black uppercase text-slate-900">{selectedActivity.cert_topic || 'N/A'}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[32px] space-y-1 border border-black/[0.02]">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Career Roadmap</p>
                        <p className="text-[10px] font-black uppercase text-slate-900">{selectedActivity.roadmap_topic || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[32px] space-y-1 border border-black/[0.02]">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Interview Prep</p>
                      <p className="text-[10px] font-medium font-bold uppercase">{selectedActivity.interview_recommendation || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Mentor Feedback</label>
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium outline-none focus:border-black transition-all"
                        placeholder="Provide feedback on these activities..."
                      />
                    </div>
                    <button 
                      onClick={() => {
                        onUpdateTaskActivity(selectedActivity.id, 'reviewed', comment);
                        setSelectedActivity(null);
                        setComment('');
                        showNotification('Task audit reviewed and feedback sent.');
                      }}
                      className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 active:scale-[0.98] transition-all"
                    >
                      Complete Review
                    </button>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh]">
             <button onClick={() => setSelectedApp(null)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full z-[120] hover:bg-slate-100 transition-colors"><XCircle size={20} className="text-slate-400" /></button>
             <div className="p-10 overflow-y-auto no-scrollbar space-y-10">
                <div className="text-center space-y-2">
                   <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto">{(selectedApp.user_name || '?').charAt(0)}</div>
                   <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedApp.user_name}</h2>
                   <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Mail size={12} /> {selectedApp.user_email}</div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Phone size={12} /> {selectedApp.user_phone}</div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="p-6 bg-slate-50 rounded-[32px] space-y-1 border border-black/[0.02]">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mentor Type Seeking</p>
                      <p className="text-xs font-black uppercase text-slate-900">{selectedApp.mentor_type}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-[32px] space-y-1 border border-black/[0.02]">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Meeting Preference</p>
                        <p className="text-xs font-black uppercase text-slate-900">{selectedApp.meeting_preference}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[32px] space-y-1 border border-black/[0.02]">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Frequency</p>
                        <p className="text-xs font-black uppercase text-slate-900">{selectedApp.frequency}</p>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-[32px] space-y-2 border border-black/[0.02]">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Main Goal</p>
                      <p className="text-[11px] font-medium leading-relaxed italic">"{selectedApp.goals}"</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-[32px] flex items-center justify-between border border-black/[0.02]">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Seriousness Level</p>
                      <div className="flex items-center gap-2">
                         <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-black" style={{ width: `${selectedApp.seriousness * 10}%` }}></div>
                         </div>
                         <span className="text-xs font-black">{selectedApp.seriousness}/10</span>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Sparkles size={14} className="text-amber-500" /><span className="text-[9px] font-black uppercase tracking-widest text-amber-600">AI Intelligence Audit</span></div>
                   </div>
                   {appInsights[selectedApp.id]?.loading ? (
                     <div className="flex gap-1 animate-pulse"><div className="w-2 h-2 bg-amber-200 rounded-full"></div><div className="w-2 h-2 bg-amber-200 rounded-full"></div></div>
                   ) : appInsights[selectedApp.id] ? (
                     <p className="text-[11px] font-bold text-amber-900 leading-relaxed italic">{appInsights[selectedApp.id].summary}</p>
                   ) : (
                     <button onClick={() => analyzeApplication(selectedApp)} className="w-full py-4 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-100 active:scale-[0.98] transition-all">Generate Strategy Audit</button>
                   )}
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Review Comment</label>
                     <button 
                       onClick={() => setComment("You are accepted I'm looking forward to meeting with you to discuss your goals.")}
                       className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full hover:bg-emerald-100 transition-all"
                     >
                       Rubberstamp Acceptance
                     </button>
                   </div>
                   <textarea 
                     value={comment}
                     onChange={(e) => setComment(e.target.value)}
                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium outline-none focus:border-black transition-all"
                     placeholder="Add a comment for the applicant..."
                   />
                   
                   {/* Email Template Previewers */}
                   <div className="grid grid-cols-2 gap-4 mt-2">
                     <div className="space-y-2">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Acceptance Preview</p>
                       <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-[9px] text-emerald-800 leading-relaxed font-medium h-32 overflow-y-auto no-scrollbar">
                         {ACCEPT_EMAIL_TEMPLATE
                           .replace('{name}', selectedApp.user_name)
                           .replace('{review_points}', comment ? `Mentorino's Review Comments:\n${comment}` : '')}
                       </div>
                     </div>
                     <div className="space-y-2">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Preview</p>
                       <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-[9px] text-red-800 leading-relaxed font-medium h-32 overflow-y-auto no-scrollbar">
                         {REJECT_EMAIL_TEMPLATE
                           .replace('{name}', selectedApp.user_name)
                           .replace('{review_points}', comment ? `Review Feedback:\n${comment}` : '')}
                       </div>
                     </div>
                   </div>
                </div>

                <div className="flex gap-3">
                   <button onClick={() => handleApprove(selectedApp)} className="btn-normal flex-1 bg-black text-white hover:bg-slate-800">Accept & Notify</button>
                   <button onClick={() => handleReject(selectedApp)} className="btn-normal flex-1 bg-white border border-slate-100 text-slate-400 hover:bg-slate-50">Reject & Notify</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
