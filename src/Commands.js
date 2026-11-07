import React, { useEffect, useState } from 'react';
import { http } from './api';

const BUILTINS = [
  ['!points', 'Shows your points. !points name checks someone else.'],
  ['!watchtime', 'Active minutes in chat.'],
  ['!top', 'Top three by points.'],
  ['!sr song', 'Add a song. !song, !queue, and !skip run the queue.'],
  ['!enter', 'Join the open giveaway. The channel owner can !draw.'],
  ['!buy item', 'Spend points in the shop.'],
  ['!clip note', 'Mark a highlight and write the caption.'],
  ['!uptime', 'How long this stream clock has been running.'],
  ['!so name', 'Shout out a Kick channel.'],
  ['!commands', 'List what chat can type.'],
];

export default function Commands() {
  const [triggers, setTriggers] = useState([]);
  const [draft, setDraft] = useState({ type: 'chat', condition: '', message: '' });
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    http.get('/triggers').then((response) => setTriggers(response.data || [])).catch((err) => {
      setError(err.response?.status === 401 ? 'Sign in to edit commands.' : 'Could not load commands.');
    });
  }, []);

  async function addTrigger() {
    if (!draft.condition.trim() || !draft.message.trim()) {
      setError('A command needs a trigger and a reply.');
      return;
    }
    setBusy(true);
    setNote('');
    setError('');
    try {
      await http.post('/triggers', draft);
      setDraft({ type: 'chat', condition: '', message: '' });
      const response = await http.get('/triggers');
      setTriggers(response.data || []);
      setNote('Command saved. Chat commands answer in Kick chat. Timers fire once after the minutes you set.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add that command.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="kicker">Command deck</p>
      <h1>Chat that works while you play.</h1>
      <p className="lede">Built-in commands ship with MadBot. Add your own for Discord links, rules, and timed reminders.</p>
      {note ? <p className="banner">{note}</p> : null}
      {error ? <p className="banner bad">{error}</p> : null}
      <div className="layout">
        <section className="panel">
          <h2>Built in</h2>
          {BUILTINS.map(([name, copy]) => (
            <div className="trigger" key={name}>
              <strong>{name}</strong>
              <div className="sub">{copy}</div>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Yours</h2>
          {triggers.length === 0 ? <p className="sub">No custom commands yet.</p> : triggers.map((trigger, index) => (
            <div className="trigger" key={`${trigger.condition}-${index}`}>
              <strong>{trigger.type === 'time' ? 'TIMER' : 'CHAT'}</strong>
              <div>
                <div>{trigger.condition}</div>
                <div className="sub">{trigger.message}</div>
              </div>
            </div>
          ))}
          <div className="field" style={{ marginTop: 16 }}>
            <label>Type</label>
            <select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}>
              <option value="chat">Chat command</option>
              <option value="time">Timer, in minutes</option>
            </select>
          </div>
          <div className="field">
            <label>{draft.type === 'chat' ? 'When someone types' : 'After this many minutes'}</label>
            <input value={draft.condition} placeholder={draft.type === 'chat' ? '!rules' : '20'} onChange={(event) => setDraft((current) => ({ ...current, condition: event.target.value }))} />
          </div>
          <div className="field">
            <label>MadBot replies</label>
            <input value={draft.message} placeholder="Be kind. No spam." onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))} />
          </div>
          <button type="button" className="primary" disabled={busy} onClick={addTrigger}>{busy ? 'Adding…' : 'Add command'}</button>
        </section>
      </div>
    </div>
  );
}
