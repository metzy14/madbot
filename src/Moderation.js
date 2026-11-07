import React, { useState } from 'react';
import { Banner, nid, useStudio } from './studio';

export default function Moderation() {
  const { studio, save, note, error, busy } = useStudio();
  const [timer, setTimer] = useState({ message: '', minutes: 15, minLines: 8 });
  const [word, setWord] = useState('');
  if (!studio) return <p className="sub">{error || 'Loading moderation…'}</p>;

  function toggle(key) {
    save({ ...studio, mod: { ...studio.mod, [key]: !studio.mod[key] } });
  }

  return (
    <div>
      <p className="kicker">Moderation</p>
      <h1>Filters and timers, the Botrix basics.</h1>
      <p className="lede">Links, all-caps, repeats, and a word list are stopped in chat. Timers only speak after enough people have talked, so they do not spam an empty room.</p>
      <Banner note={note} error={error} />
      <div className="layout">
        <section className="panel">
          <h2>Filters</h2>
          {[['links', 'Block links'], ['caps', 'Block all-caps'], ['repeat', 'Block repeat spam']].map(([key, label]) => (
            <label className="check" key={key}>
              <input type="checkbox" checked={!!studio.mod[key]} onChange={() => toggle(key)} />
              <span>{label}</span>
            </label>
          ))}
          <h2 style={{ marginTop: 18 }}>Blocked phrases</h2>
          <div className="row">
            {(studio.blocked || []).map((item) => (
              <button type="button" className="warn" key={item} onClick={() => save({ ...studio, blocked: studio.blocked.filter((row) => row !== item) })}>{item} ×</button>
            ))}
          </div>
          <div className="row">
            <input value={word} placeholder="phrase" onChange={(event) => setWord(event.target.value)} />
            <button type="button" className="ghost" onClick={() => { if (!word.trim()) return; save({ ...studio, blocked: [...studio.blocked, word.trim()] }); setWord(''); }}>Block</button>
          </div>
        </section>
        <section className="panel">
          <h2>Timers</h2>
          {studio.timers.map((row) => (
            <div className="trigger" key={row.id}>
              <strong>{row.minutes}m</strong>
              <div>{row.message}<div className="sub">Waits for {row.minLines} chat lines</div>
                <button type="button" className="ghost" onClick={() => save({ ...studio, timers: studio.timers.filter((item) => item.id !== row.id) })}>Remove</button>
              </div>
            </div>
          ))}
          <textarea rows={2} placeholder="Follow reminder" value={timer.message} onChange={(event) => setTimer({ ...timer, message: event.target.value })} />
          <div className="row">
            <input type="number" value={timer.minutes} onChange={(event) => setTimer({ ...timer, minutes: Number(event.target.value) })} />
            <input type="number" value={timer.minLines} onChange={(event) => setTimer({ ...timer, minLines: Number(event.target.value) })} />
          </div>
          <button type="button" className="primary" disabled={busy} onClick={() => {
            if (!timer.message.trim()) return;
            save({ ...studio, timers: [...studio.timers, { ...timer, id: nid() }] });
            setTimer({ message: '', minutes: 15, minLines: 8 });
          }}>Add timer</button>
        </section>
      </div>
    </div>
  );
}
