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
    // Provide a clearer message for common SRV/DNS failures (e.g. ESERVFAIL when using Atlas SRV)
    console.error("❌ MongoDB connection error:", error);
    try {
      const hostMatch = String(MONGODB_URI).match(/@([^/]+)/);
      if (hostMatch && hostMatch[1]) {
        console.error("MongoDB host detected:", hostMatch[1]);
      }
    } catch (e) {
      // ignore
    }
    if (error && typeof error === 'object' && 'code' in (error as any) && (error as any).code === 'ESERVFAIL') {
      console.error("DNS SRV lookup failed (ESERVFAIL). If you're using a MongoDB Atlas SRV connection string (mongodb+srv://), ensure your machine can resolve SRV DNS records and that the hostname is correct. As a workaround for local development, set MONGODB_URI to a standard connection string (mongodb://host:port/db) or run without a DB to use the in-memory fallback.");
    }
    // Do not throw here — fallback to in-memory mode for local dev
  }
}
