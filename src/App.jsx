import { useState } from "react";
import "./App.css"; // Import external stylesheet

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNew, setisNew] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    alert(`Logged in as ${email}`);
  }

  if (!isNew) {
    return (
      //login
      <div className="container">
        <div className="card">
          <h1>Chat App</h1>
          <h2><b>Login</b></h2>

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

            <button type="submit">Login</button>
          </form>
          <p>
            New user? <button onClick={()=>setisNew(true)}>Sign up</button>
          </p>
        </div>
      </div>
    );


  } else {
    //signup
    return (
      <div className="container">
        <div className="card">
          <h1>Chat App</h1>
          <h2><b>Sign up</b></h2>
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
            Already a user? <button onClick={()=>setisNew(false)}>Login</button>
          </p>
        </div>
      </div>
    );
  }
}

export default App;
