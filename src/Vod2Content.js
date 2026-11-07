import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { http } from './api';
import { Banner, useStudio } from './studio';

function clock(ms) {
  const total = Math.round((Number(ms) || 0) / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function buildPieces(vod, highlights) {
  const moments = (highlights || []).slice(0, 3);
  const momentLine = moments.length
    ? moments.map((item) => item.title).join(', ')
    : 'the loudest stretch of the VOD';
  const title = vod.title || 'Last stream';
  return [
    { label: 'Short title', text: title.slice(0, 70) },
    { label: 'Hook', text: `You missed this on stream. ${momentLine}.` },
    {
      label: 'TikTok / Shorts / Reels',
      text: `${title}\n\n${momentLine}.\n\nFull VOD: ${vod.url}\n\n#kick #streaming #maddogmetzy #clips`,
    },
    {
      label: 'X post',
      text: `${title}\n\nBest moment: ${moments[0]?.title || 'watch the VOD'}.\n${vod.url}`,
    },
    {
      label: 'Discord',
      text: `VOD is up: ${title}\n${vod.url}\n${moments.length ? `Clip marks: ${momentLine}` : 'No clip marks yet. Type !clip during the next stream.'}`,
    },
    {
      label: 'Thumbnail line',
      text: (moments[0]?.title || title).slice(0, 32).toUpperCase(),
    },
  ];
}

export default function Vod2Content() {
  const { studio, save, note, error } = useStudio();
  const [videos, setVideos] = useState([]);
  const [channel, setChannel] = useState('');
  const [selected, setSelected] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    http
      .get('/vods')
      .then((response) => {
        setChannel(response.data.channel || '');
        setVideos(response.data.videos || []);
        setSelected(response.data.videos?.[0] || null);
      })
      .catch((err) => setLoadError(err.response?.data?.error || 'Could not load VODs.'));
  }, []);

  function makePack() {
    if (!selected || !studio) return;
    const nextPieces = buildPieces(selected, studio.highlights);
    setPieces(nextPieces);
    const pack = {
      id: `vod-${Date.now()}`,
      vodTitle: selected.title,
      vodUrl: selected.url,
      created: new Date().toISOString(),
      pieces: nextPieces,
    };
    save({ ...studio, contentPacks: [pack, ...(studio.contentPacks || [])].slice(0, 12) });
  }

  return (
    <div>
      <p className="kicker">Vod2Content</p>
      <h1>Turn the VOD into posts.</h1>
      <p className="lede">
        Pick a Kick replay. MadBot writes the short, the X post, the Discord message, and the thumbnail line from that VOD and your clip marks.
      </p>
      <Banner note={note} error={error || loadError} />
      {!channel ? <p className="sub">Save your Kick channel on <Link to="/connections">Connections</Link> first.</p> : null}
      <div className="layout">
        <section className="panel">
          <h2>{channel ? `kick.com/${channel}` : 'Recent VODs'}</h2>
          {videos.length === 0 ? <p className="sub">No VODs came back yet.</p> : videos.map((video) => (
            <button
              type="button"
              key={video.id}
              className={selected?.id === video.id ? 'primary' : 'ghost'}
              style={{ width: '100%', marginBottom: 8, textAlign: 'left' }}
              onClick={() => { setSelected(video); setPieces([]); }}
            >
              {video.title}
              <div className="sub">{clock(video.duration)} · {video.views} views</div>
            </button>
          ))}
        </section>
        <section className="panel">
          <h2>{selected ? selected.title : 'Pick a VOD'}</h2>
          {selected ? <p className="sub"><a href={selected.url}>{selected.url}</a></p> : null}
          <button type="button" className="primary" disabled={!selected} onClick={makePack}>Make the content pack</button>
          {pieces.map((piece) => (
            <div className="field" key={piece.label}>
              <label>{piece.label}</label>
              <textarea rows={4} readOnly value={piece.text} />
              <button type="button" className="ghost" onClick={() => navigator.clipboard.writeText(piece.text)}>Copy</button>
            </div>
          ))}
        </section>
      </div>
      {(studio?.contentPacks || []).length ? (
        <section className="panel" style={{ marginTop: 14 }}>
          <h2>Saved packs</h2>
          {studio.contentPacks.map((pack) => (
            <div className="trigger" key={pack.id}>
              <strong>VOD</strong>
              <div>
                <div>{pack.vodTitle}</div>
                <a href={pack.vodUrl}>{pack.vodUrl}</a>
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
