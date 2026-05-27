import React, { useState } from 'react';
import { User as UserIcon, Bell, Lock, Globe, Shield, CreditCard, CheckCircle2, LogOut, ArrowLeft, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface SettingsPageProps {
  onLogout: () => void;
  currentUser: User | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout, currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [name, setName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (currentUser) {
        // Only allow updating name and phone via profiles table since email update in Auth is restricted without verification
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name, phone })
          .eq('id', currentUser.id);

        if (profileError) throw profileError;

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err: any) {
      setNotification(err.message);
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[32px] sm:rounded-[48px] border border-black/[0.03] shadow-sm">
            <h3 className="text-lg sm:text-xl font-black uppercase mb-6 sm:mb-10">Identity Profile</h3>
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl text-xs font-medium outline-none focus:border-black transition-all" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl text-xs font-medium outline-none focus:border-black transition-all" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Public ID (Email)</label>
                  <input 
                    type="email" 
                    className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl text-xs font-medium outline-none focus:border-black transition-all opacity-50 cursor-not-allowed" 
                    value={email}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-6">
              {showSuccess ? (
                <div className="flex items-center gap-2 text-emerald-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest animate-in zoom-in">
                  <CheckCircle2 size={14} className="sm:size-4" /> Verified & Saved
                </div>
              ) : <div className="hidden sm:block" />}
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-10 sm:px-12 py-4 sm:py-5 bg-black text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-black/10"
              >
                {isSaving ? 'Processing...' : 'Sync Profile'}
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[32px] sm:rounded-[48px] border border-black/[0.03] shadow-sm">
            <div className="flex items-center gap-3 mb-6 sm:mb-10">
              <h3 className="text-lg sm:text-xl font-black uppercase">Security Settings</h3>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-200/50">Coming Soon</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Password, multi-factor authentication, and active session management will be available here.</p>
          </div>
        );
      case 'billing':
        return (
          <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[32px] sm:rounded-[48px] border border-black/[0.03] shadow-sm">
            <div className="flex items-center gap-3 mb-6 sm:mb-10">
              <h3 className="text-lg sm:text-xl font-black uppercase">Billing & Subscription</h3>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-200/50">Coming Soon</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Invoices, payment methods, and subscription plan management will be available here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 animate-in fade-in duration-700">
      <SEO 
        title="Settings" 
        description="Manage your Mentorino account settings, profile, notifications, and security preferences."
      />
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 sm:mb-12 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white border border-black/[0.05] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all group"
      >
        <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-black group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="mb-6 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-slate-900 mb-1 sm:mb-2">Settings.</h1>
        <p className="text-slate-400 font-black uppercase text-[7px] sm:text-[10px] tracking-[0.3em]">Workspace Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-12">
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 sm:gap-3 no-scrollbar pb-2 lg:pb-0 scroll-smooth">
          {[
            { id: 'profile', label: 'Profile', icon: UserIcon },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'billing', label: 'Billing', icon: CreditCard },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-5 rounded-xl sm:rounded-3xl text-[7px] sm:text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${item.id === activeTab ? 'bg-black text-white shadow-lg sm:shadow-xl' : 'text-slate-400 border border-black/[0.03] hover:bg-slate-50 hover:text-black bg-white'}`}>
              <item.icon size={14} className="sm:size-4" /> {item.label}
            </button>
          ))}
          <button onClick={onLogout} className="whitespace-nowrap flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-5 rounded-xl sm:rounded-3xl text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-red-50 bg-white">
            <LogOut size={14} className="sm:size-4" /> Logout
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6 sm:space-y-12">
          {renderContent()}

          <div className="lg:hidden pt-6 sm:pt-8 flex flex-col items-center gap-4">
            <div className="w-full h-px bg-black/[0.03]"></div>
            <button 
              onClick={onLogout}
              className="group flex items-center gap-4 px-8 py-4 rounded-2xl hover:bg-rose-50 transition-all active:scale-95 border border-transparent hover:border-rose-100"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100/50 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                <LogOut size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Secure Logout</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">End your management session</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black text-white p-6 rounded-3xl shadow-2xl z-[200] animate-in slide-in-from-bottom-4 duration-500 border border-white/10">
           <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-500 text-white rounded-xl"><Info size={20} /></div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">System Message</p>
                <p className="text-[11px] font-medium leading-relaxed opacity-70">{notification}</p>
              </div>
              <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X size={16} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;