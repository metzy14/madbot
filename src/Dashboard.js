import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { http } from './api';

const MESSAGE_FIELDS = [
  {
    id: 'streamStartMessage',
    label: 'Go-live',
    hint: 'Posted to Discord and X when the stream starts. Use {link}.',
    placeholder: 'Stream is live! Join now at {link}',
  },
  {
    id: 'followerMilestoneMessage',
    label: 'Follower milestone',
    hint: 'Every 100 followers. Use {milestone} and {username}.',
    placeholder: 'We hit {milestone} followers! Thanks, {username}!',
  },
  {
    id: 'thankYouMessage',
    label: 'Thank you',
    hint: 'Support shout-out. Use {username}.',
    placeholder: 'Thanks for the support, {username}!',
  },
  {
    id: 'hostShoutoutMessage',
    label: 'Raid shout-out',
    hint: 'Said in Kick chat. Use {host}.',
    placeholder: 'Big shoutout to {host} for hosting!',
  },
  {
    id: 'hostThankYouMessage',
    label: 'Raid thank-you',
    hint: 'Posted to X. Use {host} and {link}.',
    placeholder: 'Thanks to {host} for the host! Check them out at {link}',
  },
];

const EMPTY_MESSAGES = Object.fromEntries(MESSAGE_FIELDS.map((field) => [field.id, '']));

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    followers: 0,
    isLive: false,
    viewers: null,
    title: null,
    channel: '',
  });
  const [messages, setMessages] = useState(EMPTY_MESSAGES);
  const [triggers, setTriggers] = useState([]);
  const [draft, setDraft] = useState({ type: 'chat', condition: '', message: '' });
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    let cancelled = false;
    http.get('/stats').then((response) => {
      if (!cancelled) setStats((current) => ({ ...current, ...response.data }));
    }).catch(() => {
      if (!cancelled) setError('Live stats did not load. Sign in again if this stays empty.');
    });
    http.get('/messages').then((response) => {
      if (!cancelled && response.data) setMessages((current) => ({ ...current, ...response.data }));
    }).catch(() => {});
    http.get('/triggers').then((response) => {
      if (!cancelled) setTriggers(response.data || []);
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveMessages() {
    setBusy('messages');
    setNote('');
    setError('');
    try {
      await http.post('/messages', messages);
      setNote('Alert messages saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save messages.');
    } finally {
      setBusy('');
    }
  }

  async function addTrigger() {
    if (!draft.condition.trim() || !draft.message.trim()) {
      setError('A trigger needs a command and a message.');
      return;
    }
    setBusy('trigger');
    setNote('');
    setError('');
    try {
      await http.post('/triggers', draft);
      setDraft({ type: 'chat', condition: '', message: '' });
      const response = await http.get('/triggers');
      setTriggers(response.data || []);
      setNote('Trigger added. Chat commands answer in Kick chat. Timers fire after that many minutes.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add the trigger.');
    } finally {
      setBusy('');
    }
  }

  async function sendTest() {
    setBusy('test');
    setNote('');
    setError('');
    try {
      const response = await http.post('/alerts/test');
      setNote(response.data.detail || 'Test alert sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Test alert failed.');
    } finally {
      setBusy('');
    }
  }

  const channel = stats.channel || '';
  const title = stats.title || (stats.isLive ? 'Live now' : 'Offline');

  return (
    <div>
      <div className="dash-head">
        <div>
          <p className="kicker">Control room</p>
          <h1>{user?.username ? user.username : 'MadBot'}</h1>
          <p className="sub">Go-live posts, raid shout-outs, and chat commands for your Kick stream.</p>
        </div>
        <button type="button" className="primary" disabled={busy === 'test'} onClick={sendTest}>
          {busy === 'test' ? 'Sending…' : 'Send test alert'}
        </button>
      </div>

      {note ? <p className="banner">{note}</p> : null}
      {error ? <p className="banner bad">{error}</p> : null}

      <section className="stats">
        <article className="stat live">
          <div className="label"><span className={stats.isLive ? 'dot on' : 'dot'} />{stats.isLive ? 'Live' : 'Offline'}</div>
          <b>{title}</b>
          <p className="sub">{channel ? `kick.com/${channel}` : 'No Kick channel saved yet.'} {!channel ? <Link to="/connections">Add it</Link> : null}</p>
        </article>
        <article className="stat">
          <div className="label">Viewers</div>
          <b>{stats.viewers ?? '—'}</b>
        </article>
        <article className="stat">
          <div className="label">Followers</div>
          <b>{stats.followers || 0}</b>
        </article>
        <article className="stat">
          <div className="label">Triggers</div>
          <b>{triggers.length}</b>
        </article>
      </section>

      <div className="layout">
        <section className="panel">
          <h2>Alert messages</h2>
          <p className="help">These are the lines MadBot posts when you go live, hit a follower milestone, or get raided.</p>
          {MESSAGE_FIELDS.map((field) => (
            <div className="field" key={field.id}>
              <label htmlFor={field.id}>{field.label}</label>
              <p className="token">{field.hint}</p>
              <input
                id={field.id}
                value={messages[field.id] || ''}
                placeholder={field.placeholder}
                onChange={(event) => setMessages((current) => ({ ...current, [field.id]: event.target.value }))}
              />
            </div>
          ))}
          <button type="button" className="primary" disabled={busy === 'messages'} onClick={saveMessages}>
            {busy === 'messages' ? 'Saving…' : 'Save messages'}
          </button>
        </section>

        <section className="panel">
          <h2>Chat commands</h2>
          <p className="help">A chat command replies when someone types it. A timer posts once after the minutes you set.</p>
          {triggers.length === 0 ? <p className="sub">No commands yet.</p> : triggers.map((trigger, index) => (
            <div className="trigger" key={`${trigger.type}-${trigger.condition}-${index}`}>
              <strong>{trigger.type === 'time' ? 'TIMER' : 'CHAT'}</strong>
              <div>
                <div>{trigger.condition}</div>
                <div className="sub">{trigger.message}</div>
              </div>
            </div>
          ))}
          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="trigger-type">Type</label>
            <select id="trigger-type" value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}>
              <option value="chat">Chat command</option>
              <option value="time">Timer, in minutes</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="trigger-condition">{draft.type === 'chat' ? 'Command' : 'Minutes'}</label>
            <input
              id="trigger-condition"
              value={draft.condition}
              placeholder={draft.type === 'chat' ? '!discord' : '15'}
              onChange={(event) => setDraft((current) => ({ ...current, condition: event.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="trigger-message">Reply</label>
            <input
              id="trigger-message"
              value={draft.message}
              placeholder="Join the Discord: discord.gg/yourserver"
              onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
            />
          </div>
          <button type="button" className="primary" disabled={busy === 'trigger'} onClick={addTrigger}>
            {busy === 'trigger' ? 'Adding…' : 'Add command'}
          </button>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
