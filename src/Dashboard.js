import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { http } from './api';
import { Banner, useStudio } from './studio';

function format(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function Dashboard({ user }) {
  const [stats, setStats] = useState({ followers: 0, isLive: false, viewers: null, title: null, channel: '' });
  const [alertNote, setAlertNote] = useState('');
  const [alertError, setAlertError] = useState('');
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(0);
  const { studio, save, note, error } = useStudio();

  useEffect(() => {
    http.get('/stats').then((response) => setStats((current) => ({ ...current, ...response.data }))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setLeft((current) => {
        if (current > 1) return current - 1;
        setIndex((segmentIndex) => segmentIndex + 1);
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running || !studio) return;
    const segment = studio.segments[index];
    if (!segment) {
      setRunning(false);
      return;
    }
    if (left === 0) setLeft(segment.minutes * 60);
  }, [running, index, studio, left]);

  async function sendTest() {
    setBusy(true);
    setAlertNote('');
    setAlertError('');
    try {
      const response = await http.post('/alerts/test');
      setAlertNote(response.data.detail || 'Test alert sent.');
    } catch (err) {
      setAlertError(err.response?.data?.error || 'Test alert failed.');
    } finally {
      setBusy(false);
    }
  }

  const followers = stats.followers || 0;
  const goal = studio?.goalFollowers || 1;
  const followerPct = Math.min(100, Math.round((followers / goal) * 100));
  const viewers = stats.viewers || 0;
  const viewerGoal = studio?.goalViewers || 1;
  const viewerPct = Math.min(100, Math.round((viewers / viewerGoal) * 100));
  const segment = studio?.segments?.[index];

  return (
    <div>
      <div className="dash-head">
        <div>
          <p className="kicker">Live desk</p>
          <h1>{user?.username || 'MadBot'}</h1>
          <p className="sub">Alerts, the show clock, and the goals for this channel.</p>
        </div>
        <button type="button" className="primary" disabled={busy} onClick={sendTest}>{busy ? 'Sending…' : 'Send test alert'}</button>
      </div>
      <Banner note={alertNote || note} error={alertError || error} />

      <section className="stats">
        <article className="stat live">
          <div className="label"><span className={stats.isLive ? 'dot on' : 'dot'} />{stats.isLive ? 'Live' : 'Offline'}</div>
          <b>{stats.title || (stats.isLive ? 'Live now' : 'Offline')}</b>
          <p className="sub">{stats.channel ? `kick.com/${stats.channel}` : <Link to="/connections">Add your Kick channel</Link>}</p>
        </article>
        <article className="stat"><div className="label">Viewers</div><b>{stats.viewers ?? '—'}</b></article>
        <article className="stat"><div className="label">Followers</div><b>{followers}</b></article>
        <article className="stat"><div className="label">On air</div><b>{running && segment ? format(left) : '—'}</b></article>
      </section>

      <div className="layout">
        <section className="panel">
          <h2>Goals</h2>
          <p className="help">Chat can ask !goal. The bars use the live Kick numbers.</p>
          <div className="field">
            <label>Follower goal</label>
            <input type="number" value={studio?.goalFollowers || 0} onChange={(event) => studio && save({ ...studio, goalFollowers: Number(event.target.value) })} />
            <div className="bar"><span style={{ width: `${followerPct}%` }} /></div>
            <p className="token">{followerPct}% of {goal}</p>
          </div>
          <div className="field">
            <label>Viewer goal</label>
            <input type="number" value={studio?.goalViewers || 0} onChange={(event) => studio && save({ ...studio, goalViewers: Number(event.target.value) })} />
            <div className="bar"><span style={{ width: `${viewerPct}%` }} /></div>
            <p className="token">{viewerPct}% of {viewerGoal}</p>
          </div>
          <div className="module-links">
            <Link to="/alerts">Edit alert copy</Link>
            <Link to="/commands">Chat commands</Link>
            <Link to="/raids">Raid book</Link>
          </div>
        </section>

        <section className="panel">
          <h2>Show clock</h2>
          <p className="help">{segment ? `Now: ${segment.title}` : 'Add segments in the show plan, then start the clock.'}</p>
          <p className="clock">{running && segment ? format(left) : 'Ready'}</p>
          <div className="row">
            <button type="button" className="primary" onClick={() => { setIndex(0); setLeft(0); setRunning(true); }}>Start show</button>
            <button type="button" className="ghost" onClick={() => setRunning(false)}>Pause</button>
            <Link className="ghost" to="/planner">Edit plan</Link>
          </div>
          <h2 style={{ marginTop: 22 }}>Pre-show</h2>
          {(studio?.checklist || []).map((item) => (
            <label className="check" key={item.id}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => studio && save({
                  ...studio,
                  checklist: studio.checklist.map((row) => row.id === item.id ? { ...row, done: !row.done } : row),
                })}
              />
              <span>{item.text}</span>
            </label>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
