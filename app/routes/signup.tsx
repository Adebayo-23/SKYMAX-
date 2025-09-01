import { Link, useNavigate } from "@remix-run/react";
import { useState } from "react";

export default function SignUp() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const existingUsernames = ["johnDoe", "admin", "skyuser", "bayo123"];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$/;

    if (existingUsernames.includes(username.trim())) {
      setError("Username already taken. Please choose another.");
    } else if (!emailRegex.test(email)) {
      setError("Invalid email address");
    } else if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters, start with a capital letter, and contain symbols or punctuation");
    } else if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      setError(null);

      // ✅ Simulate storing user in database
      console.log("User registered:", { username, email });

      // ✅ Simulate login and storing token
      localStorage.setItem("authToken", "mockToken_123456"); // Replace with real token in a real app
      localStorage.setItem("user", JSON.stringify({ username, email }));

      // ✅ Redirect to dashboard
      navigate("/dashboard");
    }
  };

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
      <form
        onSubmit={handleSubmit}
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

        {error && (
          <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
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
      </form>
    </div>
  );
}
