import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import config from '../config/config';
import { getUserByProviderId, createUser, getUserById } from '../db/db';
import { User } from '../types/user';

// Serialize user to session
passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id: number, done) => {
  const user = getUserById(id);
  done(null, user || null);
});

// Discord Strategy
passport.use(
  new DiscordStrategy(
    {
      clientID: config.DISCORD_CLIENT_ID,
      clientSecret: config.DISCORD_CLIENT_SECRET,
      callbackURL: 'https://madbot-backend.onrender.com/callback/discord',
      scope: ['identify', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = getUserByProviderId('discord', profile.id);
        if (!user) {
          user = createUser('discord', profile.id, profile.username);
        }
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

// Twitter (X) Strategy
passport.use(
  new TwitterStrategy(
    {
      consumerKey: config.X_API_KEY,
      consumerSecret: config.X_API_SECRET,
      callbackURL: 'https://madbot-backend.onrender.com/callback/x',
    },
    async (token, tokenSecret, profile, done) => {
      try {
        let user = getUserByProviderId('x', profile.id);
        if (!user) {
          user = createUser('x', profile.id, profile.username);
        }
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

// Kick Strategy (using OAuth2)
passport.use(
  'kick',
  new OAuth2Strategy(
    {
      authorizationURL: 'https://kick.com/oauth/authorize',
      tokenURL: 'https://kick.com/oauth/token',
      clientID: config.KICK_CLIENT_ID,
      clientSecret: config.KICK_CLIENT_SECRET,
      callbackURL: 'https://madbot-backend.onrender.com/callback/kick',
      scope: 'user:read',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Fetch user info from Kick API
        const response = await fetch('https://kick.com/api/v1/user', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch Kick user info');
        }
        const userInfo = await response.json();
        let user = getUserByProviderId('kick', userInfo.id);
        if (!user) {
          user = createUser('kick', userInfo.id, userInfo.username || `user_${Math.floor(Math.random() * 10000)}`);
        }
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

export default passport;