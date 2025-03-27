import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const Home = () => (
  <div className="login-container">
    <h1>Welcome to MadBot</h1>
    <p>Sign in to access your dashboard.</p>
    <div className="buttons">
      <a href="https://madbot-backend.onrender.com/auth/discord" className="btn">
        Login with Discord
      </a>
      <a href="https://madbot-backend.onrender.com/auth/twitter" className="btn">
        Login with X
      </a>
      <a href="https://madbot-backend.onrender.com/auth/kick" className="btn">
        Login with Kick
      </a>
    </div>
  </div>
);

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('https://madbot-backend.onrender.com/auth/status', {
          withCredentials: true,
        });
        setIsAuthenticated(response.data.isAuthenticated);
        setUser(response.data.user || null);
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return <div className="login-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Please Sign In</h1>
        <div className="buttons">
          <a href="https://madbot-backend.onrender.com/auth/discord" className="btn">
            Login with Discord
          </a>
          <a href="https://madbot-backend.onrender.com/auth/twitter" className="btn">
            Login with X
          </a>
          <a href="https://madbot-backend.onrender.com/auth/kick" className="btn">
            Login with Kick
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Welcome to MadBot Dashboard, {user?.username}!</h1>
      <p>Here you can manage your bot settings, view stats, and more.</p>
      <a href="https://madbot-backend.onrender.com/logout">
        <button className="logout-btn">Logout</button>
      </a>
      {/* Add dashboard functionality here (e.g., stats, messages, triggers) */}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Home</Link> | <Link to="/dashboard">Dashboard</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <footer>
          <a href="https://github.com/metzy14/madbot-backend" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </footer>
      </div>
    </Router>
  );
}

export default App;