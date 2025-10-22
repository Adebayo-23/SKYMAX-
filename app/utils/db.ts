import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// In-memory fallback store used when no DB is configured (development only)
type InMemoryUser = { username: string; email?: string | null; password?: string | null; displayName?: string | null; bio?: string | null; avatarUrl?: string | null };
const inMemoryStore: Record<string, InMemoryUser> = {};

let dbAvailable = false;

export function isDBAvailable() {
  return dbAvailable;
}

export function getInMemoryStore() {
  return inMemoryStore;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI not found — running in in-memory fallback mode (dev only)");
    dbAvailable = false;
    return;
  }

  if (mongoose.connection.readyState >= 1) {
    dbAvailable = true;
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "SKYMAX",
    });
    dbAvailable = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    dbAvailable = false;
    console.error("❌ MongoDB connection error:", error);
    // Do not throw here — fallback to in-memory mode for local dev
  }
}
