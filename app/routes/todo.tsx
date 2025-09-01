// app/routes/todo.tsx
import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { connectDB } from "~/utils/db";
import Todo from "~/models/Todo";

export const loader: LoaderFunction = async () => {
  await connectDB();
  const tasks = await Todo.find({}).lean();
  return json(tasks);
};

// Optional: combine POST actions for add, delete, complete (recommended for Remix)
export const action: ActionFunction = async ({ request }) => {
  await connectDB();
  const form = await request.formData();
  const actionType = form.get("_action");

  if (actionType === "add") {
    const title = form.get("title")?.toString();
    if (title) await Todo.create({ title });
  }

  if (actionType === "delete") {
    const id = form.get("id")?.toString();
    if (id) await Todo.findByIdAndDelete(id);
  }

  if (actionType === "complete") {
    const id = form.get("id")?.toString();
    if (id) await Todo.findByIdAndUpdate(id, { completed: true });
  }

  return redirect("/todo");
};

export default function TodoPage() {
  const tasks = useLoaderData<typeof loader>();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="user-info">
          <img
            src="https://i.pravatar.cc/100"
            alt="User avatar"
            className="user-avatar"
          />
          <h2>Hello! Skymax User</h2>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="task-card mb-6">
        <h3 className="section-title mb-2">➕ Add New Task</h3>
        <Form method="post" className="flex gap-3">
          <input
            type="text"
            name="title"
            required
            placeholder="Enter task..."
            className="flex-1 px-3 py-2 rounded border border-gray-300 text-black"
          />
          <button
            type="submit"
            name="_action"
            value="add"
            className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
          >
            Add Task
          </button>
        </Form>
      </div>

      {/* Task List */}
      <div className="task-card">
        <h3 className="section-title mb-2">📋 All Tasks</h3>
        {tasks.length === 0 ? (
          <p className="section-empty">No tasks available.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task: any) => (
              <li
                key={task._id}
                className="flex justify-between items-center bg-white text-black px-4 py-2 rounded shadow-sm"
              >
                <span>{task.title}</span>
                <div className="flex gap-2">
                  {!task.completed && (
                    <Form method="post">
                      <input type="hidden" name="id" value={task._id} />
                      <button
                        type="submit"
                        name="_action"
                        value="complete"
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Mark as Done
                      </button>
                    </Form>
                  )}
                  <Form method="post">
                    <input type="hidden" name="id" value={task._id} />
                    <button
                      type="submit"
                      name="_action"
                      value="delete"
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </Form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
