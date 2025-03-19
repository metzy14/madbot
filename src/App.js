import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import './output.css';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend);

function App() {
  const [stats, setStats] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [command, setCommand] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCmd, setCustomCmd] = useState('');
  const [customResp, setCustomResp] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configs, setConfigs] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/stats', { withCredentials: true });
        setStats(res.data);
        setConfigs(res.data.configs || {});
        setChatLog(res.data.chat_log || []);
        setError('');
      } catch (e) {
        console.error('Fetch error:', e);
        setError('Failed to load stats. Please try again.');
        window.location.href = '/';
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!command) return;
    try {
      const res = await axios.post('/api/command', { command }, { withCredentials: true });
      setChatLog([...chatLog, `> ${command}`, res.data.response].slice(-10));
      setError('');
    } catch (e) {
      setChatLog([...chatLog, `> ${command}`, e.response?.data?.error || "Error processing command"].slice(-10));
      setError('Command failed. Check your input.');
    }
    setCommand('');
  };

  const handleCustomCommand = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/custom_command', { command: customCmd, response: customResp }, { withCredentials: true });
      if (res.data.status === "success") {
        setStats(prev => ({ ...prev, custom_commands: { ...prev.custom_commands, [customCmd]: customResp } }));
        setShowCustomModal(false);
        setCustomCmd('');
        setCustomResp('');
        setError('');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save command.');
    }
  };

  const handleJoin = async () => {
    try {
      await axios.post('/api/join', {}, { withCredentials: true });
      const res = await axios.get('/api/stats', { withCredentials: true });
      setStats(res.data);
      setChatLog(res.data.chat_log || []);
      setError('');
    } catch (e) {
      setError('Failed to upgrade to Pro.');
    }
  };

  const handleConfigUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/update_configs', configs, { withCredentials: true });
      setShowConfigModal(false);
      const res = await axios.get('/api/stats', { withCredentials: true });
      setStats(res.data);
      setChatLog(res.data.chat_log || []);
      setError('');
    } catch (e) {
      setError('Failed to update configs.');
    }
  };

  if (!stats) return <div className="text-white text-center p-4">Loading MadBot Dashboard...</div>;

  const chartData = {
    labels: stats.analytics ? stats.analytics.map(d => d.time) : [],
    datasets: [{
      label: 'Viewers',
      data: stats.analytics ? stats.analytics.map(d => d.watchers) : [],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      tension: 0.1,
    }],
  };

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-4">
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={`Manage your Kick stream with MadBot. Auto-post to Discord and X, track analytics, and auto shout-out raids via chatbot. Username: ${stats.username}`} />
        <meta name="keywords" content="MadBot Kick streaming dashboard, Maddogmetzy Kick stream, stream analytics tool, Discord stream sync, X auto-post streaming, raid shout-out" />
        <meta name="author" content="xAI" />
        <meta property="og:title" content={`MadBot Dashboard - ${stats.username}`} />
        <meta property="og:description" content="Sync your Kick stream with Discord and X, featuring auto raid shout-outs via chatbot. Join Maddogmetzy!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://madbot-frontend.vercel.app/dashboard" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`MadBot Dashboard - ${stats.username}`} />
        <meta name="twitter:description" content="Auto-sync your Kick stream with Discord and X, including raid shout-outs via chatbot. Join Maddogmetzy now!" />
        <title>{`MadBot Dashboard - ${stats.username} | Sync Kick Stream with Chatbot Shout-Outs`}</title>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "http://schema.org",
            "@type": "SoftwareApplication",
            "name": "MadBot",
            "operatingSystem": "Web",
            "applicationCategory": "Entertainment",
            "description": `A dashboard to sync Kick streams with Discord and X for ${stats.username}, featuring auto shout-outs for raids via chatbot and clips.`,
            "url": "https://madbot-frontend.vercel.app/dashboard",
            "author": { "@type": "Organization", "name": "xAI" }
          })}
        </script>
      </Helmet>

      <iframe
        src="https://kick.com/maddogmetzy"
        title="Maddogmetzy Kick Stream"
        className="hidden"
        width="0"
        height="0"
        allowFullScreen
        alt="Embedded Kick stream for Maddogmetzy"
      ></iframe>

      {error && <div className="bg-red-600 text-white p-2 rounded mb-4 w-full max-w-4xl">{error}</div>}
      <div className={`rounded-lg shadow-xl p-6 w-full max-w-4xl bg-gray-800 flex ${stats.level === 'vip' ? 'border-2 border-purple-600' : ''}`}>
        <div className="w-2/3 pr-4">
          <h1 className="text-2xl font-bold text-purple-500 mb-4 text-center">
            MadBot - {stats.level === 'vip' ? 'Pro Sync' : 'Stream Sync'} for {stats.username}
          </h1>
          <div className="space-y-3 text-gray-200">
            <div className="flex justify-between">
              <span className="font-semibold">Stream Status:</span>
              <span className={stats.live_now ? 'text-purple-500' : 'text-gray-500'}>{stats.live_now ? 'Live' : 'Offline'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Live Posting:</span>
              <span className={stats.live_now ? 'text-purple-500' : 'text-gray-400'}>
                {stats.live_now && stats.last_live ? `X: ${stats.last_live.x || 'Pending'} | Discord: ${stats.last_live.discord || 'Pending'}` : 'X: Ready | Discord: Ready'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Clip Posting:</span>
              <span className="text-gray-400">
                {stats.level === 'vip' && stats.last_clip ? `X: ${stats.last_clip.x || 'Pending'} | Discord: ${stats.last_clip.discord || 'Pending'}` : 'Premium Feature'}
              </span>
            </div>
            {stats.level === 'vip' && (
              <div className="flex justify-between">
                <span className="font-semibold">Last Host:</span>
                <span className="text-gray-400">{stats.last_host || 'None'}</span>
              </div>
            )}
            <div className="text-sm">
              Songs: {stats.song_queue.length ? stats.song_queue.join(', ') : 'None queued'}
            </div>
          </div>
          <div className="mt-5 text-center">
            <a href={stats.configs.STREAM_URL} target="_blank" rel="noopener noreferrer"
               className="inline-block bg-purple-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-purple-400 transition">
              Join {stats.username}'s Live Stream
            </a>
          </div>
        </div>
        <div className="w-1/3 pl-4 border-l border-gray-700">
          <h2 className="text-lg font-semibold text-purple-500 mb-2">MadBot Commands</h2>
          <div className="h-40 overflow-y-auto bg-gray-700 p-2 rounded text-gray-200 text-sm mb-2">
            {chatLog.map((line, idx) => <div key={idx}>{line}</div>)}
          </div>
          <form onSubmit={handleCommand} className="mb-2">
            <input value={command} onChange={e => setCommand(e.target.value)} placeholder="Type command (e.g., !pulse)"
                   className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500" />
          </form>
          <button onClick={() => setShowCustomModal(true)} className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-600 transition mb-2">
            Add Custom Command
          </button>
          <h2 className="text-lg font-semibold text-purple-500 mb-2">Custom Commands</h2>
          <div className="h-20 overflow-y-auto bg-gray-700 p-2 rounded text-gray-200 text-sm mb-2">
            {Object.entries(stats.custom_commands).map(([cmd, resp], idx) => (
              <div key={idx}>{cmd}: {resp}</div>
            ))}
          </div>
          {stats.level === 'vip' ? (
            <div className="h-48 bg-gray-700 p-2 rounded mb-2">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'Time' } }, y: { title: { display: true, text: 'Viewers' } } } }} />
            </div>
          ) : (
            <div className="h-48 bg-gray-700 p-2 rounded text-center text-gray-500 flex items-center justify-center mb-2">
              <button onClick={handleJoin} className="bg-purple-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-purple-400 transition">
                Upgrade to Pro
              </button>
            </div>
          )}
          <button onClick={() => setShowConfigModal(true)} className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-600 transition mb-2">
            Edit Stream Configs
          </button>
          <a href="/logout" className="block text-center text-purple-500 hover:underline">Logout</a>
        </div>
      </div>
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold text-purple-500 mb-4">Add Custom Command</h2>
            <form onSubmit={handleCustomCommand}>
              <input value={customCmd} onChange={e => setCustomCmd(e.target.value)} placeholder="Command (e.g., !hype)"
                     className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
              <input value={customResp} onChange={e => setCustomResp(e.target.value)} placeholder="Response"
                     className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
              <div className="flex justify-between">
                <button type="submit" className="bg-purple-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-purple-400 transition">
                  Save
                </button>
                <button onClick={() => setShowCustomModal(false)} className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold text-purple-500 mb-4">Edit Stream Configs</h2>
            <form onSubmit={handleConfigUpdate}>
              <input value={configs.KICK_USERNAME || ''} onChange={e => setConfigs({ ...configs, KICK_USERNAME: e.target.value })} placeholder="Kick Username"
                     className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
              <input value={configs.X_API_KEY || ''} onChange={e => setConfigs({ ...configs, X_API_KEY: e.target.value })} placeholder="X API Key"
                     className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
              <input value={configs.X_API_SECRET || ''} onChange={e => setConfigs({ ...configs, X_API_SECRET: e.target.value })} placeholder="X API Secret"
                     className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
              <input value={configs.X_ACCESS_TOKEN || ''} onChange={e => setConfigs({ ...configs, X_ACCESS_TOKEN: e.target.value })} placeholder="X Access Token"
                     className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
              <input value={configs.X_ACCESS_SECRET || ''} onChange={e => setConfigs({ ...configs, X_ACCESS_SECRET: e.target.value })} placeholder="X Access Secret"
                     className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
              <input value={configs.DISCORD_TOKEN || ''} onChange={e => setConfigs({ ...configs, DISCORD_TOKEN: e.target.value })} placeholder="Discord Bot Token"
                     className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
              <input value={configs.DISCORD_CHANNEL_ID || ''} onChange={e => setConfigs({ ...configs, DISCORD_CHANNEL_ID: e.target.value })} placeholder="Discord Channel ID (e.g., 123456789)"
                     className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
              {stats.level === 'vip' && (
                <>
                  <label className="flex items-center text-gray-200 mb-2">
                    <input type="checkbox" checked={configs.AUTO_SHOUTOUT_HOSTS || false} 
                           onChange={e => setConfigs({ ...configs, AUTO_SHOUTOUT_HOSTS: e.target.checked })}
                           className="mr-2" />
                    Auto Shout-Out Hosts via Chatbot
                  </label>
                  <input value={configs.SHOUTOUT_MESSAGE || ''} 
                         onChange={e => setConfigs({ ...configs, SHOUTOUT_MESSAGE: e.target.value })} 
                         placeholder="Shout-out message (use {host})"
                         className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
                  <label className="flex items-center text-gray-200 mb-2">
                    <input type="checkbox" checked={configs.THANK_HOST_ON_X || false} 
                           onChange={e => setConfigs({ ...configs, THANK_HOST_ON_X: e.target.checked })}
                           className="mr-2" />
                    Thank Host on X
                  </label>
                  <input value={configs.THANK_X_MESSAGE || ''} 
                         onChange={e => setConfigs({ ...configs, THANK_X_MESSAGE: e.target.value })} 
                         placeholder="X thank message (use {host})"
                         className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-2" />
                </>
              )}
              <div className="flex justify-between">
                <button type="submit" className="bg-purple-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-purple-400 transition">
                  Save
                </button>
                <button onClick={() => setShowConfigModal(false)} className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;