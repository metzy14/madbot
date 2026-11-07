import React from 'react';
import { Link } from 'react-router-dom';

const FREE = ['Go-live post to Discord', '3 custom chat commands', 'Connections for Kick, Discord, and X'];
const PRO = [
  'Moderation filters and chat timers',
  'Points, shop, giveaways, and song requests',
  'Highlight desk and Vod2Content packs',
  'Raid book and !so',
  'Run of show clock and weekly board',
  'X cross-post and test alerts',
];

export default function Pricing() {
  return (
    <div>
      <p className="kicker">MadBot Pro</p>
      <h1>The desk Kick never shipped.</h1>
      <p className="lede">Streamlabs and Nightbot still think you are on Twitch. MadBot is the operating desk for a Kick channel: alerts, raids, the show plan, and chat, in one place.</p>
      <div className="price-grid">
        <article className="panel">
          <p className="kicker">Free</p>
          <h2>$0</h2>
          <p className="help">Enough to prove the bot is in your chat.</p>
          <ul className="plan">
            {FREE.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <Link className="btn" to="/connections">Connect the bot</Link>
        </article>
        <article className="panel price-pro">
          <p className="kicker">Pro</p>
          <h2>$12<span>/mo</span></h2>
          <p className="help">Early access: Pro is unlocked on your account. Card checkout opens when the first channels are live on it.</p>
          <ul className="plan">
            {PRO.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <Link className="btn" to="/dashboard">Open the desk</Link>
        </article>
      </div>
    </div>
  );
}
