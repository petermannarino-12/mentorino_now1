import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, MessageSquare, ExternalLink, ArrowLeft, ClipboardList, Star } from 'lucide-react';
import { TaskActivity, Review } from '../../types';
import { formatToNJ } from '../../lib/dateUtils';
import { EmptyState } from '../../components/ui/EmptyState';

const DRAFT_PREFIX = 'review-draft-';

interface MentorReviewsProps {
  pendingTasks: TaskActivity[];
  reviews: Review[];
  onSubmitFeedback: (task: TaskActivity, feedback: string) => void;
}

export const MentorReviews: React.FC<MentorReviewsProps> = ({ pendingTasks, reviews, onSubmitFeedback }) => {
  const [activeTab, setActiveTab] = useState<'audits' | 'feedback'>('audits');
  const [selectedTask, setSelectedTask] = useState<TaskActivity | null>(null);
  const [feedbackResponse, setFeedbackResponse] = useState('');

  const saveDraft = useCallback(() => {
    if (selectedTask && feedbackResponse) {
      try {
        localStorage.setItem(DRAFT_PREFIX + selectedTask.id, feedbackResponse);
      } catch { /* Storage full — silently ignore */ }
    }
  }, [selectedTask, feedbackResponse]);

  useEffect(() => {
    if (selectedTask) {
      const saved = localStorage.getItem(DRAFT_PREFIX + selectedTask.id);
      setFeedbackResponse(saved || '');
    }
  }, [selectedTask]);

  useEffect(() => {
    const timer = setInterval(saveDraft, 3000);
    return () => clearInterval(timer);
  }, [saveDraft]);

  const handleReview = (task: TaskActivity) => {
    saveDraft();
    setSelectedTask(task);
  };

  const tabs = (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit mb-8">
      <button
        onClick={() => { setActiveTab('audits'); setSelectedTask(null); }}
        className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
          activeTab === 'audits' ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-black'
        }`}
      >
        Task Audits
      </button>
      <button
        onClick={() => { setActiveTab('feedback'); setSelectedTask(null); }}
        className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
          activeTab === 'feedback' ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-black'
        }`}
      >
        Feedback
      </button>
    </div>
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={14}
            className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
          />
        ))}
      </div>
    );
  };

  if (activeTab === 'feedback') {
    return (
      <div className="space-y-6">
        {tabs}
        {reviews.length === 0 ? (
          <EmptyState
            title="No Feedback Yet"
            description="Survey responses from mentees will appear here once they submit session evaluations."
            icon={MessageSquare}
            className="mt-8"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] border border-black/[0.03] shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm sm:text-base font-black uppercase tracking-tight">{review.reviewer_name}</h4>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{review.reviewer_email}</p>
                  </div>
                  <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest whitespace-nowrap">
                    {formatToNJ(review.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {renderStars(review.rating)}
                  <span className="text-[9px] font-black text-slate-400">{review.rating}/5</span>
                </div>
                {review.comment && (
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (pendingTasks.length === 0 && !selectedTask) {
    return (
      <div>
        {tabs}
        <EmptyState 
          title="Zero Pending Reviews" 
          description="Every strategic execution log has been audited. Your mentees are in motion." 
          icon={ClipboardList} 
          className="mt-8"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tabs}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className={`lg:col-span-1 space-y-4 ${selectedTask ? 'hidden lg:block' : 'block'}`}>
          <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2 lg:mb-4">Pending Strategic Audits</h3>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => handleReview(task)}
                className={`p-5 sm:p-6 rounded-[24px] sm:rounded-3xl border transition-all cursor-pointer active:scale-95 ${selectedTask?.id === task.id ? 'bg-black text-white border-black shadow-xl translate-x-2' : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300'}`}
              >
                <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest opacity-60 mb-2">
                  {formatToNJ(task.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <h4 className="font-black uppercase tracking-tight text-sm sm:text-base mb-1 truncate">{task.user_name}</h4>
                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate ${selectedTask?.id === task.id ? 'text-white/60' : 'text-slate-400'}`}>
                  {task.roadmap_topic || 'Identity Audit'}
                </p>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="p-12 bg-slate-50 rounded-[28px] sm:rounded-3xl text-center border-2 border-dashed border-slate-200">
                 <CheckCircle size={24} className="mx-auto mb-4 text-slate-300 sm:size-8" />
                 <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">All Audits Completed</p>
              </div>
            )}
          </div>
        </div>

        {/* Review Area */}
        <div className={`lg:col-span-2 ${selectedTask ? 'block' : 'hidden lg:block'}`}>
          {selectedTask ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[28px] sm:rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col"
            >
              <div className="p-5 sm:p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-[#FDFDFD]">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button onClick={() => setSelectedTask(null)} className="lg:hidden p-2 -ml-1 hover:bg-slate-50 rounded-full active:scale-90 transition-all">
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tighter">Strategic Audit</h3>
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Auditing {selectedTask.user_name}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-10 overflow-y-auto">
                {/* Submission Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  {selectedTask.pb_card_details && (
                    <div className="space-y-1.5 sm:space-y-2">
                      <p className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">LinkedIn / Prof. URL</p>
                      <div className="flex items-center gap-2 p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                        <p className="text-[9px] sm:text-[10px] font-medium truncate flex-1">{selectedTask.pb_linkedin_url || 'Not provided'}</p>
                        {selectedTask.pb_linkedin_url && <ExternalLink size={12} className="text-slate-400" />}
                      </div>
                    </div>
                  )}
                  {selectedTask.roadmap_topic && (
                    <div className="space-y-1.5 sm:space-y-2">
                      <p className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Strategy Focus</p>
                      <div className="p-3 sm:p-4 bg-emerald-50 text-emerald-700 rounded-xl sm:rounded-2xl border border-emerald-100">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight">{selectedTask.roadmap_topic}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Submission Summary</p>
                    <p className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-700 leading-relaxed bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl italic">
                      "{selectedTask.net_panel_summary || selectedTask.cert_topic || selectedTask.pb_card_details || 'Internal Audit Submission'}"
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Mentor Executive Response</p>
                    <textarea 
                      value={feedbackResponse}
                      onChange={(e) => setFeedbackResponse(e.target.value)}
                      placeholder="Provide your high-level feedback..."
                      className="w-full h-28 sm:h-32 md:h-40 p-4 sm:p-5 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all text-xs sm:text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 md:gap-4 pt-4">
                  <button 
                    onClick={() => {
                      saveDraft();
                      setSelectedTask(null);
                    }}
                    className="w-full sm:w-auto px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                  >
                    Save Draft
                  </button>
                  <button 
                    onClick={() => {
                      onSubmitFeedback(selectedTask, feedbackResponse);
                      try { localStorage.removeItem(DRAFT_PREFIX + selectedTask.id); } catch { /* ignore */ }
                      setSelectedTask(null);
                    }}
                    className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-black text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-black/10"
                  >
                    Approve Audit
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center py-12 sm:py-20 bg-slate-50 rounded-[28px] sm:rounded-[40px] md:rounded-[60px] border-2 border-dashed border-slate-200 text-center px-6 sm:px-12">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm">
                <MessageSquare size={24} className="sm:size-32 text-slate-200" />
              </div>
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter text-slate-900">Select an audit</h3>
              <p className="text-slate-400 max-w-xs mx-auto mt-2 sm:mt-3 text-[10px] sm:text-xs md:text-sm leading-relaxed">
                Choose a mentee submission to begin your executive strategic review and feedback loop.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};