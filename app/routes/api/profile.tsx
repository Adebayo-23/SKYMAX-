import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { connectDB } from "~/utils/db";
import { getUsername } from "~/utils/session.server";
import User from "~/models/User";
import fs from "fs";
import path from "path";

export const action: ActionFunction = async ({ request }) => {
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

  const user = await User.findOne({ username });
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
  const contentType = fileObj.type || '';
    if (!contentType.startsWith('image/')) {
      return json({ error: 'Invalid file type. Images only.' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // preserve extension when possible
    let ext = '.png';
    try {
  const originalName = (fileObj as File).name || '';
      const match = originalName.match(/\.([a-zA-Z0-9]+)$/);
      if (match) ext = '.' + match[1];
      else if (contentType === 'image/jpeg') ext = '.jpg';
      else if (contentType === 'image/png') ext = '.png';
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
};

// Provide a loader so GET requests to /api/profile return a clear response
export const loader: LoaderFunction = async () => {
  return json({ error: 'This endpoint accepts POST requests to update profile. Use POST with multipart/form-data.' }, { status: 405 });
};
