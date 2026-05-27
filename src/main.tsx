import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryProvider } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { PostHogProvider } from '@posthog/react';
import posthog from 'posthog-js';
import { initPostHog } from './lib/posthog';
import { initSentry } from './lib/sentry';
import * as Sentry from "@sentry/react";
import { ErrorFallback } from './components/ErrorFallback';
import { HelmetProvider } from 'react-helmet-async';

initSentry();
initPostHog();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Sentry.ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
        <QueryProvider>
          <AuthProvider>
            <PostHogProvider client={posthog}>
              <App />
            </PostHogProvider>
          </AuthProvider>
        </QueryProvider>
      </Sentry.ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
