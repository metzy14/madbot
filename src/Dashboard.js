import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    tier: 'free',
    followers: 0,
    isLive: false,
    viewers: null,
    title: null,
  });
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState({
    streamStartMessage: '',
    followerMilestoneMessage: '',
    thankYouMessage: '',
    hostShoutoutMessage: '',
    hostThankYouMessage: '',
  });
  const [editingMessages, setEditingMessages] = useState(false);
  const [triggers, setTriggers] = useState([]);
  const [editingTriggers, setEditingTriggers] = useState(false);
  const [newTrigger, setNewTrigger] = useState({
    type: 'chat',
    condition: '',
    message: '',
  });

  useEffect(() => {
    fetchStats();
    fetchMessages();
    fetchTriggers();
  }, [apiKey]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`https://madbot-backend.onrender.com/stats?apiKey=${apiKey}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMessages = async () => {
    if (!apiKey || apiKey !== 'premium_key') return;
    try {
      const response = await axios.get(`https://madbot-backend.onrender.com/messages?apiKey=${apiKey}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTriggers = async () => {
    if (!apiKey || apiKey !== 'premium_key') return;
    try {
      const response = await axios.get(`https://madbot-backend.onrender.com/triggers?apiKey=${apiKey}`);
      setTriggers(response.data);
    } catch (error) {
      console.error('Error fetching triggers:', error);
    }
  };

  const saveMessages = async () => {
    try {
      await axios.post(`https://madbot-backend.onrender.com/messages?apiKey=${apiKey}`, messages);
      alert('Messages saved successfully!');
      setEditingMessages(false);
    } catch (error) {
      alert('Failed to save messages: ' + error.response.data.error);
    }
  };

  const addTrigger = async () => {
    try {
      await axios.post(`https://madbot-backend.onrender.com/triggers?apiKey=${apiKey}`, newTrigger);
      alert('Trigger added successfully!');
      setNewTrigger({ type: 'chat', condition: '', message: '' });
      setEditingTriggers(false);
      fetchTriggers(); // Refresh triggers
    } catch (error) {
      alert('Failed to add trigger: ' + error.response.data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">MadBot Dashboard</h1>

        {/* API Key Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Live Stats */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Live Stats</h2>
          <p><strong>Tier:</strong> {stats.tier}</p>
          <p><strong>Followers:</strong> {stats.followers}</p>
          <p><strong>Live Status:</strong> {stats.isLive ? 'Live' : 'Offline'}</p>
          {stats.tier === 'premium' && (
            <>
              <p><strong>Viewers:</strong> {stats.viewers !== null ? stats.viewers : 'N/A'}</p>
              <p><strong>Stream Title:</strong> {stats.title || 'N/A'}</p>
            </>
          )}
        </div>

        {/* Message Customization (Premium Only) */}
        {stats.tier === 'premium' && (
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Message Customization</h2>
            <button
              onClick={() => setEditingMessages(!editingMessages)}
              className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-opacity-80 transition"
            >
              {editingMessages ? 'Cancel' : 'Edit Messages'}
            </button>
            {editingMessages && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Stream Start Message:</label>
                  <input
                    type="text"
                    value={messages.streamStartMessage}
                    onChange={(e) => setMessages({ ...messages, streamStartMessage: e.target.value })}
                    placeholder="Stream is live! Join now at {link}"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Follower Milestone Message:</label>
                  <input
                    type="text"
                    value={messages.followerMilestoneMessage}
                    onChange={(e) => setMessages({ ...messages, followerMilestoneMessage: e.target.value })}
                    placeholder="We hit {milestone} followers! Thanks, {username}!"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Thank You Message:</label>
                  <input
                    type="text"
                    value={messages.thankYouMessage}
                    onChange={(e) => setMessages({ ...messages, thankYouMessage: e.target.value })}
                    placeholder="Thanks for the support, {username}!"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Host Shoutout Message:</label>
                  <input
                    type="text"
                    value={messages.hostShoutoutMessage}
                    onChange={(e) => setMessages({ ...messages, hostShoutoutMessage: e.target.value })}
                    placeholder="Big shoutout to {host} for hosting!"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Host Thank You Message:</label>
                  <input
                    type="text"
                    value={messages.hostThankYouMessage}
                    onChange={(e) => setMessages({ ...messages, hostThankYouMessage: e.target.value })}
                    placeholder="Thanks to {host} for the host! Check them out at {link}"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                  />
                </div>
                <button
                  onClick={saveMessages}
                  className="w-full bg-green-500 text-black font-bold py-2 rounded hover:bg-opacity-80 transition"
                >
                  Save Messages
                </button>
              </div>
            )}
          </div>
        )}

        {/* Custom Triggers (Premium Only) */}
        {stats.tier === 'premium' && (
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Custom Triggers</h2>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Existing Triggers</h3>
              {triggers.length === 0 ? (
                <p>No triggers set.</p>
              ) : (
                <ul className="space-y-2">
                  {triggers.map((trigger, index) => (
                    <li key={index} className="p-2 bg-gray-700 rounded">
                      <strong>Type:</strong> {trigger.type} | <strong>Condition:</strong> {trigger.condition} | <strong>Message:</strong> {trigger.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => setEditingTriggers(!editingTriggers)}
              className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-opacity-80 transition"
            >
              {editingTriggers ? 'Cancel' : 'Add Trigger'}
            </button>
            {editingTriggers && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Trigger Type:</label>
                  <select
                    name="triggerType"
                    value={newTrigger.type}
                    onChange={(e) => setNewTrigger({ ...newTrigger, type: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                  >
                    <option value="chat">Chat Command</option>
                    <option value="time">Time-Based (Minutes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    {newTrigger.type === 'chat' ? 'Chat Command (e.g., !join)' : 'Minutes (e.g., 10)'}
                  </label>
                  <input
                    type="text"
                    name="condition"
                    value={newTrigger.condition}
                    onChange={(e) => setNewTrigger({ ...newTrigger, condition: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Message:</label>
                  <input
                    type="text"
                    name="message"
                    value={newTrigger.message}
                    onChange={(e) => setNewTrigger({ ...newTrigger, message: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                  />
                </div>
                <button
                  onClick={addTrigger}
                  className="w-full bg-green-500 text-black font-bold py-2 rounded hover:bg-opacity-80 transition"
                >
                  Add Trigger
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;