import React, { useEffect, useRef, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { getUsername } from "~/utils/session.server";
import { connectDB, isDBAvailable, getInMemoryStore } from "~/utils/db";
import User, { IUser } from "~/models/User";

type ProfileLoaderData = { profile: { displayName: string; bio: string; avatarUrl: string | null; username: string } };

export const loader: LoaderFunction = async ({ request }) => {
  const username = await getUsername(request);
  if (!username) return redirect("/login");
  await connectDB();
  try {
    console.log('[loader] profile start for', username);
    if (isDBAvailable()) {
      const user = (await User.findOne({ username }).lean()) as IUser | null;
      console.log('[loader] DB available, user:', !!user);

      const result: ProfileLoaderData = { profile: { displayName: user?.displayName || "", bio: user?.bio || "", avatarUrl: user?.avatarUrl || null, username } };
      return json(result);
    }

    // DB not available — return in-memory profile if present
    const store = getInMemoryStore();
    const user = store[username];
    console.log('[loader] DB not available, in-memory user:', !!user);
    const result: ProfileLoaderData = { profile: { displayName: user?.displayName || "", bio: user?.bio || "", avatarUrl: user?.avatarUrl || null, username } };
    return json(result);
  } catch (err) {
    console.error('[loader] Error in profile loader:', err);
    // Return a JSON 500 response to ensure caller receives a defined payload
    let message = 'Failed to load profile';
    if (err && typeof err === 'object' && 'message' in err) {
      const obj = err as { [k: string]: unknown };
      const m = obj['message'];
      if (typeof m === 'string') message = m;
    }
    return json({ message: 'Failed to load profile', error: message }, { status: 500 });
  }
};

export default function ProfilePage() {
  const data = useLoaderData<ProfileLoaderData>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetcher = useFetcher<any>();
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(data.profile.avatarUrl || null);
  const [submitting, setSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState<string>(data.profile.displayName || "");
  const [bio, setBio] = useState<string>(data.profile.bio || "");

  useEffect(() => {
    // fetcher.state is 'idle' | 'submitting' | 'loading'
    if (fetcher.state === "loading" || fetcher.state === "idle") {
      if (fetcher.data?.success) {
        setStatus("Profile updated successfully.");
        setPreview(fetcher.data.user?.avatarUrl || preview);
        // update local fields so the UI reflects saved values immediately
        if (typeof fetcher.data.user?.displayName === 'string') setDisplayName(fetcher.data.user.displayName);
        if (typeof fetcher.data.user?.bio === 'string') setBio(fetcher.data.user.bio);
        setSubmitting(false);
      } else if (fetcher.data?.error) {
        setStatus(String(fetcher.data.error));
        setSubmitting(false);
      }
    }
  }, [fetcher, preview]);

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
          const fd = new FormData();
          fd.append('displayName', displayName);
          fd.append('bio', bio);
          const fileInput = fileRef.current;
          const file = fileInput?.files?.[0];
          if (file) fd.append('avatar', file);
          setSubmitting(true);
          fetcher.submit(fd, { action: '/api/profile', method: 'post' });
        }} method="post" encType="multipart/form-data" style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'inline-block' }}>
            <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} ref={fileRef} />
            <button type="button" onClick={() => fileRef.current?.click()} style={{ background: '#ff7ab6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Choose File</button>
          </label>

          <input name="displayName" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', minWidth: 220 }} />
          <input name="bio" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', minWidth: 260 }} />

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
