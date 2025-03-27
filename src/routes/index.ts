import express from 'express';
import { verifyKickWebhook } from '../utils/verifyKickWebhook';
import config from '../config/config';
import { getUserById, getUserMessages, saveUserMessages, getUserTriggers, saveUserTrigger } from '../db/db';
import axios from 'axios';
import { onStreamStart, onFollowerMilestone, onHost, setUserMessages, addCustomTrigger } from '../bot/bot';

const router = express.Router();

// Mock Kick API data (replace with actual API calls)
interface KickStats {
  followers: number;
  isLive: boolean;
  viewers: number | null;
  title: string | null;
}

async function fetchKickStats(): Promise<KickStats> {
  try {
    // Replace with actual Kick API call using your KICK_CLIENT_ID and KICK_CLIENT_SECRET
    const response = await axios.get('https://kick.com/api/v1/channels/YOUR_KICK_USERNAME', {
      headers: {
        Authorization: `Bearer YOUR_KICK_ACCESS_TOKEN`,
      },
    });
    return {
      followers: response.data.followers_count || 0,
      isLive: response.data.livestream?.is_live || false,
      viewers: response.data.livestream?.viewer_count || null,
      title: response.data.livestream?.title || null,
    };
  } catch (error) {
    console.error('Error fetching Kick stats:', error);
    return { followers: 0, isLive: false, viewers: null, title: null };
  }
}

// Webhook for Kick events (e.g., stream start, follower milestone)
router.post('/webhook/kick', async (req, res) => {
  const messageId = req.headers['kick-event-message-id'] as string;
  const timestamp = req.headers['kick-event-message-timestamp'] as string;
  const signature = req.headers['kick-event-signature'] as string;
  const body = JSON.stringify(req.body);

  if (!messageId || !timestamp || !signature) {
    return res.status(400).send('Missing required headers');
  }

  const isValid = verifyKickWebhook(messageId, timestamp, body, signature);
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  if (config.KICK_WEBHOOK_SECRET) {
    // Add custom validation if needed
  }

  console.log('Received valid Kick webhook:', req.body);
  const eventType = req.body.event;
  const userId = 1; // Replace with actual user mapping logic

  if (eventType === 'livestream.started') {
    const streamLink = req.body.data?.stream_url || 'https://kick.com/YOUR_KICK_USERNAME';
    await onStreamStart(userId, streamLink);
  } else if (eventType === 'follower.created') {
    const username = req.body.data?.follower_username || 'Unknown';
    const followers = req.body.data?.total_followers || 0;
    // Check for milestone (e.g., every 100 followers)
    if (followers % 100 === 0) {
      await onFollowerMilestone(userId, followers, username);
    }
  } else if (eventType === 'host.created') {
    const hostUsername = req.body.data?.host_username || 'Unknown';
    await onHost(userId, hostUsername);
  }

  res.status(200).send('Webhook received');
});

// Stats endpoint for the frontend
router.get('/stats', async (req, res) => {
  const apiKey = req.query.apiKey as string;
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Mock user tier (replace with actual logic to verify API key)
  const userTier = apiKey === 'premium_key' ? 'premium' : 'free'; // Replace with actual validation

  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const user = await getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const stats = await fetchKickStats();
  res.json({
    tier: userTier,
    followers: stats.followers,
    isLive: stats.isLive,
    viewers: userTier === 'premium' ? stats.viewers : null,
    title: userTier === 'premium' ? stats.title : null,
  });
});

// Messages endpoint for the frontend (GET and POST)
router.get('/messages', async (req, res) => {
  const apiKey = req.query.apiKey as string;
  if (!apiKey || apiKey !== 'premium_key') {
    return res.status(401).json({ error: 'Premium API key required' });
  }

  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const user = await getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const messages = await getUserMessages(user.id);
  res.json(messages);
});

router.post('/messages', async (req, res) => {
  const apiKey = req.query.apiKey as string;
  if (!apiKey || apiKey !== 'premium_key') {
    return res.status(401).json({ error: 'Premium API key required' });
  }

  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const user = await getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { streamStartMessage, followerMilestoneMessage, thankYouMessage, hostShoutoutMessage, hostThankYouMessage } = req.body;
  const messages = {
    streamStartMessage,
    followerMilestoneMessage,
    thankYouMessage,
    hostShoutoutMessage,
    hostThankYouMessage,
  };
  await saveUserMessages(user.id, messages);
  setUserMessages(user.id, messages);

  res.status(200).json({ message: 'Messages updated successfully' });
});

// Get custom triggers
router.get('/triggers', async (req, res) => {
  const apiKey = req.query.apiKey as string;
  if (!apiKey || apiKey !== 'premium_key') {
    return res.status(401).json({ error: 'Premium API key required' });
  }

  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const user = await getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const triggers = await getUserTriggers(user.id);
  res.json(triggers);
});

// Add a custom trigger
router.post('/triggers', async (req, res) => {
  const apiKey = req.query.apiKey as string;
  if (!apiKey || apiKey !== 'premium_key') {
    return res.status(401).json({ error: 'Premium API key required' });
  }

  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const user = await getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { type, condition, message } = req.body;
  if (!type || !condition || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  await saveUserTrigger(user.id, { type, condition, message });
  addCustomTrigger(user.id, { type, condition, message });
  res.status(200).json({ message: 'Trigger added successfully' });
});

export default router;