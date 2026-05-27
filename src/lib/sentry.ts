let _Sentry: typeof import("@sentry/react") | null = null;

(async () => {
  try {
    _Sentry = await import("@sentry/react");
  } catch {
    _Sentry = null;
  }
})();

export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN && _Sentry) {
    _Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [_Sentry.browserTracingIntegration()],
      tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    });
  }
};

export function captureException(error: unknown, extra?: Record<string, unknown>) {
  _Sentry?.captureException(error, { extra });
}

export function setUser(user: { id: string; email: string } | null) {
  if (user) {
    _Sentry?.setUser({ id: user.id, email: user.email });
  } else {
    _Sentry?.setUser(null);
  }
}
