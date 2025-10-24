import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { connectDB, isDBAvailable, getInMemoryStore } from "~/utils/db";
import { getUsername, getSession, commitSession } from "~/utils/session.server";
import User, { IUser } from "~/models/User";
import fs from "fs";
import path from "path";

// Local in-memory user shape (matches `app/utils/db.ts` InMemoryUser)
type InMemoryUser = { username: string; email?: string | null; displayName?: string | null; bio?: string | null; avatarUrl?: string | null };

console.log('[module] loaded api/profile.ts');

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log('[action] /api/profile invoked');
    await connectDB();

    const username = await getUsername(request);
    if (!username) return json({ error: "Unauthorized" }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    // Parse multipart form
    const formData = await request.formData();
    const displayName = formData.get("displayName");
    const bio = formData.get("bio");
    const file = formData.get("avatar");

    if (isDBAvailable()) {
      console.log('[action] DB available — updating DB user');
      const user = (await User.findOne({ username })) as IUser | null;
      if (!user) return json({ error: "User not found" }, { status: 404 });

      if (typeof displayName === "string") user.displayName = displayName.trim();
      if (typeof bio === "string") user.bio = bio.trim();

      if (file && typeof (file as File).arrayBuffer === "function") {
        const fileObj = file as File;
        const arrayBuffer = await fileObj.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // size check (5MB)
        const MAX_BYTES = 5 * 1024 * 1024;
        if (buffer.length > MAX_BYTES) {
          return json({ error: "File too large (max 5MB)" }, { status: 400 });
        }

        // mime check
        const fileContentType = fileObj.type || '';
        if (!fileContentType.startsWith('image/')) {
          return json({ error: 'Invalid file type. Images only.' }, { status: 400 });
        }

        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        let ext = '.png';
        try {
          const originalName = (fileObj as File).name || '';
          const match = originalName.match(/\.([a-zA-Z0-9]+)$/);
          if (match && match[1]) ext = '.' + match[1];
          else if (fileContentType === 'image/jpeg') ext = '.jpg';
          else if (fileContentType === 'image/png') ext = '.png';
        } catch (e) {
          /* ignore */
        }

        const filename = `${username}-${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);

        user.avatarUrl = `/uploads/${filename}`;
        console.log('[action] Saved avatar to', filePath);
      }

      await user.save();

      // Set a flash message and redirect to dashboard so the UI shows success after redirect
      const session = await getSession(request.headers.get('cookie'));
      session.flash('profileMessage', 'Profile updated successfully');
      const setCookie = await commitSession(session);
      return redirect('/dashboard', { headers: { 'Set-Cookie': setCookie } });
    }

  // DB not available — use in-memory fallback
    const store = getInMemoryStore();
    // Try to match by username or email (case-insensitive) — helpful when DB is down but user was created elsewhere
    const lookupKey = username.toLowerCase();
    let existing = store[username];
    if (!existing) {
      existing = (Object.values(store).find(u => ((u.username || '').toLowerCase() === lookupKey) || ((u.email || '').toLowerCase() === lookupKey)) as unknown) as InMemoryUser | null || null;
    }
    if (!existing) {
      // Create a minimal record so profile can be updated in-memory for local dev
      existing = { username, email: null, displayName: null, bio: null, avatarUrl: null };
    }
    if (typeof displayName === "string") existing.displayName = displayName.trim();
    if (typeof bio === "string") existing.bio = bio.trim();

    if (file && typeof (file as File).arrayBuffer === "function") {
      const fileObj = file as File;
      const arrayBuffer = await fileObj.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const MAX_BYTES = 5 * 1024 * 1024;
      if (buffer.length > MAX_BYTES) {
        return json({ error: "File too large (max 5MB)" }, { status: 400 });
      }

      const fileContentType = fileObj.type || '';
      if (!fileContentType.startsWith('image/')) {
        return json({ error: 'Invalid file type. Images only.' }, { status: 400 });
      }

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      let ext = '.png';
      try {
        const originalName = (fileObj as File).name || '';
        const match = originalName.match(/\.([a-zA-Z0-9]+)$/);
        if (match && match[1]) ext = '.' + match[1];
        else if (fileContentType === 'image/jpeg') ext = '.jpg';
        else if (fileContentType === 'image/png') ext = '.png';
      } catch (e) {
        /* ignore */
      }

      const filename = `${username}-${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      existing.avatarUrl = `/uploads/${filename}`;
      console.log('[action] Saved avatar to', filePath, '(in-memory)');
    }

  // Store by username key to make future lookups consistent
  store[existing.username || username] = existing;

  // set flash for in-memory fallback as well and redirect
  const session = await getSession(request.headers.get('cookie'));
  session.flash('profileMessage', 'Profile updated successfully');
  const setCookie = await commitSession(session);
  return redirect('/dashboard', { headers: { 'Set-Cookie': setCookie } });
  } catch (err) {
    console.error('[action] Unexpected error in /api/profile action:', err);
    let message = 'Unexpected server error';
    if (err && typeof err === 'object' && 'message' in err) {
      const obj = err as { [k: string]: unknown };
      const m = obj['message'];
      if (typeof m === 'string') message = m;
    }
    return json({ error: message }, { status: 500 });
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  console.log('[loader] profile start');
  await connectDB();
  const username = await getUsername(request);
  console.log('[loader] username from session:', username);
  if (!username) return json({ error: 'Unauthorized' }, { status: 401 });

  if (isDBAvailable()) {
    const user = (await User.findOne({ username }).lean()) as IUser | null;
    if (!user) return json({ error: 'User not found' }, { status: 404 });

    return json({ profile: { username: user.username, displayName: user.displayName || null, bio: user.bio || null, avatarUrl: user.avatarUrl || null } });
  }

  // DB not available — return in-memory profile
  const store = getInMemoryStore();
  const user = store[username];
  if (!user) return json({ profile: { username, displayName: null, bio: null, avatarUrl: null } });
  return json({ profile: { username: user.username, displayName: user.displayName || null, bio: user.bio || null, avatarUrl: user.avatarUrl || null } });
};
