import React from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUsername } from "~/utils/session.server";
import ScheduleDashboard from "~/components/ScheduleDashboard";
import { connectDB } from "~/utils/db";
import Task from "~/models/Task";
import Event from "~/models/Event";
import User from "~/models/User";

export const loader: LoaderFunction = async ({ request }) => {
  const username = await getUsername(request);
  if (!username) return redirect("/login");

  await connectDB();
  const user = await User.findOne({ username }).lean();
  const tasks = await Task.find({ user: user?._id }).lean();
  const events = await Event.find({ user: user?._id }).lean();

  const tasksSafe = tasks.map(t => ({ ...t, dueDate: t.dueDate ? t.dueDate.toISOString() : null }));
  const eventsSafe = events.map(e => ({ ...e, date: e.date ? e.date.toISOString() : null }));

  return json({ username, tasks: tasksSafe, events: eventsSafe, profile: { displayName: user?.displayName || null, bio: user?.bio || null, avatarUrl: user?.avatarUrl || null } });
};

export default function Dashboard() {
  const data = useLoaderData<{ username: string; tasks: any[]; events: any[]; profile: { displayName?: string | null; bio?: string | null; avatarUrl?: string | null } }>();
  // no fetcher needed in this wrapper route

  // no direct handlers here; UI components manage their own interactions via API routes

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>
        Welcome, <strong>{data.username}</strong>!
      </p>
      <Link to="/">Home</Link>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/profile"><button style={{ padding: '8px 12px', borderRadius: 6, background: '#4B0082', color: '#fff', border: 'none' }}>Edit Profile</button></Link>
        </div>

        {/* Reuse the existing UI components */}
        <ScheduleDashboard tasks={data.tasks.map(t => ({ id: String(t._id), title: t.title, completed: t.completed, priority: (t.priority || 'medium'), dueDate: t.dueDate ? new Date(t.dueDate) : new Date(), category: t.category || 'General' }))} />
      </div>
    </div>
  );
}
