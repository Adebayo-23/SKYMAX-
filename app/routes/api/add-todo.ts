import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { connectDB } from "~/utils/db";
import Todo from "~/models/Todo";

export const action: ActionFunction = async ({ request }) => {
  await connectDB();

  const form = await request.formData();
  const title = form.get("title");

  if (!title || typeof title !== "string") {
    return json({ error: "Invalid title" }, { status: 400 });
  }

  const newTodo = await Todo.create({ title });

  return json({ success: true, todo: newTodo });
};
