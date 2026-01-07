import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Date;
  // Subscription fields
  isSubscribed?: boolean;
  subscriptionId?: string | null;
  trialExpiresAt?: Date | null;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  bio: { type: String },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  // Subscription metadata
  isSubscribed: { type: Boolean, default: false },
  subscriptionId: { type: String, default: null },
  trialExpiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
