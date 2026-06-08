import * as Sentry from "@sentry/react";

export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
      release: import.meta.env.VERCEL_GIT_COMMIT_SHA || 'dev',
    });
  }
};

export function captureException(error: unknown, extra?: Record<string, unknown>) {
  Sentry.captureException(error, { extra });
}

export function captureMessage(message: string, extra?: Record<string, unknown>) {
  Sentry.captureMessage(message, { extra });
}

export function setUser(user: { id: string; email: string } | null) {
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}
