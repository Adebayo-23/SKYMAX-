import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { connectDB } from "~/utils/db";
import Todo from "~/models/Todo";

export const action: ActionFunction = async ({ request }) => {
  await connectDB();
  const form = await request.formData();
  const id = form.get("id");

  if (typeof id !== "string") {
    return json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  await Todo.findByIdAndUpdate(id, { completed: true });
  return json({ success: true });
};
