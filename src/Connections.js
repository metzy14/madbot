import React, { useEffect, useState } from 'react';
import { AUTH_ORIGIN, http } from './api';
import './connections.css';

const GROUPS = [
  {
    id: 'discord',
    title: 'Discord',
    copy: 'The bot posts go-live alerts into this server. The token is used as soon as you save it.',
    fields: [
      { id: 'discord.token', label: 'Bot token', help: 'Developer Portal, Bot, Reset Token.' },
      { id: 'discord.clientId', label: 'Application ID', help: 'Used for sign-in. Restart MadBot after changing it.' },
      { id: 'discord.clientSecret', label: 'Client secret', help: 'OAuth2, Client Secret. Restart after changing it.' },
      { id: 'discord.channelId', label: 'Announce channel ID', help: 'Right-click the channel with developer mode on.' },
    ],
  },
  {
    id: 'x',
    title: 'X',
    copy: 'These keys let MadBot post the same alert to X.',
    fields: [
      { id: 'x.apiKey', label: 'API key', help: 'From the X developer app.' },
      { id: 'x.apiSecret', label: 'API secret', help: 'Shown once when the key is created.' },
      { id: 'x.accessToken', label: 'Access token', help: 'User token for the account that should post.' },
      { id: 'x.accessTokenSecret', label: 'Access token secret', help: 'Paired with the access token.' },
    ],
  },
  {
    id: 'kick',
    title: 'Kick',
    copy: 'Channel name is the slug from your Kick URL, not the full link.',
    fields: [
      { id: 'kick.channel', label: 'Channel name', help: 'kick.com/this-part' },
      { id: 'kick.clientId', label: 'Client ID', help: 'From the Kick developer app.' },
      { id: 'kick.clientSecret', label: 'Client secret', help: 'Kept on the server. Never shown again after save.' },
      { id: 'kick.webhookSecret', label: 'Webhook secret', help: 'Optional. Used to verify Kick events.' },
    ],
  },
];

function emptyDraft() {
  return Object.fromEntries(GROUPS.flatMap((group) => group.fields.map((field) => [field.id, ''])));
}

const Connections = () => {
  const [saved, setSaved] = useState({});
  const [draft, setDraft] = useState(emptyDraft);
  const [visible, setVisible] = useState({});
  const [loading, setLoading] = useState(true);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    let cancelled = false;
    http
      .get('/settings/keys')
      .then((response) => {
        if (!cancelled) setSaved(response.data.saved || {});
      })
      .catch((err) => {
        if (!cancelled && err.response?.status === 401) setNeedsSignIn(true);
        else if (!cancelled) setError('Could not load saved keys.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function setField(id, value) {
    setDraft((current) => ({ ...current, [id]: value }));
  }

  async function saveGroup(group) {
    setError('');
    setNote('');
    const values = {};
    group.fields.forEach((field) => {
      const value = draft[field.id].trim();
      if (value) values[field.id] = value;
    });
    if (!Object.keys(values).length) {
      setError(`Paste at least one ${group.title} value.`);
      return;
    }
    setBusy(group.id);
    try {
      const response = await http.put('/settings/keys', { values });
      setSaved(response.data.saved || {});
      setDraft((current) => {
        const next = { ...current };
        group.fields.forEach((field) => {
          next[field.id] = '';
        });
        return next;
      });
      setNote(response.data.note || `${group.title} saved.`);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error;
      if (status === 401) setError('Sign in with Discord first, then save.');
      else if (message) setError(message);
      else if (!err.response) setError('MadBot did not answer. Use the website, not the program on your PC.');
      else setError('Save failed. Sign in with Discord, then try again.');
    } finally {
      setBusy('');
    }
  }

  async function clearGroup(group) {
    setError('');
    setNote('');
    setBusy(group.id);
    try {
      const response = await http.put('/settings/keys', {
        values: {},
        clear: group.fields.map((field) => field.id),
      });
      setSaved(response.data.saved || {});
      setNote(`${group.title} keys removed from this account.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not clear keys.');
    } finally {
      setBusy('');
    }
  }

  async function testGroup(group) {
    setError('');
    setNote('');
    setBusy(group.id);
    try {
      const values = {};
      group.fields.forEach((field) => {
        if (draft[field.id].trim()) values[field.id] = draft[field.id].trim();
      });
      const response = await http.post('/settings/keys/test', { group: group.id, values });
      setNote(response.data.detail || 'Connection looks good.');
    } catch (err) {
      setError(err.response?.data?.error || 'Connection test failed.');
    } finally {
      setBusy('');
    }
  }

  if (loading) {
    return (
      <section className="connections">
        <p className="status-line">Loading connections…</p>
      </section>
    );
  }

  if (needsSignIn) {
    return (
      <section className="connections">
        <div className="conn-panel">
          <h1>Connections</h1>
          <p className="panel-copy">Sign in, then paste your Discord, X, and Kick keys here.</p>
          <div className="signin-links">
            <a href={`${AUTH_ORIGIN}/auth/discord`}>Sign in with Discord</a>
            <a href={`${AUTH_ORIGIN}/auth/twitter`}>Sign in with X</a>
            <a href={`${AUTH_ORIGIN}/auth/kick`}>Sign in with Kick</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="connections">
      <div className="connections-head">
        <div>
          <h1>Connections</h1>
          <p>Paste each key once. MadBot stores it and only shows the last four characters.</p>
        </div>
      </div>
      {note ? <p className="banner">{note}</p> : null}
      {error ? <p className="banner banner-error">{error}</p> : null}
      <div className="conn-grid">
        {GROUPS.map((group) => (
          <article className="conn-panel" key={group.id}>
            <h2>{group.title}</h2>
            <p className="panel-copy">{group.copy}</p>
            {group.fields.map((field) => {
              const stored = saved[field.id];
              return (
                <div className="field" key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <p className="field-help">{field.help}</p>
                  {stored ? <p className="hint">Saved {stored.hint}</p> : <p className="hint">Not saved</p>}
                  <div className="field-row">
                    <input
                      id={field.id}
                      type={visible[field.id] ? 'text' : 'password'}
                      autoComplete="off"
                      spellCheck="false"
                      value={draft[field.id]}
                      placeholder={stored ? 'Paste a new value to replace' : 'Paste key'}
                      onChange={(event) => setField(field.id, event.target.value)}
                    />
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setVisible((current) => ({ ...current, [field.id]: !current[field.id] }))}
                    >
                      {visible[field.id] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="actions">
              <button type="button" className="primary" disabled={busy === group.id} onClick={() => saveGroup(group)}>
                Save {group.title}
              </button>
              <button type="button" className="ghost" disabled={busy === group.id} onClick={() => testGroup(group)}>
                Test
              </button>
              <button type="button" className="warn" disabled={busy === group.id} onClick={() => clearGroup(group)}>
                Clear
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Connections;
