import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { connectDB, isDBAvailable, getInMemoryStore } from "~/utils/db";
import { getUsername } from "~/utils/session.server";
import User, { IUser } from "~/models/User";
import fs from "fs";
import path from "path";

export const action: ActionFunction = async ({ request }) => {
  try {
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
      }

      await user.save();

      return json({ success: true, user: { username: user.username, displayName: user.displayName, bio: user.bio, avatarUrl: user.avatarUrl } });
    }

    // DB not available — use in-memory fallback
    const store = getInMemoryStore();
    const existing = store[username] || { username, displayName: null, bio: null, avatarUrl: null };
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
    }

    store[username] = existing;
    return json({ success: true, user: existing });
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
  await connectDB();
  const username = await getUsername(request);
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
