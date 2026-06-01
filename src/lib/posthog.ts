import posthog from 'posthog-js';

export const initPostHog = () => {
  const token = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

  if (token && host) {
    posthog.init(token, {
      api_host: host,
      person_profiles: 'identified_only', // or 'always'
      capture_pageview: true,
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '*',
      },
    });
  }
};
