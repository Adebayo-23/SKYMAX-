import type { LinksFunction } from "@remix-run/node";
import * as Remix from "@remix-run/react";
// re-export helpers (some bundlers export differently). Use small helpers with local eslint disables
/* eslint-disable @typescript-eslint/no-explicit-any */
function getUseRouteError(): () => unknown {
  const anyRemix = Remix as any;
  return anyRemix.useRouteError ?? anyRemix.useRouteError ?? (() => undefined);
}

function getIsRouteErrorResponse(): (e: unknown) => boolean {
  const anyRemix = Remix as any;
  return anyRemix.isRouteErrorResponse ?? anyRemix.isRouteErrorResponse ?? (() => false);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const useRouteErrorHelper = getUseRouteError();
const isRouteErrorResponseHelper = getIsRouteErrorResponse();
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
  // useRouteError gives access to the thrown value for the nearest route
  const routeErr = useRouteErrorHelper();
  const isRouteErrResp = isRouteErrorResponseHelper(routeErr);

  return (
    <html lang="en">
      <head>
        <title>Request Error</title>
        <Remix.Meta />
        <Remix.Links />
      </head>
      <body style={{ padding: 24, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <h1>Request Error</h1>
        {isRouteErrResp ? (
          <div>
            <p>Status: {(routeErr as any).status} {(routeErr as any).statusText}</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f8', padding: 12, borderRadius: 6 }}>{JSON.stringify((routeErr as any).data ?? null, null, 2)}</pre>
          </div>
        ) : (
          <div>
            <p>An unexpected route error occurred.</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f8', padding: 12, borderRadius: 6 }}>{JSON.stringify(routeErr ?? null, null, 2)}</pre>
          </div>
        )}
        <Remix.Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  // If there's a route error available, render it (this helps with loader/action Response errors)
  const routeErr = useRouteErrorHelper();
  const isRouteErrResp = isRouteErrorResponseHelper(routeErr);
  if (isRouteErrResp) {
    console.error('Route ErrorBoundary caught (response):', routeErr);
  const r = routeErr as unknown;
  const status = r && typeof r === 'object' && 'status' in (r as object) ? (r as any)['status'] : 500;
  const statusText = r && typeof r === 'object' && 'statusText' in (r as object) ? (r as any)['statusText'] : '';
  const data = r && typeof r === 'object' && 'data' in (r as object) ? (r as any)['data'] : null;
    return (
      <html lang="en">
        <head>
          <title>Application Error</title>
          <Remix.Meta />
          <Remix.Links />
        </head>
        <body style={{ padding: 24, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          <h1>{String(status)} {String(statusText)}</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff6f6', padding: 12, borderRadius: 6 }}>{JSON.stringify(data ?? null, null, 2)}</pre>
          <Remix.Scripts />
        </body>
      </html>
    );
  }

  // Fallback to handling the error prop (runtime errors)
  console.error('ErrorBoundary caught (error prop):', error);
  const isProd = process.env.NODE_ENV === 'production';
  let message = 'An unexpected error occurred.';
  let stack: string | undefined;
  if (error && typeof error === 'object') {
    const eObj = error as unknown as { [k: string]: unknown };
    const m = eObj['message'];
    if (typeof m === 'string') message = m;
    const s = eObj['stack'];
    if (typeof s === 'string') stack = s;
  }

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