import React from 'react';
import { motion } from 'motion/react';
import { User, Construction } from 'lucide-react';

export const MentorAccounts: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-10"
    >
      <div className="bg-white rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm p-10 sm:p-16 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Construction className="text-indigo-600" size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-slate-900 mb-3">Accounts</h2>
        <p className="text-sm text-slate-500 font-medium mb-2">Account management interface coming soon.</p>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Manage mentee accounts, permissions, and billing here.
        </p>
      </div>
    </motion.div>
  );
};
