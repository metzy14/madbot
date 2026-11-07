import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Connections from './Connections';
import { API, http } from './api';
import './App.css';

const Home = () => (
  <div className="login-container">
    <h1>Welcome to MadBot</h1>
    <p>Sign in to access your dashboard.</p>
    <div className="buttons">
      <a href={`${API}/auth/discord`} className="btn">
        Login with Discord
      </a>
      <a href={`${API}/auth/twitter`} className="btn">
        Login with X
      </a>
      <a href={`${API}/auth/kick`} className="btn">
        Login with Kick
      </a>
    </div>
  </div>
);

const DashboardGate = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    http
      .get('/auth/status')
      .then((response) => {
        if (cancelled) return;
        setIsAuthenticated(response.data.isAuthenticated);
        setUser(response.data.user || null);
      })
      .catch((error) => {
        console.error('Error checking auth status:', error);
        if (!cancelled) setIsAuthenticated(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="login-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Please Sign In</h1>
        <div className="buttons">
          <a href={`${API}/auth/discord`} className="btn">
            Login with Discord
          </a>
          <a href={`${API}/auth/twitter`} className="btn">
            Login with X
          </a>
          <a href={`${API}/auth/kick`} className="btn">
            Login with Kick
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.username}</h1>
      <p>
        <a href={`${API}/logout`}>Log out</a>
      </p>
      <Dashboard />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Home</Link>
          {' · '}
          <Link to="/dashboard">Dashboard</Link>
          {' · '}
          <Link to="/connections">Connections</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<DashboardGate />} />
          <Route path="/connections" element={<Connections />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
