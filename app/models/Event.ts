import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEvent extends Document {
  title: string;
  date: Date;
  time: string;
  description?: string;
  type: 'meeting' | 'appointment' | 'task' | 'reminder';
  user: Types.ObjectId;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['meeting','appointment','task','reminder'], default: 'meeting' },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
