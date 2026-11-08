import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { http } from './api';
import { Banner } from './studio';

const GAMES = [
  ['tarkov', 'Escape from Tarkov'],
  ['iracing', 'iRacing'],
  ['fps', 'Competitive FPS'],
  ['battle_royale', 'Battle Royale'],
  ['mmo_rpg', 'MMO / RPG'],
  ['sports', 'Sports'],
  ['generic', 'Generic'],
];

function clock(ms) {
  const total = Math.round((Number(ms) || 0) / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function stamp(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default function Vod2Content() {
  const [videos, setVideos] = useState([]);
  const [channel, setChannel] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    game: 'tarkov',
    job: 'shorts',
    platform: 'youtube_shorts',
    quality: 'medium',
    topic: '',
    count: 6,
    seconds: 60,
  });
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    http.get('/vods').then((response) => {
      setChannel(response.data.channel || '');
      setVideos(response.data.videos || []);
      setSelected(response.data.videos?.[0] || null);
    }).catch((err) => setError(err.response?.data?.error || 'Could not load VODs.'));
  }, []);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function build() {
    if (!selected) return;
    setBusy(true);
    setError('');
    setNote('');
    try {
      const response = await http.post('/vod2content/plan', {
        ...form,
        title: selected.title,
        url: selected.url,
        durationMs: selected.duration,
      });
      setPlan(response.data);
      setNote('Package ready. Copy a block, or run the desktop command to encode the 9:16 file.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not build the package.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="kicker">Vod2Content</p>
      <h1>Long VOD in. Publish-ready Short out.</h1>
      <p className="lede">
        This is your desktop Vod2Content app, inside MadBot. It uses the same game profiles: Tarkov, iRacing, FPS, battle royale, RPG, and sports. The site writes the title, hook, tags, thumbnail line, and cut list. The encoder on your PC still burns the 1080×1920 captions.
      </p>
      <Banner note={note} error={error} />
      {!channel ? <p className="sub">Save your Kick channel on <Link to="/connections">Connections</Link> so the VOD list can load.</p> : null}
      <div className="layout">
        <section className="panel">
          <h2>{channel ? `kick.com/${channel}` : 'VODs'}</h2>
          {videos.map((video) => (
            <button type="button" key={video.id} className={selected?.id === video.id ? 'primary' : 'ghost'} style={{ width: '100%', marginBottom: 8, textAlign: 'left' }} onClick={() => { setSelected(video); setPlan(null); }}>
              {video.title}
              <div className="sub">{clock(video.duration)} · {video.views} views</div>
            </button>
          ))}
        </section>
        <section className="panel">
          <h2>Job</h2>
          <div className="field">
            <label>Game profile</label>
            <select value={form.game} onChange={(event) => set('game', event.target.value)}>
              {GAMES.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
          <div className="row">
            <select value={form.job} onChange={(event) => set('job', event.target.value)}>
              <option value="shorts">Shorts from peaks</option>
              <option value="clip">Fast clip, last N seconds</option>
              <option value="long">Long-form reel</option>
              <option value="analyze">Analyze only</option>
            </select>
            <select value={form.platform} onChange={(event) => set('platform', event.target.value)}>
              <option value="youtube_shorts">YouTube Shorts</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Reels</option>
              <option value="youtube_long">YouTube long</option>
            </select>
          </div>
          <div className="row">
            <select value={form.quality} onChange={(event) => set('quality', event.target.value)}>
              <option value="draft">Draft</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="number" min="1" max="12" value={form.count} onChange={(event) => set('count', Number(event.target.value))} />
            <input type="number" min="10" max="180" value={form.seconds} onChange={(event) => set('seconds', Number(event.target.value))} />
          </div>
          <div className="field">
            <label>Topic</label>
            <input value={form.topic} placeholder={selected?.title || 'Labs raid'} onChange={(event) => set('topic', event.target.value)} />
          </div>
          <button type="button" className="primary" disabled={!selected || busy} onClick={build}>{busy ? 'Building…' : 'Build package'}</button>
          {plan ? (
            <div>
              <div className="field"><label>Title</label><textarea rows={2} readOnly value={plan.title} /></div>
              <div className="field"><label>Hook</label><textarea rows={2} readOnly value={plan.hook} /></div>
              <div className="field"><label>Thumbnail</label><input readOnly value={plan.thumbnailText} /></div>
              <div className="field"><label>Caption</label><textarea rows={3} readOnly value={`${plan.description}\n\n${plan.cta}\n${(plan.hashtags || []).join(' ')}`} /></div>
              <div className="field">
                <label>Cut list</label>
                {(plan.cuts || []).map((cut, index) => (
                  <div className="trigger" key={`${cut.start}-${index}`}><strong>{cut.score}</strong><div>{stamp(cut.start)} – {stamp(cut.end)} · {cut.reason}</div></div>
                ))}
              </div>
              <div className="field">
                <label>Desktop encode command</label>
                <textarea rows={3} readOnly value={plan.command} />
                <button type="button" className="ghost" onClick={() => navigator.clipboard.writeText(plan.command)}>Copy command</button>
              </div>
              <p className="sub">{plan.note}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
