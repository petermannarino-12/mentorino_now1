import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from '../components/ui/EmptyState';
import { 
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Compass,
  Calendar,
  History,
  Info,
  Loader2,
  X,
  MessageSquare,
  LogOut,
  Star,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { useNavigate, Link, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Booking, TaskActivity, NetworkEvent, Announcement, ResourceLink, Feedback, Product } from '../types';
import { supabase } from '../lib/supabase';
import TaskActivityForm from '../components/TaskActivityForm';
import MilestoneList from '../components/milestones/MilestoneList';
import { formatToNJ } from '../lib/dateUtils';
import { useUserDashboardData } from '../hooks/useUserDashboardData';
import { useAddTaskMutation, useUpdateTaskStatusMutation } from '../hooks/useTasks';
import { useAttendEventMutation } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { getPreSessionBrief } from '../services/geminiService';
import { StudentChat } from '../components/chat/StudentChat';
import Purchases from './dashboard/Purchases';
import SEO from '../components/SEO';

interface UserDashboardProps {
  onLogout: () => void;
  announcements?: Announcement[];
  resourceLinks?: ResourceLink[];
  // Props kept for compatibility during refactoring
  currentUser?: any;
  application?: any;
  bookings?: any;
  taskActivities?: any;
  events?: any;
  onTaskSubmit?: any;
  onTaskComplete?: any;
  onEventAttend?: any;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  onLogout,
  announcements = [],
  resourceLinks = [],
  ..._props
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  
  const {
    currentUser,
    application,
    bookings,
    taskActivities,
    events,
    isLoading
  } = useUserDashboardData();

  const queryClient = useQueryClient();
  const addTaskMutation = useAddTaskMutation();
  const updateTaskMutation = useUpdateTaskStatusMutation();
  const attendEventMutation = useAttendEventMutation();

  const handleTaskSubmit = async (activity: Omit<TaskActivity, 'id' | 'user_id' | 'user_name' | 'status' | 'created_at'>) => {
    if (!currentUser || addTaskMutation.isPending) return;
    await addTaskMutation.mutateAsync({
      activity,
      userId: currentUser.id,
      userName: currentUser.full_name || 'User'
    });
  };

  const handleTaskComplete = async (taskId: string) => {
    if (updateTaskMutation.isPending) return;
    await updateTaskMutation.mutateAsync({ id: taskId, status: 'completed' });
  };

  const handleEventAttend = async (eventId: string) => {
    if (!currentUser || attendEventMutation.isPending) return;
    await attendEventMutation.mutateAsync({ eventId, userId: currentUser.id });
  };

  const upcomingSessions = bookings.filter(b => b.status === 'upcoming');
  const pastSessions = bookings.filter(b => b.status === 'completed');
  
  const isStrategyComplete = taskActivities.some(a => a.user_id === currentUser?.id && !!a.roadmap_topic);

  const isApproved = application?.status === 'approved';
  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
    staleTime: 60_000,
    enabled: isApproved,
  });
  const { data: grantedAccess = [] } = useQuery({
    queryKey: ['my-access'],
    queryFn: async () => {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/my-product-access', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.products || [];
    },
    staleTime: 30_000,
    enabled: isApproved,
  });
  const availableResources = allProducts.filter((p: any) => grantedAccess.includes(p.id));

  const getStatusStep = () => {
    if (!application) return 0;
    if (application.status === 'pending') return 1;
    if ((application.status === 'approved') && !isStrategyComplete) return 2;
    if (isStrategyComplete && upcomingSessions.length === 0) return 3;
    if (upcomingSessions.length > 0) return 4;
    return 5;
  };

  const step = getStatusStep();

  const progressPercentage = currentUser?.milestones 
    ? (currentUser.milestones.filter(m => m.completed).length / currentUser.milestones.length) * 100 
    : 0;

  const [notification, setNotification] = useState<string | null>(null);
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [editingNotesSession, setEditingNotesSession] = useState<Booking | null>(null);
  const [notesText, setNotesText] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState<NetworkEvent | null>(null);
  const [reportingEvent, setReportingEvent] = useState<NetworkEvent | null>(null);
  const [joinForm, setJoinForm] = useState({
    name: currentUser?.full_name || '',
    email: currentUser?.email || '',
    reason: ''
  });

  const handleJoinEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joiningEvent || attendEventMutation.isPending) return;

    try {
      await handleEventAttend(joiningEvent.id);
      setNotification(`Strategic request sent for ${joiningEvent.title}. Mentorino will be notified of your intent.`);
      setJoiningEvent(null);
      setJoinForm(prev => ({ ...prev, reason: '' }));
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error('Failed to join event:', error);
    }
  };

  const handleJoinSession = (booking: Booking) => {
    const link = booking.meeting_link || 'https://meet.google.com/new';
    setNotification(`Joining session with Mentorino...\nDate: ${booking.date}\nTime: ${booking.time}`);
    setTimeout(() => {
      window.open(link, '_blank');
      setNotification(null);
    }, 2000);
  };

  const handleDownload = (product: Product) => {
    if (product.file_url) {
      window.open(product.file_url, '_blank');
      setNotification(`Downloading: ${product.full_name}`);
    } else {
      setNotification(`Download URL not available for ${product.full_name}.`);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const notifiedNoUpcomingRef = useRef(false);
  useEffect(() => {
    if (upcomingSessions.length === 0 && pastSessions.length > 0 && !notifiedNoUpcomingRef.current) {
      notifiedNoUpcomingRef.current = true;
      setNotification('You have no upcoming sessions left. Book more to continue your progress!');
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [upcomingSessions.length, pastSessions.length]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-black rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 text-white relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
        <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 pointer-events-none">
          <TrendingUp size={120} className="sm:w-[180px] sm:h-[180px]" />
        </div>
        
        <div className="relative z-10 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 rounded-full border border-white/10">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[7px] sm:text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Growth Velocity</span>
          </div>

          {step >= 3 ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none">Your <br /> Trajectory.</h3>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-1 h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                  <span className="text-lg sm:text-xl font-black">{Math.round(progressPercentage)}%</span>
                </div>
              </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                <div className="p-4 sm:p-4 bg-white/5 rounded-2xl sm:rounded-2xl border border-white/5">
                  <p className="text-[9px] sm:text-[8px] font-black text-white/40 uppercase tracking-widest mb-1 sm:mb-1">Tasks Pending</p>
                  <p className="text-2xl sm:text-xl font-black">{currentUser?.tasks?.filter(t => t.status === 'pending').length || 0}</p>
                </div>
                <div className="p-4 sm:p-4 bg-white/5 rounded-2xl sm:rounded-2xl border border-white/5">
                  <p className="text-[9px] sm:text-[8px] font-black text-white/40 uppercase tracking-widest mb-1 sm:mb-1">Milestones</p>
                  <p className="text-2xl sm:text-xl font-black">{currentUser?.milestones?.filter(m => m.completed).length || 0}/{currentUser?.milestones?.length || 0}</p>
                </div>
              </div>
            </div>
          ) : step === 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none">Start Your <br /> Journey.</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium max-w-[200px] sm:max-w-[240px]">You haven't applied for mentorship yet. Let's fix your trajectory.</p>
              <button onClick={() => navigate('/apply')} className="btn-compact bg-white text-black w-full flex items-center justify-center gap-2">
                Apply Now <ArrowRight size={14} />
              </button>
            </div>
          ) : step === 1 ? (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none">Under <br /> Review.</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium max-w-[200px] sm:max-w-[240px]">Mentorino is auditing your application. We'll notify you shortly.</p>
              <div className="w-full py-4 bg-white/5 border border-white/10 text-white/50 text-[10px] sm:text-[10px] font-black uppercase tracking-[0.3em] rounded-full flex items-center justify-center gap-3 italic">
                Awaiting Feedback
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none text-white">Congratulations! <br /> Your application has been accepted.</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium max-w-[300px] sm:max-w-[400px]">
                Now you need to fill out the 2nd stage application regarding your resume, LinkedIn profile, and digital presence to begin your strategic transformation.
              </p>
              <button 
                onClick={() => navigate('/dashboard/roadmap')} 
                className="btn-compact bg-amber-400 text-black w-full flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
              >
                START STRATEGIC AUDIT <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Announcements Feed */}
      {isApproved && announcements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategy Broadcasts</h3>
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">Live Feed</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {announcements.map(ann => (
              <div key={ann.id} className="min-w-[280px] sm:min-w-[320px] bg-white p-6 rounded-[32px] border border-black/[0.03] shadow-sm space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${
                    ann.priority === 'high' ? 'bg-red-50 text-red-500' : 
                    ann.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {ann.priority} Priority
                  </div>
                  <span className="text-[8px] font-bold text-slate-300 uppercase">{formatToNJ(ann.created_at, { month: 'short', day: 'numeric' })}</span>
                </div>
                <h4 className="text-xs font-black uppercase tracking-tight leading-tight">{ann.title}</h4>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isApproved && events.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Networking Events</h3>
            <button onClick={() => navigate('/dashboard/networking')} className="text-[8px] font-black uppercase tracking-widest text-black border-b border-black">View All</button>
          </div>
          <div className="bg-white p-6 rounded-[40px] border border-black/[0.03] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase">{events[0].title}</h4>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{formatToNJ(events[0].date, { month: 'short', day: 'numeric', year: 'numeric' })} @ {events[0].location}</p>
              </div>
            </div>
            <button 
              onClick={() => handleEventAttend(events[0].id)}
              disabled={attendEventMutation.isPending}
              className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                events[0].attendees.includes(currentUser?.id || '') 
                  ? 'bg-emerald-50 text-emerald-500' 
                  : 'bg-black text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {attendEventMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : events[0].attendees.includes(currentUser?.id || '') ? 'Interested' : 'Attend'}
            </button>
          </div>
        </div>
      )}

      {/* Application Status Section */}
      {application && (
        <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-black/[0.03] shadow-sm space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
          <div className="flex items-center justify-between">
            <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Program Status</h3>
            <div className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${
              (application.status === 'approved') ? 'bg-emerald-50 text-emerald-500' : 
              application.status === 'rejected' ? 'bg-red-50 text-red-500' : 
              'bg-amber-50 text-amber-500'
            }`}>
              {application.status}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1">
              <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Program Type</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl"><Briefcase size={14} className="sm:w-4 sm:h-4 text-black" /></div>
                <p className="text-[10px] sm:text-sm font-black uppercase">{application.mentor_type}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Lead Mentor</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl"><UserIcon size={14} className="sm:w-4 sm:h-4 text-black" /></div>
                <p className="text-[10px] sm:text-sm font-black uppercase">Mentorino</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step >= 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Tasks</h4>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{currentUser?.tasks?.filter(t => t.status === 'pending').length} Remaining</span>
          </div>
          <div className="space-y-3">
            {currentUser?.tasks?.map(task => (
              <div key={task.id} className="bg-white p-5 rounded-[28px] border border-black/[0.03] flex items-center justify-between group hover:border-black/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                    {task.status === 'completed' ? (
                      <>
                        <CheckCircle2 size={18} />
                        <span className="sr-only">Completed</span>
                      </>
                    ) : (
                      <>
                        <Clock3 size={18} />
                        <span className="sr-only">Pending</span>
                      </>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase">{task.title}</h5>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Due {formatToNJ(task.due_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                {task.status === 'pending' && (
                  <button 
                    onClick={() => handleTaskComplete(task.id)}
                    disabled={updateTaskMutation.isPending}
                    className="text-[8px] font-black uppercase tracking-widest text-black border-b border-black pb-0.5 hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {updateTaskMutation.isPending && <Loader2 size={10} className="animate-spin" />}
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {step >= 3 && currentUser && (
        <MilestoneList milestones={currentUser.milestones || []} userId={currentUser.id} />
      )}

      {/* Pinned Resources */}
      {isApproved && resourceLinks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pinned Resources</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resourceLinks.filter(rl => rl.is_pinned).map(link => (
              <a 
                key={link.id} 
                href={link.url}
                className="bg-white p-6 rounded-[32px] border border-black/[0.03] flex items-center justify-between group hover:border-black/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                    <Download size={18} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-tight leading-none">{link.title}</h4>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{link.category}</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-200 group-hover:text-black transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[450px]">
          {[
            { label: 'Applied', icon: History, active: step >= 1 },
            { label: 'Approved', icon: CheckCircle2, active: step >= 2 },
            { label: 'Booked', icon: Calendar, active: step >= 3 },
            { label: 'Growth', icon: TrendingUp, active: step >= 4 }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 ${s.active ? 'bg-black text-white shadow-xl scale-110' : 'bg-slate-50 text-slate-300'}`}>
                <s.icon size={16} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${s.active ? 'text-black' : 'text-slate-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => navigate('/dashboard/sessions')} className="bg-white p-6 rounded-[32px] border border-black/[0.03] space-y-3 cursor-pointer hover:border-black/10 hover:scale-[1.02] active:scale-95 transition-all group">
          <div className="p-2.5 bg-slate-50 rounded-xl w-fit group-hover:bg-black group-hover:text-white transition-colors"><Calendar size={16} /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Calls</p>
          <p className="text-xl font-black">{upcomingSessions.length}</p>
        </div>
        <div onClick={() => navigate('/survey')} className="bg-white p-6 rounded-[32px] border border-black/[0.03] space-y-3 cursor-pointer hover:border-black/10 hover:scale-[1.02] active:scale-95 transition-all group">
          <div className="p-2.5 bg-slate-50 rounded-xl w-fit group-hover:bg-black group-hover:text-white transition-colors"><MessageSquare size={16} /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Feedback</p>
          <p className="text-[8px] font-black uppercase text-slate-300">Share Insights</p>
        </div>
      </div>
    </div>
  );

  const [sessionFilter, setSessionFilter] = useState<'all' | 'week' | 'month'>('all');

  const filteredPastSessions = pastSessions.filter(s => {
    if (sessionFilter === 'all') return true;
    const d = new Date(s.date);
    const now = new Date();
    if (sessionFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo && d <= now;
    }
    if (sessionFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return d >= monthAgo && d <= now;
    }
    return true;
  });

  const renderSessions = () => (
    <div className="space-y-6">
      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-[20px] p-4 border border-black/[0.03] text-center">
          <p className="text-xl font-black">{upcomingSessions.length}</p>
          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Upcoming</p>
        </div>
        <div className="bg-white rounded-[20px] p-4 border border-black/[0.03] text-center">
          <p className="text-xl font-black">{pastSessions.length}</p>
          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-[20px] p-4 border border-black/[0.03] text-center">
          <p className="text-xl font-black">{upcomingSessions.length + pastSessions.length}</p>
          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Total</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Your Schedule</h3>
        <button onClick={() => navigate('/booking')} className="text-[9px] font-black uppercase tracking-widest text-black border-b border-black pb-0.5 hover:opacity-70 transition-opacity">Book Session</button>
      </div>

      {upcomingSessions.length > 0 ? (
        <div className="space-y-4">
          {upcomingSessions.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-[32px] border border-black/[0.03] flex items-center justify-between shadow-sm hover:border-black/10 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-black">
                  <Clock3 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase truncate max-w-[140px]">{formatToNJ(s.date, { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.time} • Strategy</p>
                </div>
              </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => { setNotesText(s.notes || ''); setEditingNotesSession(s); }} className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors">Notes</button>
                  <button onClick={() => handleJoinSession(s)} className="px-6 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all">Join Now</button>
                </div>
            </div>
          ))}

          {/* Pre-Session Prep Card */}
          <div className="bg-black text-white p-8 sm:p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Star size={80} /></div>
            <div className="relative z-10 space-y-6">
              <div className="space-y-1">
                <h4 className="text-xl font-black uppercase tracking-tighter">Pre-Session Prep</h4>
                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Maximize your time with Mentorino</p>
              </div>

              {aiBrief ? (
                <div className="bg-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">AI-Generated Brief</span>
                    <button onClick={() => setAiBrief(null)} className="text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Clear</button>
                  </div>
                  <p className="text-xs font-medium text-white/80 leading-relaxed whitespace-pre-wrap">{aiBrief}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    'Review last session notes',
                    'Document 3 specific roadblocks',
                    'Identify one strategic "win" from the week'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-lg border border-white/20 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                        <CheckCircle2 size={12} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[11px] font-medium text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={async () => {
                  if (!upcomingSessions.length) { setNotification('No upcoming sessions to generate a brief for.'); setTimeout(() => setNotification(null), 3000); return; }
                  setBriefLoading(true);
                  const brief = await getPreSessionBrief(
                    upcomingSessions[0],
                    currentUser?.full_name || 'Student'
                  );
                  setAiBrief(brief);
                  setBriefLoading(false);
                }}
                disabled={briefLoading}
                className="w-full py-4 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {briefLoading ? (
                  <><Loader2 size={14} className="animate-spin" /> Generating...</>
                ) : aiBrief ? (
                  'Regenerate Brief'
                ) : (
                  <><Sparkles size={14} /> Generate AI Brief</>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50/50 rounded-[32px] p-12 text-center border border-dashed border-slate-200">
          <Calendar className="mx-auto text-slate-300 mb-4" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No upcoming calls</p>
          <button onClick={() => navigate('/booking')} className="mt-4 px-8 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all">Schedule Now</button>
        </div>
      )}

    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 pt-6">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">History</h4>
        <div className="flex items-center gap-1">
          {(['all', 'week', 'month'] as const).map(f => (
            <button key={f} onClick={() => setSessionFilter(f)}
              className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full transition-all ${
                sessionFilter === f ? 'bg-black text-white' : 'text-slate-400 hover:text-black'
              }`}
            >
              {f === 'all' ? 'All' : f === 'week' ? '7d' : '30d'}
            </button>
          ))}
        </div>
      </div>
      {filteredPastSessions.length > 0 ? filteredPastSessions.map(s => (
        <div key={s.id} className="bg-white/60 p-5 rounded-[24px] border border-black/[0.01] flex items-center justify-between opacity-50 hover:opacity-100 hover:bg-white hover:border-black/10 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-600">{formatToNJ(s.date, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{s.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setNotesText(s.notes || ''); setEditingNotesSession(s); }} className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors">Notes</button>
            <button onClick={() => navigate('/booking')} className="px-4 py-2 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all">Rebook</button>
          </div>
        </div>
      )) : (
        <div className="bg-slate-50/50 rounded-[24px] p-8 text-center border border-dashed border-slate-200">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No completed sessions yet</p>
        </div>
      )}
    </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">The Vault</h3>
      </div>

      {isApproved ? (
        <div className="grid grid-cols-1 gap-4">
          {availableResources.length > 0 ? availableResources.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-[32px] border border-black/[0.03] shadow-sm flex items-center justify-between group hover:border-black/10 transition-all">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                  <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={p.full_name} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-black uppercase truncate mb-1">{p.full_name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{p.category}</p>
                </div>
              </div>
              <button onClick={() => handleDownload(p)} className="p-3 bg-slate-50 rounded-full hover:bg-black hover:text-white hover:scale-110 active:scale-90 transition-all" aria-label={`Download ${p.full_name}`}>
                <Download size={14} />
              </button>
            </div>
          )) : (
            <div className="bg-slate-50/50 rounded-[32px] p-12 text-center border border-dashed border-slate-200">
              <Download className="mx-auto text-slate-300 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No resources available in the vault</p>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Request access to products in the Store. Once granted, they will appear here.</p>
              <button onClick={() => navigate('/store')} className="mt-6 px-8 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">Go to Store</button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50/50 rounded-[32px] p-12 text-center border border-dashed border-slate-200">
          <ShieldCheck className="mx-auto text-slate-300 mb-4" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">The Vault is Locked</p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Access to premium career and performance resources is granted automatically upon application approval.</p>
          {!application && (
            <button onClick={() => navigate('/apply')} className="mt-6 px-8 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">Apply for Access</button>
          )}
        </div>
      )}
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-10 pb-20">
      <div className="bg-slate-900 p-10 rounded-[48px] text-white space-y-6 shadow-2xl shadow-black/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none text-white">
          <Compass size={160} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/50">Growth Strategy & Identity</div>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Roadmap.</h2>
          <p className="text-[11px] font-bold leading-relaxed max-w-[320px] text-white/40 uppercase">
             Submit your professional activities and branding assets for Mentorino's executive review to align your trajectory.
          </p>
        </div>
      </div>

      {taskActivities.length > 0 ? (
         <div className="space-y-4">
           <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2">Recent Audit Submissions</h4>
           {taskActivities.map(activity => (
             <div key={activity.id} className="bg-white p-6 rounded-[32px] border border-black/[0.03] shadow-sm space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'reviewed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}>
                      <span className="sr-only">{activity.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{activity.status}</span>
                 </div>
                 <span className="text-[8px] font-bold text-slate-400 uppercase">{formatToNJ(activity.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
               </div>
               {activity.admin_response && (
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mentor Feedback</p>
                    <p className="text-[10px] font-medium italic">"{activity.admin_response}"</p>
                 </div>
               )}
             </div>
           ))}
         </div>
      ) : (
        <EmptyState 
          title="Execution Log Clear" 
          description="Start tracking your strategic activities to receive expert feedback loop cycles." 
          icon={History}
        />
      )}

      {isApproved ? (
        <div className="bg-white p-8 md:p-12 rounded-[48px] border border-black/[0.03] shadow-sm">
          <TaskActivityForm onSubmit={handleTaskSubmit} />
        </div>
      ) : (
        <div className="bg-slate-50 p-12 rounded-[48px] text-center border border-dashed border-slate-200">
          <ShieldCheck size={32} className="mx-auto text-slate-300 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locked Feature</p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">The strategic roadmap is available for mentees whose applications have been verified and approved.</p>
        </div>
      )}
    </div>
  );

  const renderNetworking = () => (
    <div className="space-y-10 pb-20">
      <div className="bg-indigo-600 p-10 rounded-[48px] text-white space-y-6 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Star size={160} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/50">Stage 04: Market Connection</div>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Connections.</h2>
          <p className="text-[11px] font-bold leading-relaxed max-w-[280px] text-white/40 uppercase">
             Attend Mentorino's listed events. Submit reports on who you met and panel takeaways to gain performance points.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => {
          const isAttending = event.attendees.includes(currentUser?.id || '');
          return (
            <div key={event.id} className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-sm flex flex-col justify-between group hover:border-black/10 transition-all duration-500">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <Calendar size={20} />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    isAttending ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <span className="sr-only">Registration Status: </span>
                    {isAttending ? 'Access Granted' : 'Open Registration'}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-black uppercase tracking-tight leading-tight">{event.title}</h4>
                  <div className="flex flex-wrap gap-4">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Clock3 size={12} className="text-indigo-500" /> {formatToNJ(event.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <LayoutGrid size={12} className="text-indigo-500" /> {event.time}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Compass size={12} className="text-indigo-500" /> {event.location}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-2 line-clamp-3">{event.description}</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {event.attendees.slice(0, 3).map((attendee, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">
                      {attendee.slice(0, 2)}
                    </div>
                  ))}
                  {event.attendees.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-300">
                      +{event.attendees.length - 3}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => isAttending ? setReportingEvent(event) : setJoiningEvent(event)}
                  className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    isAttending 
                      ? 'bg-amber-400 text-black hover:scale-105 shadow-xl shadow-amber-500/20 active:scale-95' 
                      : 'bg-black text-white hover:scale-105 shadow-xl shadow-black/10 active:scale-95'
                  }`}
                >
                  {isAttending ? 'Submit Feedback' : 'Join Event'}
                </button>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <EmptyState 
            title="No Active Events" 
            description="Check back later for curated networking sessions and elite coaching calls." 
            icon={Calendar} 
            className="md:col-span-2"
          />
        )}
      </div>

      {/* Join Event Form Modal */}
      <AnimatePresence>
        {joiningEvent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJoiningEvent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="bg-black text-white p-8 sm:p-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60">Attendance Registration</div>
                  <button onClick={() => setJoiningEvent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Close registration">
                    <X size={20} />
                  </button>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{joiningEvent.title}</h3>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{formatToNJ(joiningEvent.date, { month: 'short', day: 'numeric' })} • {joiningEvent.location}</p>
              </div>

              <form onSubmit={handleJoinEventSubmit} className="p-8 sm:p-10 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Your Identity</label>
                      <input 
                        type="text" 
                        value={joinForm.name}
                        disabled
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase text-slate-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact Path</label>
                      <input 
                        type="email" 
                        value={joinForm.email}
                        disabled
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Strategy Objective (Optional)</label>
                    <textarea 
                      placeholder="WHAT DO YOU HOPE TO GAIN FROM THIS CONNECTION?"
                      value={joinForm.reason}
                      onChange={(e) => setJoinForm(prev => ({ ...prev, reason: e.target.value.toUpperCase() }))}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-xs font-medium focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all h-32 resize-none"
                    ></textarea>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={attendEventMutation.isPending}
                  className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {attendEventMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Strategic Intent'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Network Reporting Modal */}
      <AnimatePresence>
        {reportingEvent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportingEvent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8 sm:p-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Event Feedback</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reporting for: {reportingEvent.title}</p>
                  </div>
                  <button onClick={() => setReportingEvent(null)} className="p-3 hover:bg-slate-50 rounded-full transition-colors" aria-label="Close reporting form">
                    <X size={24} />
                  </button>
                </div>
                <TaskActivityForm 
                  onSubmit={async (data) => {
                    await handleTaskSubmit(data);
                    setReportingEvent(null);
                  }} 
                  isNetworkingOnly={true} 
                  defaultEventName={reportingEvent.title}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Session Notes Modal */}
      <AnimatePresence>
        {editingNotesSession && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingNotesSession(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="bg-black text-white p-8 sm:p-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60">Session Notes</div>
                  <button onClick={() => setEditingNotesSession(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Close notes">
                    <X size={20} />
                  </button>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">
                  {formatToNJ(editingNotesSession.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{editingNotesSession.time}</p>
              </div>

              <div className="p-8 sm:p-10 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Your Notes</label>
                  <textarea
                    value={notesText}
                    onChange={e => setNotesText(e.target.value)}
                    placeholder="Document key insights, action items, and follow-ups from this session..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-xs font-medium focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all h-40 resize-none"
                  />
                </div>
                <button
                  onClick={async () => {
                    setNotesSaving(true);
                    const { data: { session } } = await supabase.auth.getSession();
                    const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
                    await fetch('/api/bookings', {
                      method: 'PATCH',
                      headers,
                      body: JSON.stringify({ id: editingNotesSession.id, notes: notesText }),
                    });
                    setNotesSaving(false);
                    setEditingNotesSession(null);
                    setNotification('Session notes saved.');
                    setTimeout(() => setNotification(null), 3000);
                  }}
                  disabled={notesSaving}
                  className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {notesSaving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    'Save Notes'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4 bg-white p-6 rounded-[32px] border border-black/[0.03] shadow-sm">
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white text-xl font-black">
          {(currentUser?.full_name || '?').charAt(0)}
        </div>
        <div>
          <h4 className="text-lg font-black uppercase tracking-tight">{currentUser?.full_name}</h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{currentUser?.email}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-black/[0.03] space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">My Application</h4>
          <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {application?.status || 'No Application'}
          </span>
        </div>
        {application ? (
          <div className="bg-slate-50 p-5 rounded-2xl space-y-4">
             <div className="space-y-1">
               <p className="text-[8px] font-black text-slate-400 uppercase">Focus Pillar</p>
               <p className="text-[10px] font-black uppercase tracking-tight">{application.pillar}</p>
             </div>
             <div className="space-y-1">
               <p className="text-[8px] font-black text-slate-400 uppercase">Intent Summary</p>
               <p className="text-[10px] font-medium text-slate-600 italic leading-relaxed">"{application.goals}"</p>
             </div>
          </div>
        ) : (
          <button onClick={() => navigate('/apply')} className="w-full py-4 bg-slate-50 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:text-white hover:scale-[1.02] active:scale-95 transition-all">Submit Application</button>
        )}
      </div>


      <div className="grid grid-cols-2 gap-4">
        <Link to="/settings" className="bg-white p-5 rounded-[24px] border border-black/[0.03] flex items-center gap-3 hover:border-black/10 hover:scale-[1.02] active:scale-95 transition-all">
          <UserIcon size={14} className="text-slate-400" />
          <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
        </Link>
        <button onClick={() => navigate('/contact')} className="bg-white p-5 rounded-[24px] border border-black/[0.03] flex items-center gap-3 hover:border-black/10 hover:scale-[1.02] active:scale-95 transition-all">
          <HelpCircle size={14} className="text-slate-400" />
          <span className="text-[9px] font-black uppercase tracking-widest">Support</span>
        </button>
      </div>

      {/* Past Feedback Section */}
      {currentUser && <ProfileReviews userId={currentUser.id} />}

      <button onClick={signOut} className="btn-normal w-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 hover:scale-[1.02]">
        <LogOut size={16} /> Logout Account
      </button>
    </div>
  );

  const ProfileReviews: React.FC<{ userId: string }> = ({ userId }) => {
    const { data: reviews = [] } = useQuery({
      queryKey: ['reviews', userId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        if (error) return [];
        return data as Feedback[];
      },
    });

    if (!reviews.length) return null;

    return (
      <div className="bg-white p-6 rounded-[32px] border border-black/[0.03] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Past Feedback</h4>
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{reviews.length} entries</span>
        </div>
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-white rounded-full text-[7px] font-black uppercase tracking-widest text-slate-500">
                  {r.type}
                </span>
                <span className="text-[8px] font-bold text-slate-300 uppercase">{r.date}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(star => (
                  <span key={star} className={`text-xs ${star <= r.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                ))}
              </div>
              {r.comments && (
                <p className="text-[10px] font-medium text-slate-600 leading-relaxed">{r.comments}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-1000 px-4 md:px-0 bg-transparent pt-8 md:pt-24 pb-12">
      <SEO 
        title="My Growth Hub | Mentorino" 
        description="Your personal dashboard to track milestones, book sessions, and access strategic career resources."
      />
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
           <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Portal Home</span>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-black leading-none">
            Hi, <span className="text-slate-300">{currentUser?.full_name?.split(' ')[0]}</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Welcome back to your growth journey.</p>
        </div>
      </header>

      <main className="min-h-[50vh] pb-12 md:pb-0 pt-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={renderOverview()} />
              <Route path="/sessions" element={renderSessions()} />
              <Route path="/roadmap" element={renderTasks()} />
              <Route path="/networking" element={renderNetworking()} />
              <Route path="/vault" element={renderResources()} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/chat" element={<StudentChat currentUserId={currentUser?.id || ''} />} />
              <Route path="/profile" element={renderProfile()} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="pt-10 pb-24 md:pb-12 flex flex-col items-center gap-4 text-center">
         <p className="text-[8px] font-black uppercase tracking-[1em] text-slate-200">Clarity • Performance</p>
         <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <Link to="/help" className="hover:text-black transition-colors">Support</Link>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <Link to="/auth" className="hover:text-black transition-colors">Legal</Link>
         </div>
      </footer>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-48px)] max-w-md animate-in slide-in-from-top-8 duration-500">
          <div className="bg-black text-white p-6 rounded-[32px] shadow-2xl border border-white/10 flex items-start gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <Info size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed whitespace-pre-wrap">
                {notification}
              </p>
            </div>
            <button onClick={() => setNotification(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Close notification">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;