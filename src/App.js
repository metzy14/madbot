import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import './App.css';

// Base URL for the backend (Render URL)
const BASE_URL = 'https://madbot-backend.onrender.com'; // Replace with your actual Render URL

// Login Page Component
function Login() {
  return (
    <div className="login-container bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <h1 className="text-4xl font-bold text-purple-500 mb-4">MadBot - Sync Your Kick Stream</h1>
      <p className="text-lg text-gray-200 mb-6">Boost your Kick streaming with MadBot. Sign in to get started!</p>
      <div className="buttons flex flex-col gap-4">
        <a href={`${BASE_URL}/login/x`} className="btn bg-purple-500 text-gray-800 font-bold py-3 px-6 rounded hover:bg-purple-400">Sign in with X</a>
        <a href={`${BASE_URL}/login/discord`} className="btn bg-purple-500 text-gray-800 font-bold py-3 px-6 rounded hover:bg-purple-400">Sign in with Discord</a>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [command, setCommand] = useState('');
  const [commandResponse, setCommandResponse] = useState('');
  const [customCommand, setCustomCommand] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const [premiumKey, setPremiumKey] = useState('');
  const navigate = useNavigate();

  // Fetch stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/stats`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 401) {
            navigate('/');
            return;
          }
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setCommandResponse('Error fetching stats');
      }
    };

    fetchStats();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle command submission
  const handleCommandSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ command }),
      });
      const data = await response.json();
      setCommandResponse(data.response || data.error);
    } catch (error) {
      console.error('Error sending command:', error);
      setCommandResponse('Error sending command');
    }
  };

  // Handle custom command submission
  const handleCustomCommandSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/custom_command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ command: customCommand, response: customResponse }),
      });
      const data = await response.json();
      setCommandResponse(data.status === 'success' ? 'Custom command added!' : data.message || data.error);
    } catch (error) {
      console.error('Error adding custom command:', error);
      setCommandResponse('Error adding custom command');
    }
  };

  // Handle premium key submission
  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key: premiumKey }),
      });
      const data = await response.json();
      setCommandResponse(data.message || data.error);
    } catch (error) {
      console.error('Error joining with premium key:', error);
      setCommandResponse('Error joining with premium key');
    }
  };

  if (!stats) {
    return <div className="text-gray-200">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="text-3xl text-purple-500 mb-4">Welcome, {stats.username}!</h1>
      <button onClick={handleLogout} className="logout-btn">Logout</button>

      <div className="stats">
        <h2 className="text-2xl mb-2">Stream Stats</h2>
        <p>Status: {stats.live_now ? 'Live' : 'Offline'}</p>
        <p>Level: {stats.level}</p>
        <p>Followers: {stats.folks}</p>
        <p>Viewers: {stats.watchers}</p>
        <p>Uptime: {stats.uptime}</p>
        {stats.level === 'vip' && (
          <>
            <p>Last Host: {stats.last_host || 'None'}</p>
            <h3 className="text-xl mt-4">Analytics (Last 10)</h3>
            <ul>
              {stats.analytics.map((entry, index) => (
                <li key={index} className="text-gray-200">{entry.time}: {entry.watchers} viewers</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="commands">
        <h2 className="text-2xl mb-2">Commands</h2>
        <form onSubmit={handleCommandSubmit}>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command (e.g., !pulse)"
            className="mb-2"
          />
          <button type="submit" className="btn">Send Command</button>
        </form>
        {commandResponse && <p className="text-gray-200">Response: {commandResponse}</p>}

        <h3 className="text-xl mt-4">Add Custom Command</h3>
        <form onSubmit={handleCustomCommandSubmit}>
          <input
            type="text"
            value={customCommand}
            onChange={(e) => setCustomCommand(e.target.value)}
            placeholder="Command (e.g., !hype)"
            className="mb-2"
          />
          <input
            type="text"
            value={customResponse}
            onChange={(e) => setCustomResponse(e.target.value)}
            placeholder="Response (e.g., Let's get hyped!)"
            className="mb-2"
          />
          <button type="submit" className="btn">Add Custom Command</button>
        </form>

        <h3 className="text-xl mt-4">Join Premium</h3>
        <form onSubmit={handleJoinSubmit}>
          <input
            type="text"
            value={premiumKey}
            onChange={(e) => setPremiumKey(e.target.value)}
            placeholder="Enter premium key"
            className="mb-2"
          />
          <button type="submit" className="btn">Join</button>
        </form>
      </div>

      <div className="chat-log">
        <h3 className="text-xl mb-2">Chat Log (Last 10)</h3>
        <ul>
          {stats.chat_log.map((entry, index) => (
            <li key={index} className="text-gray-200">{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <div className="App bg-indigo-950">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;