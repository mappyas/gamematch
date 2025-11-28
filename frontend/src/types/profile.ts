// ゲーム型
export type Game = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
};

// 募集型
export type Recruitment = {
  id: number;
  title: string;
  description: string;
  game: Game;
  platform: string;
  max_players: number;
  current_players: number;
  rank: string;
  voice_chat: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  is_full: boolean;
  owner?: {
    id: number;
    discord_username: string;
    avatar: string;
  };
  joined_at?: string;
};

// LoLランク型
export type LoLRank = {
  queue_type: string;
  queue_type_display: string;
  tier: string;
  rank: string;
  league_points: number;
  wins: number;
  losses: number;
  display_rank: string;
};

// Riotアカウント型
export type RiotAccount = {
  riot_id: string;
  game_name: string;
  tag_line: string;
  region: string;
  lol_ranks: LoLRank[];
};

// ゲームアカウント型
export type GameAccount = {
  id: number;
  game: Game;
  player_id: string;
  rank: string;
};

// プロフィール型
export type Profile = {
  display_name: string;
  main_game: Game | null;
  platform: string;
  bio: string;
  created_at: string;
  updated_at: string;
  game_accounts: GameAccount[];
};

// ユーザー型
export type User = {
  id: number;
  discord_id: string;
  discord_username: string;
  avatar: string;
  email: string | null;
  is_profile_complete: boolean;
  created_at: string;
};

// プロフィールデータ型（APIレスポンス）
export type ProfileData = {
  user: User;
  profile: Profile | null;
  created_recruitments: Recruitment[];
  participated_recruitments: Recruitment[];
  riot_account: RiotAccount | null;
};

