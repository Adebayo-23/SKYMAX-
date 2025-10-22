
import { Link, Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const name = form.get("name")?.toString().trim();
  const username = form.get("username")?.toString().trim();
  const email = form.get("email")?.toString().trim();
  const password = form.get("password")?.toString();
  const confirmPassword = form.get("confirmPassword")?.toString();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  if (!username || !email || !password || !confirmPassword) {
    return json({ error: "All fields are required." }, { status: 400 });
  }
  if (!emailRegex.test(email)) {
    return json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!passwordRegex.test(password)) {
    return json({ error: "Password must be at least 8 characters, start with a capital letter, and contain symbols or punctuation" }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return json({ error: "Passwords do not match" }, { status: 400 });
  }

  // Connect to DB and create user
  try {
    const { connectDB, isDBAvailable, getInMemoryStore } = await import("~/utils/db");
    await connectDB();
    if (isDBAvailable()) {
      const User = (await import("~/models/User")).default;
      const existing = await User.findOne({ $or: [{ username }, { email }] });
      if (existing) {
        return json({ error: "Username or email already exists." }, { status: 400 });
      }
      await User.create({ username, email, password });
      return redirect("/login");
    }

    // DB not available — store user in in-memory fallback (dev only)
    const store = getInMemoryStore();
    if (store[username] || Object.values(store).some(u => u.email === email)) {
      return json({ error: "Username or email already exists." }, { status: 400 });
    }
    store[username] = { username, email, password, displayName: name || null, bio: null, avatarUrl: null };
    return redirect("/login");
  } catch (err) {
    return json({ error: "Server error. Please try again." }, { status: 500 });
  }
};

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  return (
    <div
      className="container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
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
      <h1
        style={{
          color: "#fff",
          backgroundColor: "#6c5ce7",
          padding: "10px 20px",
          borderRadius: "10px",
          border: "2px solid #D8BFD8",
          textAlign: "center",
          fontSize: "24px",
        }}
      >
        Sign Up
      </h1>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          border: "1px solid #D8BFD8",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <label style={{ marginBottom: "10px", color: "#6c5ce7" }}>
          Name:
          <input
            type="text"
            name="name"
            style={{
              display: "block",
              marginTop: "5px",
              padding: "10px",
              border: "1px solid #D8BFD8",
              borderRadius: "5px",
            }}
          />
        </label>

        <label style={{ marginBottom: "10px", color: "#6c5ce7" }}>
          Username:
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              display: "block",
              marginTop: "5px",
              padding: "10px",
              border: "1px solid #D8BFD8",
              borderRadius: "5px",
            }}
          />
        </label>

        <label style={{ marginBottom: "10px", color: "#6c5ce7" }}>
          Email:
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              display: "block",
              marginTop: "5px",
              padding: "10px",
              border: "1px solid #D8BFD8",
              borderRadius: "5px",
            }}
          />
        </label>

        <label style={{ marginBottom: "10px", color: "#6c5ce7" }}>
          Password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              display: "block",
              marginTop: "5px",
              padding: "10px",
              border: "1px solid #D8BFD8",
              borderRadius: "5px",
            }}
          />
        </label>

        <label style={{ marginBottom: "10px", color: "#6c5ce7" }}>
          Confirm Password:
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              display: "block",
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
          style={{
            backgroundColor: "#6c5ce7",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Register
        </button>

        <p style={{ marginTop: "0px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#6c5ce7" }}>
            Login
          </Link>
        </p>
      </Form>
    </div>
  );
}
