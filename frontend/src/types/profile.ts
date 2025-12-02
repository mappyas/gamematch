// Profile & User types
export type Game = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  color: string;
  bannerUrl: string;
};

export type User = {
  id: number;
  discord_id: string;
  discord_username: string;
  avatar: string | null;
};

// ゲーム一覧
export const GAMES: Game[] = [
  { id: 1, slug: 'apex', name: 'Apex Legends', icon: '🎯', color: '#DA292A', bannerUrl: '' },
  { id: 2, slug: 'valorant', name: 'VALORANT', icon: '🔫', color: '#FF4655', bannerUrl: '' },
  { id: 3, slug: 'lol', name: 'League of Legends', icon: '⚔️', color: '#C89B3C', bannerUrl: '' },
  { id: 4, slug: 'fortnite', name: 'Fortnite', icon: '🏗️', color: '#9D4DFF', bannerUrl: '' },
  { id: 5, slug: 'overwatch', name: 'Overwatch 2', icon: '🦸', color: '#F99E1A', bannerUrl: '' },
  { id: 6, slug: 'minecraft', name: 'Minecraft', icon: '⛏️', color: '#62B47A', bannerUrl: '' },
];
