
import { Link, Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const name = form.get("name")?.toString().trim();
  const username = form.get("username")?.toString().trim();
  const email = form.get("email")?.toString().trim();
  const password = form.get("password")?.toString();
  const confirmPassword = form.get("confirmPassword")?.toString();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  if (!username || !email || !password || !confirmPassword) {
    return json({ error: "All fields are required." }, { status: 400 });
  }
  if (!emailRegex.test(email)) {
    return json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!passwordRegex.test(password)) {
    return json({ error: "Password must be at least 8 characters, start with a capital letter, and contain symbols or punctuation" }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return json({ error: "Passwords do not match" }, { status: 400 });
  }

  // Connect to DB and create user
  try {
    const { connectDB, isDBAvailable, getInMemoryStore } = await import("~/utils/db");
    await connectDB();
    if (isDBAvailable()) {
      const User = (await import("~/models/User")).default;
      // Case-insensitive check for existing username or email
      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existing = await User.findOne({ $or: [ { username: { $regex: `^${escapeRegex(username)}$`, $options: 'i' } }, { email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } } ] });
      if (existing) {
        return json({ error: "Username or email already exists." }, { status: 400 });
      }
      await User.create({ username, email, password });
      return redirect("/login");
    }

    // DB not available — store user in in-memory fallback (dev only)
    const store = getInMemoryStore();
    if (store[username] || Object.values(store).some(u => u.email === email)) {
      return json({ error: "Username or email already exists." }, { status: 400 });
    }
    store[username] = { username, email, password, displayName: name || null, bio: null, avatarUrl: null };
    return redirect("/login");
  } catch (err) {
    return json({ error: "Server error. Please try again." }, { status: 500 });
  }
};

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="absolute top-6 right-6 text-indigo-600 font-semibold tracking-wider">SKYMAX</div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="text-center py-6 bg-gradient-to-r from-purple-600 to-pink-500">
            <h2 className="text-white text-lg font-medium">Create your account</h2>
            <p className="text-purple-100 mt-1 font-semibold text-3xl">Sign Up</p>
          </div>

          <Form method="post" className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700">Name</label>
              <input name="name" className="mt-1 block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700">Username</label>
              <input name="username" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700">Email</label>
              <input name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700">Password</label>
                <input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">Confirm Password</label>
                <input name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300" />
              </div>
            </div>

            {actionData?.error && <p className="text-red-600 text-sm">{actionData.error}</p>}

            <div>
              <button type="submit" className="w-full py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium shadow">Register</button>
            </div>

            <p className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-purple-600 font-semibold">Login</Link></p>
          </Form>
        </div>
      </div>
    </div>
  );
}
