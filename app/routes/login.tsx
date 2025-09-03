
import { Link, useNavigate, Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import { Home } from "lucide-react";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username")?.toString().trim();
  const password = form.get("password")?.toString();
  if (!username || !password) {
    return json({ error: "Username and password required." }, { status: 400 });
  }
  try {
    const { connectDB } = await import("~/utils/db");
    await connectDB();
    const User = (await import("~/models/User")).default;
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return json({ error: "Invalid username or password." }, { status: 401 });
    }
    // Optionally, set session/cookie here
    return redirect("/dashboard");
  } catch (err) {
    return json({ error: "Server error. Please try again." }, { status: 500 });
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
          style={{
            padding: "10px",
            backgroundColor: "#6c5ce7",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            width: "100%",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        {/* Sign Up Link just below button */}
        <Link to="/signup" style={{ color: "#6c5ce7", fontSize: "14px" }}>
          Don't have an account? Sign Up
        </Link>
      </Form>
    </div>
  );
}
