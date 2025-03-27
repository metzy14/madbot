export interface User {
  id: number;
  x_id?: string;
  discord_id?: string;
  kick_id?: string;
  username: string;
  configs: Record<string, any>;
}