import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import './index.css';
import { QueryProvider } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { PostHogProvider } from '@posthog/react';
import posthog from 'posthog-js';
import { initPostHog } from './lib/posthog';
import { initSentry } from './lib/sentry';
import { ErrorFallback } from './components/ErrorFallback';
import { HelmetProvider } from 'react-helmet-async';

initSentry();
initPostHog();

function sentryFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return <ErrorFallback error={error} resetError={resetErrorBoundary} />;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={sentryFallback}>
        <QueryProvider>
          <AuthProvider>
            <PostHogProvider client={posthog}>
              <App />
            </PostHogProvider>
          </AuthProvider>
        </QueryProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
