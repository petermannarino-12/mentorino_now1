import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center p-12 text-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50/50 ${className}`}
    >
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-black/5 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm font-medium text-slate-500 max-w-[280px] mx-auto mb-8">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="group flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>{actionLabel}</span>
        </button>
      )}
    </motion.div>
  );
};
