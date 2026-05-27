import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ChunkErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error) {
    const isChunkLoadError = 
      /chunk/i.test(error.message) || 
      /dynamically imported module/i.test(error.message) || 
      /failed to fetch/i.test(error.message) ||
      error.name === 'ChunkLoadError';

    if (isChunkLoadError) {
      console.warn('Chunk loading/dynamic import error detected. Forcing page refresh...');
      
      const reloadKey = 'chunk-load-failed-reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      
      // If we reloaded less than 10 seconds ago, don't reload again to prevent infinite loop.
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(reloadKey, now.toString());
        window.location.reload();
      }
    } else {
      console.error('Application Error caught by Boundary:', error);
    }
  }

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || '';
      const isChunkLoadError = 
        /chunk/i.test(errorMsg) || 
        /dynamically imported module/i.test(errorMsg) || 
        /failed to fetch/i.test(errorMsg);

      return (
        <div className="fixed inset-0 bg-black flex items-center justify-center p-6 text-center z-[9999]">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
              {isChunkLoadError ? 'Connection Error' : 'Application Error'}
            </h2>
            <p className="text-slate-600 mb-6 font-medium">
              {isChunkLoadError 
                ? 'Failed to load content. Please check your internet connection or reload the page.' 
                : 'An unexpected application error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
