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
  createRecruitment: `${API_URL}/accounts/api/recruitments/create/`,
  
  // Riot API 連携
  riotLink: `${API_URL}/accounts/api/riot/link/`,
  riotAccount: `${API_URL}/accounts/api/riot/account/`,
  riotRefresh: `${API_URL}/accounts/api/riot/refresh/`,
  riotUnlink: `${API_URL}/accounts/api/riot/unlink/`,
} as const;

// 募集詳細・参加などの動的URL
export const getRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/`;
export const joinRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/join/`;
export const leaveRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/leave/`;
export const closeRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/close/`;
export const deleteRecruitmentUrl = (id: number) => `${API_URL}/accounts/api/recruitments/${id}/delete/`;

