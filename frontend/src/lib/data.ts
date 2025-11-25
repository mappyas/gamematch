// ゲームデータ
export const games = [
  { id: 'apex', name: 'Apex Legends', color: '#DA292A', playerCount: '3人' },
  { id: 'valorant', name: 'VALORANT', color: '#FF4655', playerCount: '5人' },
  { id: 'fortnite', name: 'Fortnite', color: '#9D4DFF', playerCount: '4人' },
  { id: 'cod', name: 'Call of Duty', color: '#FF9500', playerCount: '4人' },
  { id: 'overwatch', name: 'Overwatch 2', color: '#F99E1A', playerCount: '5人' },
  { id: 'lol', name: 'League of Legends', color: '#C89B3C', playerCount: '5人' },
  { id: 'minecraft', name: 'Minecraft', color: '#62B47A', playerCount: '∞' },
  { id: 'monsterhunter', name: 'モンスターハンター', color: '#3A8FB7', playerCount: '4人' },
] as const;

// プラットフォームデータ
export const platforms = [
  { id: 'pc', name: 'PC', icon: '💻' },
  { id: 'ps', name: 'PlayStation', icon: '🎮' },
  { id: 'xbox', name: 'Xbox', icon: '🟢' },
  { id: 'switch', name: 'Switch', icon: '🔴' },
  { id: 'mobile', name: 'Mobile', icon: '📱' },
] as const;

export type Game = typeof games[number];
export type Platform = typeof platforms[number];

// 募集データ型
export type Recruitment = {
  id: number;
  game: string;
  gameColor: string;
  title: string;
  platform: string;
  currentPlayers: number;
  maxPlayers: number;
  rank: string;
  voiceChat: boolean;
  createdAt: string;
  author: string;
};

// ダミー募集データ
export const recruitments: Recruitment[] = [
  {
    id: 1,
    game: 'Apex Legends',
    gameColor: '#DA292A',
    title: 'ランクマッチ @2 ダイヤ目指したい！',
    platform: 'PC',
    currentPlayers: 1,
    maxPlayers: 3,
    rank: 'プラチナ4',
    voiceChat: true,
    createdAt: '5分前',
    author: 'GamerX_123',
  },
  {
    id: 2,
    game: 'VALORANT',
    gameColor: '#FF4655',
    title: 'カジュアル楽しくやりましょう',
    platform: 'PC',
    currentPlayers: 3,
    maxPlayers: 5,
    rank: 'シルバー',
    voiceChat: true,
    createdAt: '12分前',
    author: 'ValorantLover',
  },
  {
    id: 3,
    game: 'モンスターハンター',
    gameColor: '#3A8FB7',
    title: '傀異討究Lv300↑ 周回メンバー募集',
    platform: 'PlayStation',
    currentPlayers: 2,
    maxPlayers: 4,
    rank: 'MR999',
    voiceChat: false,
    createdAt: '23分前',
    author: 'Hunter_Ace',
  },
  {
    id: 4,
    game: 'Fortnite',
    gameColor: '#9D4DFF',
    title: 'デュオ・スクワッド @1〜3 エンジョイ勢',
    platform: 'PlayStation',
    currentPlayers: 1,
    maxPlayers: 4,
    rank: 'チャンピオン',
    voiceChat: true,
    createdAt: '31分前',
    author: 'FN_Builder99',
  },
  {
    id: 5,
    game: 'Overwatch 2',
    gameColor: '#F99E1A',
    title: 'クイックプレイ @2 タンク/サポート希望',
    platform: 'PC',
    currentPlayers: 3,
    maxPlayers: 5,
    rank: 'ダイヤ',
    voiceChat: true,
    createdAt: '45分前',
    author: 'OW_Healer',
  },
  {
    id: 6,
    game: 'Call of Duty',
    gameColor: '#FF9500',
    title: 'Warzone ランク @3 VC必須',
    platform: 'Xbox',
    currentPlayers: 1,
    maxPlayers: 4,
    rank: 'クリムゾン',
    voiceChat: true,
    createdAt: '1時間前',
    author: 'COD_Sniper',
  },
];

