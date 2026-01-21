// React import intentionally omitted (not used directly in this file)
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUsername, getSession, commitSession } from "~/utils/session.server";
import ScheduleDashboard from "~/components/ScheduleDashboard";
import { connectDB, isDBAvailable, getInMemoryStore } from "~/utils/db";
import Task from "~/models/Task";
import Event from "~/models/Event";
import User, { IUser } from "~/models/User";

type DashboardLoaderData = {
  username: string;
  tasks: unknown[];
  events: unknown[];
  profile: { displayName?: string | null; bio?: string | null; avatarUrl?: string | null };
};

export const loader: LoaderFunction = async ({ request }) => {
  const username = await getUsername(request);
  if (!username) return redirect("/login");

  await connectDB();

  let user: IUser | null = null;
  let tasks: any[] = [];
  let events: any[] = [];

  if (!isDBAvailable()) {
    // Use in-memory fallback for local development when no MongoDB URI is configured
    const store = getInMemoryStore();
    const found = Object.values(store).find(u => u.username === username) || null;
    if (found) {
      user = { ...(found as any), _id: `inmemory-${found.username}`, createdAt: new Date() } as unknown as IUser;
    }
    tasks = [];
    events = [];
  } else {
    user = (await User.findOne({ username }).lean()) as IUser | null;
    const userId = user?._id;
    tasks = await Task.find({ user: userId }).lean();
    events = await Event.find({ user: userId }).lean();
  }

  const tasksSafe = tasks.map(t => ({ ...t, dueDate: t.dueDate ? t.dueDate.toISOString() : null }));
  const eventsSafe = events.map(e => ({ ...e, date: e.date ? e.date.toISOString() : null }));

  // Read any flash message and clear it
  const session = await getSession(request.headers.get('cookie'));
  const profileMessage = session.get('profileMessage') as string | undefined | null;
  const headers: Record<string,string> = {};
  if (profileMessage) {
    headers['Set-Cookie'] = await commitSession(session);
  }

  return json({ username, tasks: tasksSafe, events: eventsSafe, profile: { displayName: user?.displayName || null, bio: user?.bio || null, avatarUrl: user?.avatarUrl || null }, flash: { profileMessage: profileMessage || null } }, { headers });
};

export default function Dashboard() {
  const data = useLoaderData<DashboardLoaderData & { flash?: { profileMessage?: string | null } }>();
  // no fetcher needed in this wrapper route

  // no direct handlers here; UI components manage their own interactions via API routes

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {data.profile.avatarUrl ? (
          <img src={data.profile.avatarUrl} alt="Profile" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No</div>
        )}
        <p style={{ margin: 0 }}>
          Welcome, <strong>{data.profile.displayName || data.username}</strong>!
        </p>
      </div>
      <Link to="/">Home</Link>

      {data.flash?.profileMessage && (
        <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: '#e6ffed', color: '#0b6b2a' }}>{data.flash.profileMessage}</div>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/profile"><button style={{ padding: '8px 12px', borderRadius: 6, background: '#4B0082', color: '#fff', border: 'none' }}>Edit Profile</button></Link>
        </div>

        {/* Reuse the existing UI components */}
        {/* cast each item to a known shape for TS */}
        <ScheduleDashboard tasks={data.tasks.map((t) => {
          const it = t as unknown as { _id: unknown; title: string; completed: boolean; priority?: string; dueDate?: string | null; category?: string };
          return { id: String(it._id), title: it.title, completed: it.completed, priority: (it.priority || 'medium') as 'low' | 'medium' | 'high', dueDate: it.dueDate || null, category: it.category || 'General' };
        })} />
      </div>
    </div>
  );
}
