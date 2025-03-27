import Database from 'better-sqlite3';
import { User } from '../types/user';

const db = new Database('madbot.db', { verbose: console.log });

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    providerId TEXT NOT NULL,
    username TEXT NOT NULL,
    configs TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    userId INTEGER NOT NULL,
    streamStartMessage TEXT,
    followerMilestoneMessage TEXT,
    thankYouMessage TEXT,
    hostShoutoutMessage TEXT,
    hostThankYouMessage TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS triggers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    condition TEXT NOT NULL,
    message TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

export async function getUserById(id: number): Promise<User | null> {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return user ? (user as User) : null;
}

export async function getUserByProviderId(provider: string, providerId: string): Promise<User | null> {
  const user = db.prepare('SELECT * FROM users WHERE provider = ? AND providerId = ?').get(provider, providerId);
  return user ? (user as User) : null;
}

export async function createUser(provider: string, providerId: string, username: string, configs: Record<string, any> = {}): Promise<User> {
  const stmt = db.prepare('INSERT INTO users (provider, providerId, username, configs) VALUES (?, ?, ?, ?)');
  const result = stmt.run(provider, providerId, username, JSON.stringify(configs));
  const user: User = {
    id: result.lastInsertRowid as number,
    provider,
    providerId,
    username,
    configs,
  };
  return user;
}

export async function getUserMessages(userId: number): Promise<any> {
  const messages = db.prepare('SELECT * FROM messages WHERE userId = ?').get(userId);
  return messages || {
    streamStartMessage: 'Stream is live! Join now at {link}',
    followerMilestoneMessage: 'We hit {milestone} followers! Thanks, {username}!',
    thankYouMessage: 'Thanks for the support, {username}!',
    hostShoutoutMessage: 'Big shoutout to {host} for hosting!',
    hostThankYouMessage: 'Thanks to {host} for the host! Check them out at {link}',
  };
}

export async function saveUserMessages(userId: number, messages: any): Promise<void> {
  const existing = db.prepare('SELECT * FROM messages WHERE userId = ?').get(userId);
  if (existing) {
    db.prepare(`
      UPDATE messages
      SET streamStartMessage = ?, followerMilestoneMessage = ?, thankYouMessage = ?, hostShoutoutMessage = ?, hostThankYouMessage = ?
      WHERE userId = ?
    `).run(
      messages.streamStartMessage,
      messages.followerMilestoneMessage,
      messages.thankYouMessage,
      messages.hostShoutoutMessage,
      messages.hostThankYouMessage,
      userId
    );
  } else {
    db.prepare(`
      INSERT INTO messages (userId, streamStartMessage, followerMilestoneMessage, thankYouMessage, hostShoutoutMessage, hostThankYouMessage)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      messages.streamStartMessage,
      messages.followerMilestoneMessage,
      messages.thankYouMessage,
      messages.hostShoutoutMessage,
      messages.hostThankYouMessage
    );
  }
}

export async function getUserTriggers(userId: number): Promise<any[]> {
  return db.prepare('SELECT * FROM triggers WHERE userId = ?').all(userId);
}

export async function saveUserTrigger(userId: number, trigger: { type: string; condition: string; message: string }): Promise<void> {
  db.prepare('INSERT INTO triggers (userId, type, condition, message) VALUES (?, ?, ?, ?)').run(
    userId,
    trigger.type,
    trigger.condition,
    trigger.message
  );
}