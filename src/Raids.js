import React, { useState } from 'react';
import { Banner, useStudio } from './studio';

export default function Raids() {
  const { studio, save, note, error, busy } = useStudio();
  const [raid, setRaid] = useState({ name: '', note: '' });
  const [clip, setClip] = useState({ title: '', url: '' });
  const [word, setWord] = useState('');
  if (!studio) return <p className="sub">{error || 'Loading the raid book…'}</p>;

  function update(partial) {
    return { ...studio, ...partial };
  }

  return (
    <div>
      <p className="kicker">Community</p>
      <h1>Raids, clips, and the words you will not allow.</h1>
      <p className="lede">Chat already understands !so, !discord, !clips, and !goal. Fill this book and those commands get specific.</p>
      <Banner note={note} error={error} />
      <div className="layout">
        <section className="panel">
          <h2>Raid book</h2>
          <p className="help">Channels you send people to. !so name uses the note when the name matches.</p>
          {studio.raids.map((item, index) => (
            <div className="trigger" key={`${item.name}-${index}`}>
              <strong>!so</strong>
              <div>
                <div>kick.com/{item.name}</div>
                <div className="sub">{item.note}</div>
                <button type="button" className="ghost" onClick={() => save(update({ raids: studio.raids.filter((_, i) => i !== index) }))}>Remove</button>
              </div>
            </div>
          ))}
          <div className="field"><input value={raid.name} placeholder="channel name" onChange={(event) => setRaid((current) => ({ ...current, name: event.target.value }))} /></div>
          <div className="field"><input value={raid.note} placeholder="Why chat should follow them" onChange={(event) => setRaid((current) => ({ ...current, note: event.target.value }))} /></div>
          <button type="button" className="primary" disabled={busy} onClick={() => {
            if (!raid.name.trim()) return;
            save(update({ raids: [...studio.raids, { name: raid.name.trim().replace(/^@/, ''), note: raid.note.trim() }] }));
            setRaid({ name: '', note: '' });
          }}>Add channel</button>
          <div className="field" style={{ marginTop: 18 }}>
            <label>Discord invite for !discord</label>
            <input value={studio.discordInvite} placeholder="https://discord.gg/..." onChange={(event) => save(update({ discordInvite: event.target.value }))} />
          </div>
          <div className="field">
            <label>Call to action for !goal</label>
            <input value={studio.cta} onChange={(event) => save(update({ cta: event.target.value }))} />
          </div>
        </section>
        <section className="panel">
          <h2>Clip shelf</h2>
          {studio.clips.map((item, index) => (
            <div className="trigger" key={`${item.url}-${index}`}>
              <strong>CLIP</strong>
              <div>
                <div>{item.title}</div>
                <a href={item.url}>{item.url}</a>
                <div><button type="button" className="ghost" onClick={() => save(update({ clips: studio.clips.filter((_, i) => i !== index) }))}>Remove</button></div>
              </div>
            </div>
          ))}
          <div className="field"><input value={clip.title} placeholder="Title" onChange={(event) => setClip((current) => ({ ...current, title: event.target.value }))} /></div>
          <div className="field"><input value={clip.url} placeholder="https://kick.com/..." onChange={(event) => setClip((current) => ({ ...current, url: event.target.value }))} /></div>
          <button type="button" className="primary" disabled={busy} onClick={() => {
            if (!clip.url.trim()) return;
            save(update({ clips: [{ title: clip.title.trim() || 'Clip', url: clip.url.trim() }, ...studio.clips] }));
            setClip({ title: '', url: '' });
          }}>Save clip</button>
          <h2 style={{ marginTop: 22 }}>Blocked phrases</h2>
          <p className="help">If chat includes one of these, MadBot tells them to keep it clean and skips commands.</p>
          <div className="row" style={{ marginBottom: 10 }}>
            {studio.blocked.map((item) => (
              <button type="button" className="warn" key={item} onClick={() => save(update({ blocked: studio.blocked.filter((word) => word !== item) }))}>{item} ×</button>
            ))}
          </div>
          <div className="row">
            <input value={word} placeholder="phrase" onChange={(event) => setWord(event.target.value)} />
            <button type="button" className="ghost" onClick={() => {
              const next = word.trim();
              if (!next) return;
              save(update({ blocked: [...studio.blocked, next] }));
              setWord('');
            }}>Block</button>
          </div>
        </section>
      </div>
    </div>
  );
}
