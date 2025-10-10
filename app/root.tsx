import type { LinksFunction } from "@remix-run/node";
import * as Remix from "@remix-run/react";
import type { ReactNode } from "react";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: "/styles/global.css" },
  { rel: "stylesheet", href: "/styles/tailwind.css" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Remix.Meta />
        <Remix.Links />
      </head>
      <body>
        {children}
        <Remix.ScrollRestoration />
        <Remix.Scripts />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  // useCatch gives access to Remix's ErrorResponse (status, statusText, data)
  // Provide a typed hook fallback for environments where it isn't exported as expected
  type CatchShape = { status: number; statusText: string; data: unknown | null };
  const useCatchHook: () => CatchShape = ((Remix as unknown) as { useCatch?: () => CatchShape }).useCatch ?? (() => ({ status: 500, statusText: 'Error', data: null }));
  const caught = useCatchHook();
  // Minimal UI — show status and any returned data
  return (
    <html lang="en">
      <head>
        <title>{`Error ${caught.status}`}</title>
        <Remix.Meta />
        <Remix.Links />
      </head>
      <body style={{ padding: 24, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <h1>Request Error</h1>
        <p>Status: {caught?.status ?? 500} {caught?.statusText ?? ''}</p>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f8', padding: 12, borderRadius: 6 }}>{JSON.stringify(caught?.data ?? null, null, 2)}</pre>
        <Remix.Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  // Be defensive: error may be undefined or not an Error instance when Remix surfaces certain internal failures
  console.error('ErrorBoundary caught:', error);
  const isProd = process.env.NODE_ENV === 'production';
  function extractMessage(e: unknown): string {
    if (!e) return 'An unexpected error occurred.';
    if (typeof e === 'string') return e;
    if (typeof e === 'object' && e !== null && 'message' in e) {
      const obj = e as { [k: string]: unknown };
      const m = obj['message'];
      return typeof m === 'string' ? m : String(m ?? 'An unexpected error occurred.');
    }
    return 'An unexpected error occurred.';
  }

  function extractStack(e: unknown): string | undefined {
    if (!e) return undefined;
    if (typeof e === 'object' && e !== null && 'stack' in e) {
      const obj = e as { [k: string]: unknown };
      const s = obj['stack'];
      return typeof s === 'string' ? s : undefined;
    }
    return undefined;
  }

  const message = extractMessage(error);
  const stack = extractStack(error);

  return (
    <html lang="en">
      <head>
        <title>Application Error</title>
        <Remix.Meta />
        <Remix.Links />
      </head>
      <body style={{ padding: 24, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <h1>Something went wrong</h1>
        <p>{isProd ? 'An unexpected error occurred.' : message}</p>
        {!isProd && stack && (
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff6f6', padding: 12, borderRadius: 6 }}>{String(stack)}</pre>
        )}
        <Remix.Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Layout>
      <Remix.Outlet />
    </Layout>
  );
}