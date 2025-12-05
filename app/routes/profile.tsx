import React, { useState, useRef } from "react";
import { useLoaderData, Form, useActionData, useSubmit } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { getUsername, getSession, commitSession } from "~/utils/session.server";
import { connectDB } from "~/utils/db";
import User from "~/models/User";
import fs from "fs";

// COMMENT OUT THESE 3 LINES IF YOUR BUTTON/INPUT/CARD IS BROKEN
// import { Button } from '~/components/ui/button';
// import { Input } from '~/components/ui/input';
// import { Card } from '~/components/ui/card';

// TAILWIND & BASE CSS ***MUST*** BE LOADED IN YOUR APP

export const loader: LoaderFunction = async ({ request }) => {
  await connectDB();
  const username = await getUsername(request);
  if (!username) throw new Response("Unauthorized", { status: 401 });
  const user = await User.findOne({ username });
  return json({ user });
};

export const action: ActionFunction = async ({ request }) => {
  await connectDB();
  const username = await getUsername(request);
  if (!username) return json({ error: "Unauthorized" }, { status: 401 });
  const formData = await request.formData();
  try {
    const user = await User.findOne({ username });
    const newUsername = (formData.get("username") as string) || user.username;
    const bio = (formData.get("bio") as string) || user.bio;
    if (newUsername && newUsername !== username) {
      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser) return json({ error: "Username already taken" }, { status: 400 });
    }
    user.username = newUsername;
    user.bio = bio;
    const avatarFile = formData.get("avatar") as File | null;
    if (avatarFile && avatarFile.size && typeof avatarFile.arrayBuffer === "function") {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const ext = avatarFile.name.split(".").pop() || "png";
      const fileName = `${newUsername || username}-${Date.now()}.${ext}`;
      const filePath = `/uploads/${fileName}`;
      await fs.promises.writeFile(`public${filePath}`, buffer);
      user.avatarUrl = filePath;
    }
    await user.save();

    // Set a flash message in the session and redirect to refresh loader data
    const session = await getSession(request.headers.get('cookie'));
    session.set('profileMessage', 'Profile updated');
    return redirect('/profile', {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch {
    return json({ error: "Failed to update profile" }, { status: 500 });
  }
};

export default function ProfilePage() {
  const { user } = useLoaderData();
  const actionData = useActionData<typeof action>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("No file chosen");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const submit = useSubmit();

  const handlePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFileName("No file chosen");
      setPreviewImage(null);
      setPreviewError(null);
      return;
    }
    // Validate file type and size (max 2MB)
    if (!file.type.startsWith('image/')) {
      setPreviewError('Please select an image file (jpg, png, gif).');
      setSelectedFileName('No file chosen');
      setPreviewImage(null);
      return;
    }
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setPreviewError('Image too large. Max size is 2 MB.');
      setSelectedFileName('No file chosen');
      setPreviewImage(null);
      return;
    }
    setSelectedFileName(file.name);
    setPreviewError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
      // Auto-submit the form with the selected file so the server saves the avatar
      // Use the Remix useSubmit helper with the form element to preserve multipart data
      if (formRef.current) {
        // Use a tiny timeout to ensure state updates don't interfere with submission
        setTimeout(() => submit(formRef.current as HTMLFormElement), 50);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {/* Gradient header */}
      <div className="bg-gradient-to-b from-purple-800 to-purple-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold">Profile Setup</h1>
          <p className="mt-4 text-lg max-w-2xl">
            Manage your display name, bio and profile picture.
          </p>
        </div>
      </div>
      {/* Overlapping Card - responsive improvements */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Form method="post" encType="multipart/form-data" ref={formRef}>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Real file input is visually hidden off-screen (not display:none) so label clicks always open file picker */}
              <input
                id="avatar-input"
                ref={fileInputRef}
                type="file"
                name="avatar"
                onChange={handlePreview}
                accept="image/*"
                // hidden off-screen via inline style to avoid relying on Tailwind
                style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, overflow: 'hidden' }}
              />

              {/* Avatar block - wrap image in a label tied to the input for reliable triggering */}
              <label
                htmlFor="avatar-input"
                className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0 p-0 cursor-pointer hover:border-pink-500 transition"
              >
                <img
                  src={previewImage || user.avatarUrl || "/uploads/default-avatar.svg"}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </label>

              {/* Text and Inputs */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Add a short bio to show on your dashboard
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-3 mt-2">
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="avatar-input"
                      className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md font-medium transition cursor-pointer"
                    >
                      Choose File
                    </label>
                    <span className="text-gray-500 text-sm">{selectedFileName}</span>
                  </div>

                  {previewError && (
                    <div className="text-red-600 text-sm mt-2">{previewError}</div>
                  )}

                  {actionData?.error && (
                    <div className="text-red-600 text-sm mt-2">{actionData.error}</div>
                  )}

                  {actionData?.success && (
                    <div className="text-green-600 text-sm mt-2">Profile updated.</div>
                  )}

                  <input
                    type="text"
                    name="username"
                    placeholder="Display name"
                    defaultValue={user.username}
                    className="border rounded px-2 py-1 w-full sm:w-56"
                  />

                  <input
                    type="text"
                    name="bio"
                    placeholder="Bio"
                    defaultValue={user.bio || ""}
                    className="border rounded px-2 py-1 w-full sm:w-80"
                  />

                  <input type="hidden" name="intent" value="update-profile" />

                  <div>
                    <button
                      type="submit"
                      className="bg-purple-800 text-white px-4 py-2 rounded-md"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Form>

          <div className="mt-4">
            <a href="/dashboard" className="text-pink-600">
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
