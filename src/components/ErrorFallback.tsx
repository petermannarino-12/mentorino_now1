import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  eventId?: string;
  componentStack?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error: _error, resetError }) => {
  return (
    <div role="alert" className="fixed inset-0 bg-black flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Something went wrong</h2>
        <p className="text-slate-600 mb-6 font-medium">We're sorry, an unexpected error occurred. Please try again.</p>
        <button 
          onClick={resetError}
          className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
};
