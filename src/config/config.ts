import dotenv from 'dotenv';

dotenv.config();

interface Config {
  DISCORD_TOKEN: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  X_API_KEY: string;
  X_API_SECRET: string;
  X_ACCESS_TOKEN: string;
  X_ACCESS_TOKEN_SECRET: string;
  KICK_CLIENT_ID: string;
  KICK_CLIENT_SECRET: string;
  KICK_WEBHOOK_SECRET: string;
  SESSION_SECRET: string;
  PORT: string;
}

const config: Config = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID!,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET!,
  X_API_KEY: process.env.X_API_KEY!,
  X_API_SECRET: process.env.X_API_SECRET!,
  X_ACCESS_TOKEN: process.env.X_ACCESS_TOKEN!,
  X_ACCESS_TOKEN_SECRET: process.env.X_ACCESS_TOKEN_SECRET!,
  KICK_CLIENT_ID: process.env.KICK_CLIENT_ID!,
  KICK_CLIENT_SECRET: process.env.KICK_CLIENT_SECRET!,
  KICK_WEBHOOK_SECRET: process.env.KICK_WEBHOOK_SECRET!,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',
  PORT: process.env.PORT || '5000',
};

// Validate environment variables
Object.entries(config).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

export default config;