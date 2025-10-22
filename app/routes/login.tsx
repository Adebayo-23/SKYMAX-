import { Link, Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { createUserSession } from "~/utils/session.server";
import { connectDB, isDBAvailable } from "~/utils/db";
import User from "~/models/User";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username")?.toString().trim();
  const password = form.get("password")?.toString();
  if (!username || !password) {
    return json({ error: "Username and password required." }, { status: 400 });
  }
  try {
    await connectDB();

    // If the DB isn't configured/available, fail fast with a clear error
    if (!isDBAvailable()) {
      // Use in-memory fallback store for auth in development
      const { getInMemoryStore } = await import("~/utils/db");
      const store = getInMemoryStore();
      const existing = store[username];
      if (!existing || existing.password !== password) {
        return json({ error: "Invalid username or password." }, { status: 401 });
      }
      return createUserSession(existing.username, "/dashboard");
    }

    const user = await User.findOne({ username }).exec();
    if (!user || user.password !== password) {
      return json({ error: "Invalid username or password." }, { status: 401 });
    }
    // create a session storing the username and redirect to dashboard
    return createUserSession(user.username, "/dashboard");
  } catch (err) {
    // Log the error to the server console for debugging
    console.error('[action] Unexpected error in /login action:', err);
    const message = err && typeof err === 'object' && 'message' in err ? (err as { message?: unknown }).message : 'Server error. Please try again.';
    return json({ error: typeof message === 'string' ? message : 'Server error. Please try again.' }, { status: 500 });
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (actionData?.error) setLoading(false);
  }, [actionData]);

  return (
    <div
      className="container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        position: "relative",
      }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {/* SkyMax Top Right */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "24px",
          fontWeight: "bold",
          color: "#6c5ce7",
        }}
      >
        SKYMAX
      </div>

      {/* Home Icon */}
      <Link to="/" style={{ position: "absolute", top: "10px", left: "10px" }}>
        <Home color="#6c5ce7" size={28} />
      </Link>

      {/* Login Title */}
      <h1
        style={{
          color: "#fff",
          backgroundColor: "#6c5ce7",
          padding: "10px 20px",
          borderRadius: "10px",
          border: "2px solid #D8BFD8",
          textAlign: "center",
          fontSize: "30px",
        }}
      >
        Login
      </h1>

      {/* Login Form */}
      <Form
        method="post"
        onSubmit={() => setLoading(true)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          border: "1px solid #D8BFD8",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
          width: "300px",
        }}
      >
        <label style={{ marginBottom: "10px", color: "#6c5ce7", width: "100%" }}>
          Username:
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "5px",
              padding: "10px",
              border: "1px solid #D8BFD8",
              borderRadius: "5px",
            }}
          />
        </label>

        <label style={{ marginBottom: "10px", color: "#6c5ce7", width: "100%" }}>
          Password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "5px",
              padding: "10px",
              border: "1px solid #D8BFD8",
              borderRadius: "5px",
            }}
          />
        </label>

        {actionData?.error && (
          <p style={{ color: "red", marginBottom: "10px" }}>{actionData.error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading ? 'true' : 'false'}
          style={{
            padding: "10px",
            backgroundColor: "#6c5ce7",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            width: "100%",
            marginBottom: "10px",
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.8 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {loading ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', marginRight: 8, display: 'inline-block', animation: 'spin 1s linear infinite' }} />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>

        {/* Sign Up Link just below button */}
        <Link to="/signup" style={{ color: "#6c5ce7", fontSize: "14px" }}>
          Don&apos;t have an account? Sign Up
        </Link>
      </Form>
    </div>
  );
}
