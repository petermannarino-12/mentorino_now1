import { LayoutDashboard, Calendar, BookOpen, Inbox, Settings, Users, Activity, MessageCircle, BarChart3, User, ClipboardList, Sparkles, ShieldCheck, Lock } from 'lucide-react';

export const STUDENT_NAV = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
  { label: 'Vault', path: '/vault', icon: BookOpen },
  { label: 'Networking', path: '/dashboard/networking', icon: Inbox },
];

export const MENTOR_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Audits', path: '/dashboard/audits', icon: Activity },
  { label: 'Access Requests', path: '/dashboard/access-requests', icon: Lock },
  { label: 'Events', path: '/dashboard/events', icon: Calendar },
  { label: 'Mentees', path: '/dashboard/mentees', icon: Users },
  { label: 'Reviews', path: '/dashboard/reviews', icon: MessageCircle },
  { label: 'Accounts', path: '/dashboard/accounts', icon: User },
];

export const ADMIN_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Applications', path: '/dashboard?tab=applications', icon: ClipboardList },
  { label: 'Students', path: '/dashboard?tab=students', icon: Users },
  { label: 'Sessions', path: '/dashboard?tab=sessions', icon: Calendar },
  { label: 'Activities', path: '/dashboard?tab=activities', icon: Activity },
  { label: 'Networking', path: '/dashboard?tab=networking', icon: BarChart3 },
  { label: 'AI Console', path: '/dashboard?tab=ai', icon: Sparkles },
  { label: 'Validation', path: '/dashboard?tab=validation', icon: ShieldCheck },
];
