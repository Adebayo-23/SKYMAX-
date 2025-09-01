import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  user: Types.ObjectId;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
