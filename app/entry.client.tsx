/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

// Defensive hydration: ensure the remix context `future` object exists
if (typeof window !== "undefined") {
  // make sure other runtime code doesn't crash when reading `future`
  try {
    (window as any).__remixContext = (window as any).__remixContext || {};
    (window as any).__remixContext.future = (window as any).__remixContext.future || {};
  } catch (e) {
    // ignore - best effort
  }
}

try {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  });
} catch (err) {
  // Log and surface hydration/runtime failures for easier debugging in prod builds
  // eslint-disable-next-line no-console
  console.error("Hydration failed:", err);
}
