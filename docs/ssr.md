# Server-Side Rendering (SSR)

This project uses Inertia.js SSR to render React pages on the server before sending them to the browser. This gives faster first contentful paint and better SEO since crawlers see fully rendered HTML.

## How It Works

### Request lifecycle

1. **Rails receives a request** and builds Inertia props via jbuilder
2. **Inertia Rails sends the page data to a Node.js SSR server** (started automatically by Vite)
3. **The SSR server** (`app/frontend/ssr/ssr.ts`) renders the React component tree to an HTML string using `ReactDOMServer.renderToString`
4. **Rails embeds the HTML** in the response alongside the serialized props
5. **The browser receives pre-rendered HTML** — content is visible immediately
6. **React hydrates** the existing HTML using `hydrateRoot`, attaching event listeners without re-rendering the DOM

### Key files

| File                                   | Purpose                                                              |
| -------------------------------------- | -------------------------------------------------------------------- |
| `app/frontend/ssr/ssr.ts`              | SSR server entrypoint — renders React to HTML on the server          |
| `app/frontend/entrypoints/inertia.ts`  | Client entrypoint — hydrates SSR HTML or falls back to client render |
| `config/vite.json`                     | `ssrBuildEnabled: true` enables SSR builds per environment           |
| `vite.config.ts`                       | `ssr.noExternal` lists packages that must be bundled for SSR         |
| `config/initializers/inertia_rails.rb` | `config.ssr_enabled = ViteRuby.config.ssr_build_enabled`             |
| `app/frontend/lib/layout-resolver.ts`  | Resolves page layouts — shared by both SSR and client                |

### SSR vs client entrypoint

The SSR entrypoint (`ssr.ts`) and client entrypoint (`inertia.ts`) both call `createInertiaApp` but differ in how they render:

- **SSR**: Uses `ReactDOMServer.renderToString` — produces an HTML string, no DOM interaction
- **Client**: Uses `hydrateRoot` if SSR HTML exists, otherwise falls back to `createRoot`

Both share the same `layout-resolver.ts` and page component resolution logic to ensure consistency.

## Writing SSR-Safe Code

### The golden rule

Code that runs during SSR executes in Node.js, not a browser. There is no `window`, `document`, `localStorage`, or any browser API.

### Use `import.meta.env.SSR` to guard browser-only code

```tsx
// In entrypoints or top-level code
if (!import.meta.env.SSR) {
  // Safe to use window, document, localStorage, etc.
}
```

This check is statically analyzed by Vite and tree-shaken out of the SSR bundle entirely.

### Common patterns

**Browser APIs in components — use `useEffect`:**

```tsx
function MyComponent() {
  const [width, setWidth] = useState(0);

  // useEffect never runs on the server — safe for browser APIs
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  return <div>Width: {width || 'Loading...'}</div>;
}
```

**Conditional imports:**

```tsx
// Dynamic import guarded by SSR check (top-level in entrypoint)
if (!import.meta.env.SSR) {
  const { initTheme } = await import('../lib/theme');
  initTheme();
}
```

**Third-party libraries that access `window`:**

If a library accesses browser globals at import time (not just at call time), you may need to dynamically import it:

```tsx
function ChartComponent({ data }: { data: ChartData }) {
  const [Chart, setChart] = useState<typeof import('some-chart-lib') | null>(null);

  useEffect(() => {
    import('some-chart-lib').then(setChart);
  }, []);

  if (!Chart) return <div>Loading chart...</div>;
  return <Chart.default data={data} />;
}
```

## Maintaining SSR as the Project Grows

### When adding new pages

No special action needed. Pages are auto-discovered via `import.meta.glob('../pages/**/*.tsx')` in both the SSR and client entrypoints. Just make sure the page component doesn't access browser APIs during render (only in `useEffect` or event handlers).

### When adding new layouts

Update `app/frontend/lib/layout-resolver.ts` to handle the new layout name. The resolver is shared by SSR and client, so both will pick it up automatically.

### When adding new npm packages

If a new package causes SSR errors like:

- `require is not defined`
- `module is not defined`
- `SyntaxError: Cannot use import statement outside a module`
- `ReferenceError: window is not defined` (at import time)

Add the package name to `ssr.noExternal` in `vite.config.ts`. This tells Vite to bundle the package into the SSR build instead of treating it as an external Node.js module.

```ts
// vite.config.ts
ssr: {
  noExternal: [
    // ... existing packages
    'new-problematic-package',
  ],
},
```

### When adding global providers (Context, etc.)

If you wrap the app in a provider (e.g., toast, analytics, auth), you need to add it in **both** places:

1. `app/frontend/ssr/ssr.ts` — the SSR server setup
2. `app/frontend/entrypoints/inertia.ts` — the client setup

If the provider requires browser APIs (like analytics), only add it to the client entrypoint and guard with `!import.meta.env.SSR`.

### When using `next-themes` or similar theme libraries

Theme libraries typically read `localStorage` or `document.cookie` to determine the initial theme. This doesn't work in SSR. Strategies:

- Render a neutral/default theme on the server, let the client correct it on hydration
- Pass the theme preference as an Inertia shared prop from the server (cookie-based)
- Accept a brief flash of unstyled content (FOUC) on first load

## Debugging SSR Issues

### Hydration mismatches

React will warn in the console when the server-rendered HTML doesn't match what the client produces. Common causes:

| Cause                                           | Fix                                                    |
| ----------------------------------------------- | ------------------------------------------------------ |
| Using `Date.now()` or `Math.random()` in render | Move to `useEffect` or pass as a prop from the server  |
| Checking `window.innerWidth` during render      | Use `useEffect` with state, render a default on server |
| Browser extensions injecting elements           | Usually harmless — ignore these warnings               |
| Conditional rendering based on `localStorage`   | Use `useEffect` for the client-specific branch         |

### SSR server crashes

Check the Vite dev server output in your terminal. The SSR server runs as part of the Vite process. Common issues:

- A package not in `ssr.noExternal` that needs to be
- A component accessing `window`/`document` at the module level (not in `useEffect`)
- Missing environment variables that the SSR server needs

### Verifying SSR is working

1. **View page source** (Cmd+Option+U) — you should see rendered HTML content inside the `#app` div, not an empty container
2. **Disable JavaScript** in DevTools — the page content should still be visible
3. **Check the Network tab** — the initial HTML response should contain the page content

## Disabling SSR

To disable SSR per environment, set `ssrBuildEnabled: false` in `config/vite.json`:

```json
{
  "development": {
    "ssrBuildEnabled": false
  }
}
```

The client entrypoint automatically falls back to `createRoot` when there's no SSR HTML to hydrate, so disabling SSR requires no frontend code changes.

## Performance Notes

- The SSR server uses `{ cluster: true }` to spawn multiple worker processes, improving throughput under load
- Use `json.cache!` in jbuilder views to reduce prop serialization time
- Heavy components (charts, tables) can be lazy-loaded client-side if they slow down SSR
- SSR adds ~10-50ms per request depending on page complexity — monitor this in production
