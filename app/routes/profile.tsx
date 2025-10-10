import React, { useEffect, useRef, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { getUsername } from "~/utils/session.server";
import { connectDB } from "~/utils/db";
import User from "~/models/User";

export const loader: LoaderFunction = async ({ request }) => {
  const username = await getUsername(request);
  if (!username) return redirect("/login");

  await connectDB();
  const user = await User.findOne({ username }).lean();

  return json({ profile: { displayName: user?.displayName || "", bio: user?.bio || "", avatarUrl: user?.avatarUrl || null, username } });
};

export default function ProfilePage() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(data.profile.avatarUrl || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (fetcher.type === "done") {
      if (fetcher.data?.success) {
        setStatus("Profile updated successfully.");
        setPreview(fetcher.data.user?.avatarUrl || preview);
        setSubmitting(false);
      } else if (fetcher.data?.error) {
        setStatus(String(fetcher.data.error));
        setSubmitting(false);
      }
    }
  }, [fetcher]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return setPreview(data.profile.avatarUrl || null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Profile Setup</h1>
      <p>Manage your display name, bio and profile picture.</p>

      <div style={{ marginTop: 20, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', background: '#f3f3f3', border: '2px solid #f0e6f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {preview ? (
              <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No Avatar</div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>{data.profile.displayName || data.profile.username}</h3>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>{data.profile.bio || 'Add a short bio to show on your dashboard'}</p>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);
          setSubmitting(true);
          fetcher.submit(fd, { action: '/api/profile', method: 'post' });
        }} method="post" encType="multipart/form-data" style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'inline-block' }}>
            <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} ref={fileRef} />
            <button type="button" onClick={() => fileRef.current?.click()} style={{ background: '#ff7ab6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Choose File</button>
          </label>

          <input name="displayName" placeholder="Display name" defaultValue={data.profile.displayName} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', minWidth: 220 }} />
          <input name="bio" placeholder="Bio" defaultValue={data.profile.bio} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', minWidth: 260 }} />

          <button type="submit" style={{ background: '#4B0082', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>{submitting ? 'Saving...' : 'Save Profile'}</button>
        </form>

        {status && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: fetcher.data?.success ? '#e6ffed' : '#ffe6e6', color: fetcher.data?.success ? '#0b6b2a' : '#b21c1c' }}>
            {status}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/dashboard" style={{ color: '#7b2b9b' }}>Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
