import { createElement } from 'react';
import ApplicationLayout from '@/layouts/application';

/**
 * Resolves the layout for a page based on its name
 * Used by both client-side and SSR to avoid duplication
 */
export default function resolvePageLayout(name: string, page: any): any {
  // If the page already has a layout specified, use it as-is
  if (page.default.layout) {
    return page;
  }

  // Otherwise set up dynamic layout resolution
  page.default.layout = (pageComponent: any) => {
    const pageProps = pageComponent.props || {};

    // Default to Application layout for all pages
    return createElement(ApplicationLayout, { ...pageProps }, pageComponent);
  };

  return page;
}
