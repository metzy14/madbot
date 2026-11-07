import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Connections from './Connections';
import { AUTH_ORIGIN, clearSession, http } from './api';
import './App.css';

const Home = () => {
  const params = new URLSearchParams(window.location.search);
  const failed = params.get('login') === 'failed';
  const [secret, setSecret] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  async function saveSecret() {
    setNote('');
    setError('');
    try {
      await http.post('/setup/discord-secret', { secret });
      setSecret('');
      setNote('Saved. Click Login with Discord again.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save that secret.');
    }
  }

  return (
  <div className="login-container">
    <h1>Welcome to MadBot</h1>
    <p>
      {failed
        ? 'Sign-in stopped at Discord. Paste the Client Secret (not the bot token) below, click Save secret, then Login with Discord.'
        : 'Sign in to access your dashboard.'}
    </p>
    {failed ? (
      <div className="buttons">
        <input
          type="password"
          value={secret}
          placeholder="Discord client secret"
          onChange={(event) => setSecret(event.target.value)}
        />
        <button type="button" className="btn" onClick={saveSecret}>
          Save secret
        </button>
      </div>
    ) : null}
    {note ? <p>{note}</p> : null}
    {error ? <p>{error}</p> : null}
    <div className="buttons">
      <a href={`${AUTH_ORIGIN}/auth/discord`} className="btn">
        Login with Discord
      </a>
      <a href={`${AUTH_ORIGIN}/auth/twitter`} className="btn">
        Login with X
      </a>
      <a href={`${AUTH_ORIGIN}/auth/kick`} className="btn">
        Login with Kick
      </a>
    </div>
  </div>
  );
};

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
          <a href={`${AUTH_ORIGIN}/auth/discord`} className="btn">
            Login with Discord
          </a>
          <a href={`${AUTH_ORIGIN}/auth/twitter`} className="btn">
            Login with X
          </a>
          <a href={`${AUTH_ORIGIN}/auth/kick`} className="btn">
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
        <a
          href={`${AUTH_ORIGIN}/logout`}
          onClick={() => {
            clearSession();
          }}
        >
          Log out
        </a>
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
