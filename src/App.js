import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import Alerts from './Alerts';
import Commands from './Commands';
import Moderation from './Moderation';
import Rewards from './Rewards';
import Highlights from './Highlights';
import Vod2Content from './Vod2Content';
import Planner from './Planner';
import Raids from './Raids';
import Pricing from './Pricing';
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
    <section className="hero-login">
      <div>
        <p className="kicker">Kick · Discord · X</p>
        <h1>Your stream, posted the moment you go live.</h1>
        <p className="lede">
          MadBot is the operating desk for a Kick channel. It posts go-live and raid alerts, runs chat commands, and keeps the show plan in one place.
        </p>
      </div>
      <div className="login-card">
        <p className="kicker">Sign in</p>
        <p className="lede" style={{ marginBottom: 16 }}>
          {failed
            ? 'Sign-in stopped at Discord. Paste the Client Secret (not the bot token), save it, then try Discord again.'
            : 'Use the account that should own this bot.'}
        </p>
        {failed ? (
          <div className="stack" style={{ marginBottom: 12 }}>
            <input
              type="password"
              value={secret}
              placeholder="Discord client secret"
              onChange={(event) => setSecret(event.target.value)}
            />
            <button type="button" className="primary" onClick={saveSecret}>Save secret</button>
          </div>
        ) : null}
        {note ? <p className="note">{note}</p> : null}
        {error ? <p className="err">{error}</p> : null}
        <div className="stack">
          <a href={`${AUTH_ORIGIN}/auth/discord`} className="btn discord">Login with Discord</a>
          <a href={`${AUTH_ORIGIN}/auth/twitter`} className="btn x">Login with X</a>
          <a href={`${AUTH_ORIGIN}/auth/kick`} className="btn kick">Login with Kick</a>
        </div>
      </div>
    </section>
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
      .catch(() => {
        if (!cancelled) setIsAuthenticated(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="sub">Loading the control room…</p>;

  if (!isAuthenticated) {
    return (
      <div className="login-card" style={{ maxWidth: 460 }}>
        <p className="kicker">Sign in required</p>
        <h2>The dashboard is locked until you sign in.</h2>
        <div className="stack">
          <a href={`${AUTH_ORIGIN}/auth/discord`} className="btn discord">Login with Discord</a>
          <a href={`${AUTH_ORIGIN}/auth/twitter`} className="btn x">Login with X</a>
          <a href={`${AUTH_ORIGIN}/auth/kick`} className="btn kick">Login with Kick</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="sub" style={{ textAlign: 'right' }}>
        <a className="logout" href={`${AUTH_ORIGIN}/logout`} onClick={() => clearSession()}>Log out</a>
      </p>
      <Dashboard user={user} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="shell">
        <header className="topbar">
          <Link to="/" className="mark">MAD<span>BOT</span></Link>
          <nav>
            <NavLink to="/dashboard">Desk</NavLink>
            <NavLink to="/alerts">Alerts</NavLink>
            <NavLink to="/commands">Commands</NavLink>
            <NavLink to="/moderation">Mod</NavLink>
            <NavLink to="/rewards">Rewards</NavLink>
            <NavLink to="/highlights">Clips</NavLink>
            <NavLink to="/vod">VOD</NavLink>
            <NavLink to="/planner">Plan</NavLink>
            <NavLink to="/raids">Raids</NavLink>
            <NavLink to="/connections">Connections</NavLink>
            <NavLink to="/pricing">Pro</NavLink>
          </nav>
        </header>
        <main className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardGate />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/commands" element={<Commands />} />
            <Route path="/moderation" element={<Moderation />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/highlights" element={<Highlights />} />
            <Route path="/vod" element={<Vod2Content />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/raids" element={<Raids />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
