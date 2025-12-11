// API設定
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// APIエンドポイント
export const API_ENDPOINTS = {
  // Discord OAuth2
  discordLogin: `${API_URL}/accounts/api/discord/login/`,
  discordCallback: `${API_URL}/accounts/api/discord/callback/`,

  // ユーザー
  me: `${API_URL}/accounts/api/me/`,
  logout: `${API_URL}/accounts/api/logout/`,
  profile: `${API_URL}/accounts/api/profile/`,
  profileDetail: `${API_URL}/accounts/api/profile/detail/`,

  // ゲーム・募集
  games: `${API_URL}/accounts/api/games/`,
  recruitments: `${API_URL}/accounts/api/recruitments/`,

  // Riot API 連携
  riotLink: `${API_URL}/accounts/api/riot/link/`,
  riotAccount: `${API_URL}/accounts/api/riot/account/`,
  riotRefresh: `${API_URL}/accounts/api/riot/refresh/`,
  riotUnlink: `${API_URL}/accounts/api/riot/unlink/`,

  // Discord Bot 募集API
  discordRecruitments: `${API_URL}/accounts/api/discord/recruitments/`,
  discordCreateRecruitment: `${API_URL}/accounts/api/discord/recruitments/create/`,
  discordRecruitmentDetail: (id: string | number) => `${API_URL}/accounts/api/discord/recruitments/${id}/`,
  discordJoinRecruitment: (id: string | number) => `${API_URL}/accounts/api/discord/recruitments/${id}/join/`,
} as const;

// WebSocket URL
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

// Discord募集用の動的URL
export const getDiscordRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/discord/recruitments/${id}/`;
export const joinDiscordRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/discord/recruitments/${id}/join/`;
export const leaveDiscordRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/discord/recruitments/${id}/leave/`;

//プロフィール詳細
export const getUserProfileUrl = (discordId: string) => `${API_URL}/accounts/api/profile/${discordId}/`;

// 募集詳細・参加などの動的URL
// export const getRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/`;
// export const joinRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/join/`;
// export const leaveRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/leave/`;
// export const closeRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/close/`;
// export const deleteRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/delete/`;

