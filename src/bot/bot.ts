import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import config from '../config/config';
import axios from 'axios';
import WebSocket from 'ws';
import { getUserTriggers } from '../db/db';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

interface UserMessages {
  streamStartMessage: string;
  followerMilestoneMessage: string;
  thankYouMessage: string;
  hostShoutoutMessage: string;
  hostThankYouMessage: string;
}

interface CustomTrigger {
  type: 'chat' | 'time';
  condition: string | number; // e.g., chat command "!join" or time in minutes (10)
  message: string;
}

// In-memory storage (replace with database in production)
const userMessages: Record<number, UserMessages> = {};
const userTriggers: Record<number, CustomTrigger[]> = {};

let kickChatSocket: WebSocket | null = null;

export async function startBot() {
  try {
    if (!config.DISCORD_TOKEN) {
      throw new Error('DISCORD_TOKEN is missing! Add it to your environment variables.');
    }
    console.log('Trying to start the Discord bot...');
    await client.login(config.DISCORD_TOKEN);
    console.log(`Bot is ready: ${client.user?.tag}`);

    // Load triggers from database
    const allUsers = [1]; // Replace with actual user list
    for (const userId of allUsers) {
      const triggers = await getUserTriggers(userId);
      triggers.forEach((trigger: any) => {
        addCustomTrigger(userId, {
          type: trigger.type,
          condition: trigger.condition,
          message: trigger.message,
        });
      });
    }

    // Initialize Kick chat connection
    await connectToKickChat();
  } catch (error: unknown) {
    console.error('Bot failed to start:', error);
    if (error instanceof Error && error.message === 'Used disallowed intents') {
      console.error('The bot needs permissions (intents) turned on in Discord. Go to the Discord Developer Portal, find your app, and turn on "Guilds" and "Guild Messages" under Bot > Gateway Intents.');
    }
    throw error;
  }
}

async function connectToKickChat() {
  try {
    // Replace with actual Kick chat WebSocket URL and authentication
    const wsUrl = 'wss://kick.com/api/v1/chat/websocket'; // Placeholder URL
    kickChatSocket = new WebSocket(wsUrl);

    kickChatSocket.on('open', () => {
      console.log('Connected to Kick chat WebSocket');
      // Authenticate with Kick chat (replace with actual auth mechanism)
      kickChatSocket?.send(
        JSON.stringify({
          event: 'authenticate',
          token: 'YOUR_KICK_CHAT_TOKEN', // Replace with actual token
        })
      );
    });

    kickChatSocket.on('message', (data) => {
      const message = JSON.parse(data.toString());
      console.log('Received Kick chat message:', message);
      // Handle incoming chat messages for triggers
      if (message.event === 'chat_message') {
        const userId = 1; // Replace with actual user mapping
        const chatMessage = message.data.content;
        onChatMessage(userId, chatMessage);
      }
    });

    kickChatSocket.on('error', (error) => {
      console.error('Kick chat WebSocket error:', error);
    });

    kickChatSocket.on('close', () => {
      console.log('Kick chat WebSocket closed. Reconnecting...');
      setTimeout(connectToKickChat, 5000);
    });
  } catch (error) {
    console.error('Failed to connect to Kick chat:', error);
    setTimeout(connectToKickChat, 5000);
  }
}

// Send a message to Kick chat
export function sendKickChatMessage(message: string) {
  if (kickChatSocket && kickChatSocket.readyState === WebSocket.OPEN) {
    kickChatSocket.send(
      JSON.stringify({
        event: 'send_message',
        data: { content: message },
      })
    );
  } else {
    console.log('[Kick Chat] Not connected, message not sent:', message);
  }
}

// Notify Discord channel
async function notifyDiscord(channelId: string, message: string) {
  try {
    const channel = (await client.channels.fetch(channelId)) as TextChannel;
    if (channel) {
      await channel.send(message);
    }
  } catch (error) {
    console.error('Error sending Discord message:', error);
  }
}

// Post to X
async function postToX(message: string) {
  try {
    await axios.post(
      'https://api.twitter.com/2/tweets',
      { text: message },
      {
        headers: {
          Authorization: `Bearer ${config.X_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Posted to X:', message);
  } catch (error) {
    console.error('Error posting to X:', error);
  }
}

// Public functions to handle events
export async function onStreamStart(userId: number, streamLink: string) {
  const messages = userMessages[userId] || {
    streamStartMessage: 'Stream is live! Join now at {link}',
  };
  const message = messages.streamStartMessage.replace('{link}', streamLink);

  // Notify Discord
  await notifyDiscord('YOUR_DISCORD_CHANNEL_ID', message);
  // Post to X
  await postToX(message);
  // Announce in Kick chat
  sendKickChatMessage('Stream started! Let’s go!');
}

export async function onFollowerMilestone(userId: number, milestone: number, username: string) {
  const messages = userMessages[userId] || {
    followerMilestoneMessage: 'We hit {milestone} followers! Thanks, {username}!',
  };
  const message = messages.followerMilestoneMessage
    .replace('{milestone}', milestone.toString())
    .replace('{username}', username);

  // Notify Discord
  await notifyDiscord('YOUR_DISCORD_CHANNEL_ID', message);
  // Post to X
  await postToX(message);
  // Announce in Kick chat
  sendKickChatMessage(message);
}

export async function onHost(userId: number, hostUsername: string) {
  const messages = userMessages[userId] || {
    hostShoutoutMessage: 'Big shoutout to {host} for hosting!',
    hostThankYouMessage: 'Thanks to {host} for the host! Check them out at {link}',
  };

  // Shoutout in Kick chat
  const shoutoutMessage = messages.hostShoutoutMessage.replace('{host}', hostUsername);
  sendKickChatMessage(shoutoutMessage);

  // Thank you post on X
  const thankYouMessage = messages.hostThankYouMessage
    .replace('{host}', hostUsername)
    .replace('{link}', `https://kick.com/${hostUsername}`);
  await postToX(thankYouMessage);
}

export function setUserMessages(userId: number, messages: UserMessages) {
  userMessages[userId] = messages;
}

export function addCustomTrigger(userId: number, trigger: CustomTrigger) {
  if (!userTriggers[userId]) {
    userTriggers[userId] = [];
  }
  userTriggers[userId].push(trigger);

  // If time-based, set up a timer
  if (trigger.type === 'time') {
    const minutes = Number(trigger.condition) * 60 * 1000;
    setTimeout(() => {
      sendKickChatMessage(trigger.message);
    }, minutes);
  }
}

export function onChatMessage(userId: number, message: string) {
  const triggers = userTriggers[userId] || [];
  triggers.forEach((trigger) => {
    if (trigger.type === 'chat' && message === trigger.condition) {
      sendKickChatMessage(trigger.message);
    }
  });
}

startBot();