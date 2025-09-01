/// <reference types="vite/client" />

import { createInertiaApp } from '@inertiajs/react';
import { renderApp } from '@inertiaui/modal-react';
import * as Sentry from '@sentry/react';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import ApplicationLayout from '../layouts/application';
import { initTheme } from '../lib/theme';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

// Initialize theme system
initTheme();

createInertiaApp({
  resolve: (name): any => {
    const pages = import.meta.glob<any>('../pages/**/*.tsx', { eager: true });
    const page = pages[`../pages/${name}.tsx`];

    // If the page already has a layout specified, use it as-is
    if (page.default.layout) {
      return page;
    }

    // Otherwise set up dynamic layout resolution
    page.default.layout = (page: any) => {
      const pageProps = page.props || {};

      // Default to Application layout
      return createElement(ApplicationLayout, { ...pageProps }, page);
    };

    return page;
  },

  setup({ el, App, props }) {
    if (SENTRY_DSN) {
      console.log('Initializing Sentry');
      Sentry.init({
        dsn: SENTRY_DSN,
        // Setting this option to true will send default PII data to Sentry.
        // For example, automatic IP address collection on events
        sendDefaultPii: true,
        integrations: [
          Sentry.replayIntegration({
            maskAllText: false,
            maskAllInputs: false,
            blockAllMedia: false,
          }),
        ],
        replaysSessionSampleRate: 0.5, // This sets the sample rate at 50%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      });
    } else {
      console.log('SENTRY_DSN is not set, skipping Sentry initialization');
    }
    const root = createRoot(el);
    root.render(renderApp(App, props));
  },
});
