import { Link, Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { createUserSession } from "~/utils/session.server";
import { connectDB, isDBAvailable } from "~/utils/db";
import User from "~/models/User";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username")?.toString().trim();
  const password = form.get("password")?.toString();
  if (!username || !password) {
    return json({ error: "Username and password required." }, { status: 400 });
  }
  try {
    await connectDB();

    // If the DB isn't configured/available, fail fast with a clear error
    if (!isDBAvailable()) {
      // Use in-memory fallback store for auth in development
      const { getInMemoryStore } = await import("~/utils/db");
      const store = getInMemoryStore();
      // Case-insensitive lookup for development in-memory store — match by username or email
      const usernameLower = username.toLowerCase();
      const existing = Object.values(store).find(u => {
        const un = (u.username || '').toLowerCase();
        const em = (u.email || '').toLowerCase();
        return un === usernameLower || em === usernameLower;
      });
      console.log('[login] Using in-memory store. username:', username, 'found:', !!existing);
      if (!existing || existing.password !== password) {
        console.warn('[login] Invalid credentials for user (in-memory):', username);
        return json({ error: "Invalid username or password." }, { status: 401 });
      }
      return createUserSession(existing.username, "/dashboard");
    }

    // Do a case-insensitive username lookup in MongoDB to avoid accidental 401s from case differences
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const user = await User.findOne({ username: { $regex: `^${escapeRegex(username)}$`, $options: 'i' } }).exec();
    console.log('[login] DB lookup. username:', username, 'found:', !!user);
    if (!user || user.password !== password) {
      console.warn('[login] Invalid credentials for user (db):', username);
      return json({ error: "Invalid username or password." }, { status: 401 });
    }
    // create a session storing the username and redirect to dashboard
    return createUserSession(user.username, "/dashboard");
  } catch (err) {
    // Log the error to the server console for debugging
    console.error('[action] Unexpected error in /login action:', err);
    const message = err && typeof err === 'object' && 'message' in err ? (err as { message?: unknown }).message : 'Server error. Please try again.';
    return json({ error: typeof message === 'string' ? message : 'Server error. Please try again.' }, { status: 500 });
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (actionData?.error) setLoading(false);
  }, [actionData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div className="absolute top-6 right-6 text-indigo-600 font-semibold tracking-wider">SKYMAX</div>

      <Link to="/" className="absolute top-6 left-6 text-indigo-600"><Home /></Link>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="text-center py-6 bg-gradient-to-r from-purple-600 to-pink-500">
            <h2 className="text-white text-lg font-medium">Welcome back</h2>
            <p className="text-purple-100 mt-1 font-semibold text-3xl">Login</p>
          </div>

          <Form method="post" onSubmit={() => setLoading(true)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700">Username</label>
              <input name="username" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700">Password</label>
              <input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300" />
            </div>

            {actionData?.error && <p className="text-red-600 text-sm">{actionData.error}</p>}

            <button type="submit" disabled={loading} aria-busy={loading ? 'true' : 'false'} className="w-full py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium shadow flex items-center justify-center">
              {loading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : null}
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center text-sm text-gray-500">Don&apos;t have an account? <Link to="/signup" className="text-purple-600 font-semibold">Sign Up</Link></p>
          </Form>
        </div>
      </div>
    </div>
  );
}
