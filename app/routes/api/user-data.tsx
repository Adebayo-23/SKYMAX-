import { json } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { connectDB } from "~/utils/db";
import { getUsername } from "~/utils/session.server";
import User from "~/models/User";
import Task from "~/models/Task";
import Event from "~/models/Event";

export const loader: LoaderFunction = async ({ request }) => {
  await connectDB();
  const username = await getUsername(request);
  if (!username) return json({ error: 'Unauthorized' }, { status: 401 });

  const user = (await User.findOne({ username }).lean()) as IUser | null;
  if (!user) return json({ error: 'User not found' }, { status: 404 });

  // user._id may be an ObjectId or string; use a narrow shape to access it without `any`
  type UserLike = { _id?: unknown };
  const userId = (user as UserLike)._id;
  const tasks = await Task.find(userId ? { user: userId } : {}).lean();
  const events = await Event.find(userId ? { user: userId } : {}).lean();

  // convert dates to ISO strings for loader
  const tasksSafe = tasks.map(t => ({ ...t, dueDate: t.dueDate ? t.dueDate.toISOString() : null }));
  const eventsSafe = events.map(e => ({ ...e, date: e.date ? e.date.toISOString() : null }));

  return json({ user: { username: user.username, email: user.email }, tasks: tasksSafe, events: eventsSafe });
};

export const action: ActionFunction = async ({ request }) => {
  await connectDB();
  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'addTask') {
    const title = form.get('title');
    const dueDate = form.get('dueDate');
      const category = (form.get('category') as string) || 'General';
      const priority = (form.get('priority') as string) || 'medium';

    if (typeof title !== 'string' || !title.trim()) return json({ error: 'Invalid title' }, { status: 400 });

    const username = await getUsername(request);
    const user = await User.findOne({ username });
    if (!user) return json({ error: 'User not found' }, { status: 404 });

    const task = await Task.create({
      title: title.trim(),
      dueDate: dueDate ? new Date(String(dueDate)) : undefined,
      completed: false,
      user: userId,
      description: '',
      category,
      priority,
    });

    return json({ success: true, task });
  }

  if (intent === 'toggleTask') {
    const id = form.get('id');
    if (typeof id !== 'string') return json({ error: 'Invalid id' }, { status: 400 });

    const task = await Task.findById(String(id));
    if (!task) return json({ error: 'Task not found' }, { status: 404 });
    task.completed = !task.completed;
    await task.save();
    return json({ success: true, task });
  }

  if (intent === 'addEvent') {
    const title = form.get('title');
    const date = form.get('date');
    const time = form.get('time');
  const type = (form.get('type') as string) || 'meeting';
    const description = (form.get('description') as string) || '';

    if (typeof title !== 'string' || typeof date !== 'string' || typeof time !== 'string') {
      return json({ error: 'Invalid event data' }, { status: 400 });
    }

    const username = await getUsername(request);
    const user = await User.findOne({ username });
    if (!user) return json({ error: 'User not found' }, { status: 404 });

    const event = await Event.create({
      title: title.trim(),
      date: new Date(date),
      time: time.trim(),
      description: description.trim(),
  type: type,
      user: user._id,
    });

    return json({ success: true, event });
  }

  return json({ error: 'Unknown intent' }, { status: 400 });
};
