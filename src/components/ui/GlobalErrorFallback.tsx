import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface GlobalErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const GlobalErrorFallback: React.FC<GlobalErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-xl border border-slate-100 p-10 md:p-12 space-y-8"
      >
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-2">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            Unexpected <br /> System Fault
          </h1>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            We encountered a runtime irregularity. Our engineers have been notified via Sentry and are investigating.
          </p>
        </div>

        {isDev && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left overflow-auto max-h-40">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Technical Details (Dev Only)</p>
            <code className="text-xs font-mono text-red-600 block break-words">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={resetErrorBoundary}
            className="group flex items-center justify-center space-x-2 w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
          >
            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Reload Interface</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center space-x-2 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
          >
            <Home size={14} />
            <span>Return Home</span>
          </button>
        </div>
      </motion.div>
      
      <div className="mt-12 text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">
        Mentorino × Private Infrastructure
      </div>
    </div>
  );
};
