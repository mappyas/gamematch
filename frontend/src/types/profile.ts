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
  is_profile_complete: boolean;
};
