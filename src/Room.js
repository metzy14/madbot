import React, { useEffect, useState } from 'react';
import { API, http } from './api';

const empty = {
  channel: 'maddogmetzy',
  live: false,
  viewers: 128,
  goal: { label: 'Follower goal', current: 1400, target: 2000 },
  alerts: {
    follow: { title: '{name} followed', detail: 'Welcome to the kennel.', enabled: true },
    sub: { title: '{name} subscribed', detail: 'Thank you for the sub.', enabled: true },
    raid: { title: '{name} raided', detail: '{viewers} viewers incoming.', enabled: true },
    tip: { title: '{name} tipped', detail: '{amount}', enabled: true },
  },
  events: [],
  clips: [],
  light: '#3d9eff',
  voice: 'Welcome to the kennel.',
  fired: null,
};

const copy = {
  live: 'Clip the last moment and hand it to YouTube, X, and Instagram.',
  lights: 'Pick the color the overlay flashes.',
  voice: 'Hear the line the booth will read.',
  overlays: 'Drop these links into OBS as browser sources.',
};

function fill(template, data) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) => (data[key] == null ? '' : String(data[key])));
}

export default function Room({ view }) {
  const [room, setRoom] = useState(empty);
  const [note, setNote] = useState('');
  const [topic, setTopic] = useState('last raid wipe');
  const [plan, setPlan] = useState([]);

  useEffect(() => {
    let gone = false;
    http.get('/room').then((response) => {
      if (!gone && response.data) setRoom({ ...empty, ...response.data, alerts: { ...empty.alerts, ...(response.data.alerts || {}) }, goal: { ...empty.goal, ...(response.data.goal || {}) } });
    }).catch(() => {
      if (!gone) setNote('Sign in on the desk if you want these overlays saved.');
    });
    return () => { gone = true; };
  }, []);

  async function save(next) {
    setRoom(next);
    try {
      await http.put('/room', next);
      setNote('Saved to the live overlays.');
    } catch {
      setNote('Kept on this page. Sign in to push it to OBS.');
    }
  }

  function play(kind) {
    const template = room.alerts[kind];
    if (!template?.enabled) return;
    const data = { name: 'MaddogMetzy', viewers: 42, amount: '100 Kicks' };
    const fired = { title: fill(template.title, data), detail: fill(template.detail, data) };
    const next = { ...room, fired, events: [{ id: String(Date.now()), text: fired.title }, ...room.events].slice(0, 8) };
    save(next);
    window.setTimeout(() => save({ ...next, fired: null }), 4200);
  }

  function clip() {
    const title = room.voice || 'Live from the kennel';
    const next = { ...room, clips: [{ id: String(Date.now()), title, seconds: 45 }, ...room.clips].slice(0, 6) };
    save(next);
    const text = `${title} — kick.com/${room.channel || 'maddogmetzy'}`;
    navigator.clipboard?.writeText(text);
    window.open('https://www.youtube.com/upload', '_blank', 'noopener');
    window.open('https://x.com/compose/post', '_blank', 'noopener');
    window.open('https://www.instagram.com/', '_blank', 'noopener');
  }

  const goalPct = Math.min(100, Math.round((room.goal.current / Math.max(1, room.goal.target)) * 100));
  const channel = room.channel || 'maddogmetzy';
  const scenes = ['alert', 'chat', 'goal', 'events'];

  return (
    <section className="room">
      <p className="kicker">{room.live ? 'On air' : 'Off air'} · kick.com/{channel}</p>
      <h1>{view === 'live' ? 'Live' : view === 'lights' ? 'Lights' : view === 'voice' ? 'Voice' : 'Overlays'}</h1>
      <p className="lede">{copy[view]}</p>
      {note ? <p className="note">{note}</p> : null}
      <div className="room-grid">
        <div className="card">
          {view === 'live' && (
            <>
              <div className="stack">
                <button type="button" className="primary" onClick={() => save({ ...room, live: !room.live })}>{room.live ? 'End stream' : 'Go live'}</button>
                <button type="button" className="primary" onClick={clip} disabled={!room.live}>Clip now</button>
              </div>
              {!room.live ? <p className="lede">Go live first, then clip.</p> : null}
              {room.clips.map((item) => <p key={item.id} className="event-line">{item.title} · {item.seconds}s</p>)}
              <label className="lbl">Words that go with the clip</label>
              <input value={topic} onChange={(event) => setTopic(event.target.value)} />
              <button type="button" onClick={() => setPlan([
                `${topic}: the moment chat lost it`,
                `Don't blink — ${topic}`,
                `45 seconds of ${topic}`,
              ])}>Plan three shorts</button>
              {plan.map((title) => <p key={title} className="event-line">{title}</p>)}
            </>
          )}
          {view === 'lights' && (
            <>
              <div className="stage-light" style={{ background: `radial-gradient(circle at 50% 80%, ${room.light}, #0c0a07 70%)` }} />
              <div className="stack">
                {['#3d9eff', '#e2b657', '#f4efe4'].map((color) => (
                  <button key={color} type="button" className="swatch" style={{ background: color }} aria-label={color} onClick={() => save({ ...room, light: color })} />
                ))}
              </div>
            </>
          )}
          {view === 'voice' && (
            <>
              <input value={room.voice} onChange={(event) => setRoom({ ...room, voice: event.target.value })} onBlur={() => save(room)} />
              <button type="button" className="primary" onClick={() => {
                const utter = new SpeechSynthesisUtterance(room.voice);
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utter);
              }}>Speak</button>
            </>
          )}
          {view === 'overlays' && (
            <>
              {scenes.map((scene) => {
                const url = `${API}/overlay/${scene}?channel=${encodeURIComponent(channel)}`;
                return (
                  <p key={scene} className="event-line">
                    <span>{scene}</span>
                    <button type="button" onClick={() => navigator.clipboard?.writeText(url)}>Copy link</button>
                  </p>
                );
              })}
              <p className="lede">In OBS, add a browser source and paste the link. The alert scene updates when you play a test.</p>
              {['follow', 'sub', 'raid', 'tip'].map((kind) => (
                <div key={kind}>
                  <label className="lbl">{kind}</label>
                  <input
                    value={room.alerts[kind]?.title || ''}
                    onChange={(event) => setRoom({ ...room, alerts: { ...room.alerts, [kind]: { ...room.alerts[kind], title: event.target.value } } })}
                    onBlur={() => save(room)}
                  />
                  <button type="button" className="primary" onClick={() => play(kind)}>Play</button>
                </div>
              ))}
            </>
          )}
        </div>
        <aside className="card preview-card" style={{ '--glow': room.light }}>
          <p className="kicker">Overlay</p>
          {room.fired ? (
            <>
              <img src="/mark.png" alt="" width="72" height="72" />
              <strong>{room.fired.title}</strong>
              <p className="lede">{room.fired.detail}</p>
            </>
          ) : (
            <>
              <strong>{room.viewers}</strong>
              <p className="lede">watching kick.com/{channel}</p>
            </>
          )}
          <div className="bar"><span style={{ width: `${goalPct}%` }} /></div>
          <p className="lede">{room.goal.current} / {room.goal.target}</p>
        </aside>
      </div>
    </section>
  );
}
