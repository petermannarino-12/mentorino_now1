import { LayoutDashboard, Calendar, BookOpen, Inbox, Settings, Users, Activity, MessageCircle, BarChart3, User, ClipboardList, Sparkles, ShieldCheck, Lock } from 'lucide-react';

export const STUDENT_NAV = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
  { label: 'Vault', path: '/vault', icon: BookOpen },
  { label: 'Guidance', path: '/dashboard/guidance', icon: Inbox },
  { label: 'Account', path: '/dashboard/account', icon: Settings },
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
  { label: 'Applications', path: '/dashboard', icon: ClipboardList },
  { label: 'Students', path: '/dashboard', icon: Users },
  { label: 'Sessions', path: '/dashboard', icon: Calendar },
  { label: 'Activities', path: '/dashboard', icon: Activity },
  { label: 'Networking', path: '/dashboard', icon: BarChart3 },
  { label: 'AI Console', path: '/dashboard', icon: Sparkles },
  { label: 'Validation', path: '/dashboard', icon: ShieldCheck },
];
