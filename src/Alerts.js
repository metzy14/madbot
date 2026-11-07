import React, { useEffect, useState } from 'react';
import { http } from './api';

const FIELDS = [
  ['streamStartMessage', 'Go live', 'Discord and X when Kick says you started. Use {link}.', 'Stream is live! Join now at {link}'],
  ['followerMilestoneMessage', 'Follower milestone', 'Every 100 followers. Use {milestone} and {username}.', 'We hit {milestone} followers! Thanks, {username}!'],
  ['thankYouMessage', 'Thank you', 'Support line. Use {username}.', 'Thanks for the support, {username}!'],
  ['hostShoutoutMessage', 'Raid in chat', 'Said in Kick chat. Use {host}.', 'Big shoutout to {host} for the raid!'],
  ['hostThankYouMessage', 'Raid on X', 'Posted to X. Use {host} and {link}.', 'Thanks to {host} for the raid. Watch them at {link}'],
];

export default function Alerts() {
  const [messages, setMessages] = useState({});
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    http.get('/messages').then((response) => {
      if (response.data) setMessages(response.data);
    }).catch((err) => setError(err.response?.status === 401 ? 'Sign in to edit alerts.' : 'Could not load alerts.'));
  }, []);

  async function save() {
    setBusy(true);
    setNote('');
    setError('');
    try {
      await http.post('/messages', messages);
      setNote('Alert copy saved. The next go-live, milestone, and raid will use it.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save alerts.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="kicker">Alert studio</p>
      <h1>What MadBot says when something happens.</h1>
      <p className="lede">One set of lines, sent to Discord, X, and Kick chat. This is the part people pay for on other platforms.</p>
      {note ? <p className="banner">{note}</p> : null}
      {error ? <p className="banner bad">{error}</p> : null}
      <section className="panel">
        {FIELDS.map(([id, label, hint, placeholder]) => (
          <div className="field" key={id}>
            <label htmlFor={id}>{label}</label>
            <p className="token">{hint}</p>
            <textarea id={id} rows={2} value={messages[id] || ''} placeholder={placeholder} onChange={(event) => setMessages((current) => ({ ...current, [id]: event.target.value }))} />
          </div>
        ))}
        <button type="button" className="primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save alerts'}</button>
      </section>
    </div>
  );
}
