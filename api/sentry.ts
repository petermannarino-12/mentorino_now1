let sentryInitialized = false;

export async function captureException(error: unknown, extra?: Record<string, unknown>) {
  if (!process.env.VITE_SENTRY_DSN) return;

  if (!sentryInitialized) {
    try {
      const Sentry = await import('@sentry/node');
      Sentry.init({
        dsn: process.env.VITE_SENTRY_DSN,
        tracesSampleRate: 0.1,
        environment: process.env.VERCEL_ENV || 'production',
        release: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
      });
      sentryInitialized = true;
    } catch {
      return;
    }
  }

  try {
    const Sentry = await import('@sentry/node');
    Sentry.captureException(error, { extra: { ...extra, handler: extra?.handler } });
    await Sentry.flush?.(2000);
  } catch {
    // Sentry should never crash the handler
  }
}
