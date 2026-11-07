import React, { useState } from 'react';
import { Banner, nid, useStudio } from './studio';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Planner() {
  const { studio, save, note, error, busy } = useStudio();
  const [segment, setSegment] = useState({ title: '', minutes: 10, notes: '' });
  const [slot, setSlot] = useState({ day: 'Fri', time: '20:00', title: '' });
  if (!studio) return <p className="sub">{error || 'Loading the show plan…'}</p>;

  function update(partial) {
    return { ...studio, ...partial };
  }

  return (
    <div>
      <p className="kicker">Show plan</p>
      <h1>Run the stream like a show, not a tab.</h1>
      <p className="lede">A run of show and a weekly board. The desk clock walks the segments. Chat can ask !schedule.</p>
      <Banner note={note} error={error} />
      <div className="layout">
        <section className="panel">
          <h2>Run of show</h2>
          {studio.segments.map((item) => (
            <div className="trigger" key={item.id}>
              <strong>{item.minutes}m</strong>
              <div>
                <div>{item.title}</div>
                <div className="sub">{item.notes}</div>
                <button type="button" className="ghost" onClick={() => save(update({ segments: studio.segments.filter((row) => row.id !== item.id) }))}>Remove</button>
              </div>
            </div>
          ))}
          <div className="field">
            <label>Segment</label>
            <input value={segment.title} placeholder="Just chatting" onChange={(event) => setSegment((current) => ({ ...current, title: event.target.value }))} />
          </div>
          <div className="row">
            <input type="number" min="1" value={segment.minutes} onChange={(event) => setSegment((current) => ({ ...current, minutes: Number(event.target.value) }))} />
            <input value={segment.notes} placeholder="Note" onChange={(event) => setSegment((current) => ({ ...current, notes: event.target.value }))} />
          </div>
          <button type="button" className="primary" disabled={busy} onClick={() => {
            if (!segment.title.trim()) return;
            save(update({ segments: [...studio.segments, { ...segment, id: nid() }] }));
            setSegment({ title: '', minutes: 10, notes: '' });
          }}>Add segment</button>
        </section>
        <section className="panel">
          <h2>Weekly board</h2>
          {studio.schedule.length === 0 ? <p className="sub">No slots yet. Viewers can still ask !schedule.</p> : studio.schedule.map((item, index) => (
            <div className="trigger" key={`${item.day}-${index}`}>
              <strong>{item.day}</strong>
              <div>
                <div>{item.time} · {item.title}</div>
                <button type="button" className="ghost" onClick={() => save(update({ schedule: studio.schedule.filter((_, i) => i !== index) }))}>Remove</button>
              </div>
            </div>
          ))}
          <div className="row">
            <select value={slot.day} onChange={(event) => setSlot((current) => ({ ...current, day: event.target.value }))}>
              {DAYS.map((day) => <option key={day}>{day}</option>)}
            </select>
            <input value={slot.time} onChange={(event) => setSlot((current) => ({ ...current, time: event.target.value }))} />
          </div>
          <div className="field">
            <input value={slot.title} placeholder="Ranked grind" onChange={(event) => setSlot((current) => ({ ...current, title: event.target.value }))} />
          </div>
          <button type="button" className="primary" disabled={busy} onClick={() => {
            if (!slot.title.trim()) return;
            save(update({ schedule: [...studio.schedule, slot] }));
            setSlot({ day: 'Fri', time: '20:00', title: '' });
          }}>Add slot</button>
        </section>
      </div>
    </div>
  );
}
