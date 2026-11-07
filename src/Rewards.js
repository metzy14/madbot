import React, { useState } from 'react';
import { Banner, useStudio } from './studio';

export default function Rewards() {
  const { studio, save, note, error, busy } = useStudio();
  const [item, setItem] = useState({ name: '', cost: 100, reward: '' });
  const [prize, setPrize] = useState('');
  if (!studio) return <p className="sub">{error || 'Loading rewards…'}</p>;
  const leaders = Object.entries(studio.viewers || {}).sort((a, b) => b[1].points - a[1].points).slice(0, 8);

  return (
    <div>
      <p className="kicker">Rewards</p>
      <h1>Points, a shop, giveaways, and the song queue.</h1>
      <p className="lede">Viewers earn {studio.currency} by chatting. They can check !points, buy from the shop, enter a giveaway, and request songs with !sr.</p>
      <Banner note={note} error={error} />
      <div className="layout">
        <section className="panel">
          <h2>Leaderboard</h2>
          {leaders.length === 0 ? <p className="sub">Points show up after chat messages come in.</p> : leaders.map(([name, row]) => (
            <div className="trigger" key={name}><strong>{row.points}</strong><div>{name}<div className="sub">{row.watch} active minutes</div></div></div>
          ))}
          <div className="field">
            <label>Points per chat message</label>
            <input type="number" min="0" value={studio.pointsPerChat} onChange={(event) => save({ ...studio, pointsPerChat: Number(event.target.value) })} />
          </div>
          <div className="field">
            <label>Currency name</label>
            <input value={studio.currency} onChange={(event) => save({ ...studio, currency: event.target.value })} />
          </div>
        </section>
        <section className="panel">
          <h2>Shop</h2>
          {studio.shop.map((row, index) => (
            <div className="trigger" key={row.name}><strong>{row.cost}</strong><div>{row.name}<div className="sub">{row.reward}</div><button type="button" className="ghost" onClick={() => save({ ...studio, shop: studio.shop.filter((_, i) => i !== index) })}>Remove</button></div></div>
          ))}
          <input placeholder="Item" value={item.name} onChange={(event) => setItem({ ...item, name: event.target.value })} />
          <div className="row">
            <input type="number" value={item.cost} onChange={(event) => setItem({ ...item, cost: Number(event.target.value) })} />
            <input placeholder="What they get" value={item.reward} onChange={(event) => setItem({ ...item, reward: event.target.value })} />
          </div>
          <button type="button" className="primary" disabled={busy} onClick={() => {
            if (!item.name.trim()) return;
            save({ ...studio, shop: [...studio.shop, item] });
            setItem({ name: '', cost: 100, reward: '' });
          }}>Add item</button>
          <h2 style={{ marginTop: 18 }}>Giveaway</h2>
          <p className="sub">{studio.giveaway.open ? `${studio.giveaway.entries.length} entered for ${studio.giveaway.prize}` : 'Closed. Chat uses !enter.'}</p>
          <input placeholder="Prize" value={prize} onChange={(event) => setPrize(event.target.value)} />
          <div className="row">
            <button type="button" className="primary" onClick={() => save({ ...studio, giveaway: { open: true, prize: prize || studio.giveaway.prize || 'a prize', entries: [] } })}>Open</button>
            <button type="button" className="ghost" onClick={() => {
              const entries = studio.giveaway.entries;
              const winner = entries[Math.floor(Math.random() * entries.length)];
              save({ ...studio, giveaway: { open: false, prize: studio.giveaway.prize, entries: [] } });
              if (winner) alert(`Winner: ${winner}`);
            }}>Draw</button>
          </div>
          <h2 style={{ marginTop: 18 }}>Song queue</h2>
          {(studio.songs || []).length === 0 ? <p className="sub">Empty. Viewers use !sr song name.</p> : studio.songs.map((song, index) => (
            <div className="trigger" key={`${song}-${index}`}><strong>{index === 0 ? 'NOW' : index + 1}</strong><div>{song}</div></div>
          ))}
          <button type="button" className="ghost" onClick={() => save({ ...studio, songs: studio.songs.slice(1) })}>Skip</button>
        </section>
      </div>
    </div>
  );
}
