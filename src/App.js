import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState(null);
  const [command, setCommand] = useState('');
  const [commandResponse, setCommandResponse] = useState('');

  useEffect(() => {
    // Check if user is logged in by calling /api/stats
    fetch('https://madbot-backend.onrender.com/api/stats', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Not logged in');
      })
      .then((data) => {
        setStats(data);
        setIsLoggedIn(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  const handleLogout = () => {
    fetch('https://madbot-backend.onrender.com/logout', {
      credentials: 'include',
    }).then(() => {
      setIsLoggedIn(false);
      setStats(null);
    });
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    fetch('https://madbot-backend.onrender.com/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setCommandResponse(data.response);
        setCommand('');
      });
  };

  if (!isLoggedIn) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>MadBot - Sync Your Kick Stream</h1>
          <p>
            Boost your Kick streaming with MadBot. Auto-post updates, clips, and raid shout-outs via chatbot to Discord and X. Sign in now!
          </p>
          <div className="buttons">
            <a href="https://madbot-backend.onrender.com/login/x" className="btn">
              Sign in with X
            </a>
            <a href="https://madbot-backend.onrender.com/login/discord" className="btn">
              Sign in with Discord
            </a>
            <a href="https://madbot-backend.onrender.com/login/kick" className="btn">
              Sign in with Kick
            </a>
          </div>
          <footer>
            <a href="https://madbot-frontend.vercel.app">Learn More</a>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="dashboard">
        <h1>MadBot Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
        <div className="stats">
          <h2>Stream Stats</h2>
          <p>Username: {stats?.username}</p>
          <p>Status: {stats?.live_now ? 'Live' : 'Offline'}</p>
          <p>Followers: {stats?.folks}</p>
          <p>Viewers: {stats?.watchers}</p>
          <p>Uptime: {stats?.uptime}</p>
        </div>
        <div className="commands">
          <h2>Commands</h2>
          <form onSubmit={handleCommandSubmit}>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter command (e.g., !pulse)"
            />
            <button type="submit">Send Command</button>
          </form>
          {commandResponse && <p>{commandResponse}</p>}
        </div>
        <div className="chat-log">
          <h2>Chat Log</h2>
          <ul>
            {stats?.chat_log?.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;