import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

async function handleSubmit(event) {
  event.preventDefault();

  try {
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Account created successfully!");
    navigate("/login");

  } catch (error) {
    console.error("Signup error:", error);
    alert("Something went wrong");
  }
}

  return (
    <div className="container">
      <div className="card">
        <h1>Chat App</h1>
        <h2>
          <b>Sign up</b>
        </h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="fade-in">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Create account</button>
        </form>
        <p>
          Already a user?{" "}
          <button type="button" onClick={() => navigate("/login")}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
