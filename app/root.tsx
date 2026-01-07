import type { LinksFunction } from "@remix-run/node";
import { Meta, Links, Scripts, ScrollRestoration, Outlet, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import globalStylesUrl from "./styles/global.css?url";
import tailwindStylesUrl from "./styles/tailwind.css?url";
import type { ReactNode } from "react";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: globalStylesUrl },
  { rel: "stylesheet", href: tailwindStylesUrl },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const routeErr = useRouteError();
  const isRouteErrResp = isRouteErrorResponse(routeErr);

  return (
    <html lang="en">
      <head>
        <title>Request Error</title>
  <Meta />
  <Links />
      </head>
      <body style={{ padding: 24, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <h1>Request Error</h1>
        {isRouteErrResp ? (
          <div>
            {/* routeErr is a RouteResponse-like object when isRouteErrResp is true */}
            {(() => {
              const r = routeErr as { status?: number; statusText?: string; data?: unknown } | undefined;
              const status = typeof r?.status === 'number' ? r!.status : undefined;
              const statusText = typeof r?.statusText === 'string' ? r!.statusText : '';
              return (
                <>
                  <p>Status: {status ?? ''} {statusText}</p>
                  <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f8', padding: 12, borderRadius: 6 }}>
                    {JSON.stringify(r?.data ?? null, null, 2)}
                  </pre>
                </>
              );
            })()}
          </div>
        ) : (
          <div>
            <p>An unexpected route error occurred.</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f8', padding: 12, borderRadius: 6 }}>
              {JSON.stringify(routeErr ?? null, null, 2)}
            </pre>
          </div>
        )}
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  const routeErr = useRouteError();
  const isRouteErrResp = isRouteErrorResponse(routeErr);
  const isProd = process.env.NODE_ENV === 'production';

  if (isRouteErrResp) {
    if (!isProd) {
      console.error('Route ErrorBoundary caught (response):', routeErr);
    }
  const r = routeErr as { status?: number; statusText?: string; data?: unknown } | undefined;
  const status = typeof r?.status === 'number' ? r!.status : 500;
  const statusText = typeof r?.statusText === 'string' ? r!.statusText : '';
  const data = r?.data ?? null;

    return (
      <html lang="en">
        <head>
          <title>Application Error</title>
          <Meta />
          <Links />
        </head>
        <body style={{ padding: 24, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          <h1>{status} {statusText}</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff6f6', padding: 12, borderRadius: 6 }}>
            {JSON.stringify(data, null, 2)}
          </pre>
          <Scripts />
        </body>
      </html>
    );
  }

  // Handle runtime errors fallback
  if (!isProd) {
    console.error('ErrorBoundary caught (error prop):', error);
  }

  let message = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (error) {
    if (typeof error.message === 'string') message = error.message;
    if (typeof error.stack === 'string') stack = error.stack;
  }

  return (
    <html lang="en">
      <head>
        <title>Application Error</title>
        <Meta />
        <Links />
      </head>
      <body style={{ padding: 24, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <h1>Something went wrong</h1>
        <p>{isProd ? 'An unexpected error occurred.' : message}</p>
        {!isProd && stack && (
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff6f6', padding: 12, borderRadius: 6 }}>
            {stack}
          </pre>
        )}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
