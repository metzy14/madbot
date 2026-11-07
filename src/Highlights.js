import React, { useState } from 'react';
import { Banner, useStudio } from './studio';

export default function Highlights() {
  const { studio, save, note, error } = useStudio();
  const [vod, setVod] = useState('');
  if (!studio) return <p className="sub">{error || 'Loading highlights…'}</p>;

  function pack(item) {
    const link = vod.trim();
    return `${item.caption}\n\nMoment: ${item.title}\n${item.note}\n${link ? `VOD: ${link}` : 'Add the VOD link, then copy this pack.'}\nCut vertical 9:16. Hook in the first second. Post to TikTok, Shorts, and Reels.`;
  }

  return (
    <div>
      <p className="kicker">Highlights</p>
      <h1>The clip desk, without scrubbing the whole VOD.</h1>
      <p className="lede">Say !clip in chat, or let a chat spike mark the moment. MadBot writes the caption pack for TikTok, Shorts, and Reels. It does not render the video file. You trim that moment from the VOD.</p>
      <Banner note={note} error={error} />
      <section className="panel" style={{ marginBottom: 14 }}>
        <label>VOD link</label>
        <input value={vod} placeholder="https://kick.com/video/..." onChange={(event) => setVod(event.target.value)} />
      </section>
      {(studio.highlights || []).length === 0 ? <p className="sub">No moments yet. Go live and type !clip clutch in chat.</p> : studio.highlights.map((item) => (
        <article className="panel" key={item.id} style={{ marginBottom: 12 }}>
          <p className="kicker">Score {item.score} · {item.status}</p>
          <h2>{item.title}</h2>
          <p className="sub">{item.note}</p>
          <textarea rows={4} value={item.caption} onChange={(event) => save({ ...studio, highlights: studio.highlights.map((row) => row.id === item.id ? { ...row, caption: event.target.value } : row) })} />
          <div className="row">
            <button type="button" className="primary" onClick={() => navigator.clipboard.writeText(pack(item))}>Copy post pack</button>
            <button type="button" className="ghost" onClick={() => save({ ...studio, highlights: studio.highlights.filter((row) => row.id !== item.id) })}>Dismiss</button>
          </div>
        </article>
      ))}
    </div>
  );
}
