import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISchedule extends Document {
  name: string;
  tasks: Types.ObjectId[];
  user: Types.ObjectId;
  createdAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>({
  name: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Schedule || mongoose.model<ISchedule>("Schedule", ScheduleSchema);
