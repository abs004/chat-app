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
    