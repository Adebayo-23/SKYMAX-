import { Link, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Home } from "lucide-react"; // Home icon from lucide-react

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 🔐 Include the new user
  const registeredUsers = [
    { username: "johnDoe", password: "Pass@123" },
    { username: "admin", password: "Admin@456" },
    { username: "skyuser", password: "Sky@789" },
    { username: "NAME", password: "Wizsean222!" }, // 🔥 Your user added
  ];

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validUser = registeredUsers.find(
      (user) => user.username === username && user.password === password
    );

    if (validUser) {
      setError(null);
      console.log("Login successful!");

      // Simulate token store
      localStorage.setItem("authToken", "fakeTokenFor_" + validUser.username);
      localStorage.setItem("user", JSON.stringify(validUser));

      navigate("/dashboard");
    } else {
      setError("Invalid username or password.");
    }
  };

  // OPTIONAL: Automatically login with preset credentials
  useEffect(() => {
    setUsername("NAME");
    setPassword("Wizsean222!");
  }, []);

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
      <form
        onSubmit={handleLogin}
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

        {error && (
          <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
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
      </form>
    </div>
  );
}
