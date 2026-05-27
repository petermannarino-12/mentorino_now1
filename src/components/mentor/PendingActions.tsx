import React from 'react';
import { TaskActivity, Application } from '../../types';
import { CheckCircle2, Users, X } from 'lucide-react';

interface PendingActionsProps {
  pendingTasks: TaskActivity[];
  pendingApplications: Application[];
  onReviewTask: (task: TaskActivity) => void;
  onApplicationAction: (id: string, status: 'approved' | 'rejected') => void;
  onViewTasks: () => void;
  onViewApplications: () => void;
}

export const PendingActions: React.FC<PendingActionsProps> = ({ 
  pendingTasks, 
  pendingApplications, 
  onReviewTask, 
  onApplicationAction,
  onViewTasks,
  onViewApplications
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
      {/* Pending Strategic Audits */}
      <div className="bg-white rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
        <div className="p-5 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 leading-none">Task Reviews Pending</h3>
          <button onClick={onViewTasks} className="text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="divide-y divide-slate-50 flex-1">
          {pendingTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm shrink-0">
                  {task.user_name ? task.user_name.charAt(0) : '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate tracking-tight">{task.user_name}</p>
                  <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5 truncate">
                    {task.roadmap_topic || task.cert_topic || 'Identity Audit'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onReviewTask(task)}
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-black text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-600 transition-colors shrink-0 ml-2"
              >
                Review
              </button>
            </div>
          ))}
          {pendingTasks.length === 0 && (
            <div className="p-10 sm:p-12 text-center text-slate-400">
              <CheckCircle2 size={24} className="mx-auto mb-2 opacity-20 text-indigo-600 sm:size-8" />
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">All caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* New Applicants Review */}
      <div className="bg-white rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
        <div className="p-5 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 leading-none">Pending Inquiries</h3>
          <button onClick={onViewApplications} className="text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="divide-y divide-slate-50 flex-1">
          {pendingApplications.slice(0, 3).map((app) => (
            <div key={app.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xs shrink-0">
                  {app.user_name ? app.user_name.charAt(0) : '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 leading-none truncate tracking-tight">{app.user_name}</p>
                  <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{app.mentor_type}</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2 shrink-0 ml-2">
                <button onClick={() => onApplicationAction(app.id, 'rejected')} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"><X size={14} className="sm:size-4" /></button>
                <button onClick={() => onApplicationAction(app.id, 'approved')} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"><CheckCircle2 size={14} className="sm:size-4" /></button>
              </div>
            </div>
          ))}
          {pendingApplications.length === 0 && (
            <div className="p-10 sm:p-12 text-center text-slate-400">
              <Users size={24} className="mx-auto mb-2 opacity-20 text-indigo-600 sm:size-8" />
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">No new applicants</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
