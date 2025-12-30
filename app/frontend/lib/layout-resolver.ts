import { createElement } from 'react';
import ApplicationLayout from '@/layouts/application';
import WorkspaceLayout from '@/layouts/workspace';
import FullscreenLayout from '@/layouts/fullscreen';

/**
 * Resolves the layout for a page based on controller-specified reactLayout prop
 * or falls back to the default ApplicationLayout.
 *
 * Controllers can specify layout via: `react_layout "workspace"`
 *
 * Available layouts:
 * - "workspace" - Authenticated pages with sidebar navigation
 * - "fullscreen" - No chrome, used for focused tasks (e.g., onboarding, auth)
 * - Default - Uses ApplicationLayout for public pages
 */
export default function resolvePageLayout(_name: string, page: any): any {
  // If the page already has a layout specified, use it as-is
  if (page.default.layout) {
    return page;
  }

  // Otherwise set up dynamic layout resolution
  page.default.layout = (pageComponent: any) => {
    const pageProps = pageComponent.props || {};

    // Controller-specified layout takes precedence
    if (pageProps.reactLayout === 'fullscreen') {
      return createElement(FullscreenLayout, { ...pageProps }, pageComponent);
    }

    // Use WorkspaceLayout for authenticated workspace pages
    if (pageProps.reactLayout === 'workspace') {
      return createElement(WorkspaceLayout, { ...pageProps }, pageComponent);
    }

    // Default to Application layout for all pages
    return createElement(ApplicationLayout, { ...pageProps }, pageComponent);
  };

  return page;
}
