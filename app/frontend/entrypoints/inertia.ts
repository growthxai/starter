/// <reference types="vite/client" />

import { createInertiaApp } from '@inertiajs/react';
import { renderApp } from '@inertiaui/modal-react';
import * as Sentry from '@sentry/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import resolvePageLayout from '../lib/layout-resolver';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (!import.meta.env.SSR) {
  const { initTheme } = await import('../lib/theme');
  initTheme();
}

createInertiaApp({
  resolve: (name): any => {
    const pages = import.meta.glob<any>('../pages/**/*.tsx', { eager: true });
    const page = pages[`../pages/${name}.tsx`];
    return resolvePageLayout(name, page);
  },

  setup({ el, App, props }) {
    if (!import.meta.env.SSR && SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        sendDefaultPii: true,
        integrations: [
          Sentry.replayIntegration({
            maskAllText: false,
            maskAllInputs: false,
            blockAllMedia: false,
          }),
        ],
        replaysSessionSampleRate: 0.5,
        replaysOnErrorSampleRate: 1.0,
      });
    }

    const appElement = renderApp(App, props);

    if (el && el.hasChildNodes()) {
      hydrateRoot(el, appElement);
    } else {
      createRoot(el).render(appElement);
    }
  },
});
