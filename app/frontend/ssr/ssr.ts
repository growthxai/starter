import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { renderApp } from '@inertiaui/modal-react';
import resolvePageLayout from '../lib/layout-resolver';

createServer(
  (page) =>
    createInertiaApp({
      page,
      render: ReactDOMServer.renderToString,
      resolve: (name) => {
        const pages = import.meta.glob('../pages/**/*.tsx', { eager: true });
        const pagePath = `../pages/${name}.tsx`;
        const resolved = pages[pagePath];

        if (!resolved) {
          throw new Error(`Page not found: ${name}`);
        }

        return resolvePageLayout(name, resolved);
      },
      setup: ({ App, props }) => renderApp(App, props),
    }),
  { cluster: true }
);
