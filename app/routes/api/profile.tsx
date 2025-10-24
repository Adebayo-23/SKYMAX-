import React from 'react';
export { action, loader } from './profile';

export default function ApiProfilePage() {
  // This route is primarily an API endpoint. When a user navigates to /api/profile
  // in a browser we provide a tiny informational page instead of a 404.
  return (
    <div style={{ padding: 24 }}>
      <h2>/api/profile</h2>
      <p>This URL is an API endpoint. Use the profile UI at <a href="/profile">/profile</a> or the dashboard.</p>
    </div>
  );
}
// Re-export the real implementation from profile.ts so the filesystem route
// is handled by a single module. This avoids the placeholder shadowing the
// actual route and causing 404s for /api/profile.

export * from './profile';
