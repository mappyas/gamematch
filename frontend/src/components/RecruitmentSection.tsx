'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_URL } from '@/lib/api';

type Game = {
  slug: string;
  name: string;
  color: string;
};

type Recruitment = {
  id: number;
  title: string;
  description: string;
  game: Game;
  platform: string;
  max_players: number;
  current_players: number;
  rank: string;
  voice_chat: boolean;
  owner: {
    id: number;
    discord_username: string;
    avatar: string | null;
  };
  created_at: string;
  is_full: boolean;
};

const PLATFORM_LABELS: Record<string, string> = {
  pc: 'PC',
  ps: 'PlayStation',
  xbox: 'Xbox',
  switch: 'Switch',
  mobile: 'Mobile',
  crossplay: 'クロスプレイ',
};

const platforms = [
  { id: 'pc', name: 'PC', icon: '💻' },
  { id: 'ps', name: 'PlayStation', icon: '🎮' },
  { id: 'xbox', name: 'Xbox', icon: '🟢' },
  { id: 'switch', name: 'Switch', icon: '🔴' },
  { id: 'mobile', name: 'Mobile', icon: '📱' },
];

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}

function GameFilter({ 
  games,
  selectedGame, 
  onSelect 
}: { 
  games: Game[];
  selectedGame: string | null; 
  onSelect: (game: string | null) => void;
}) {
  return (
    <section className="py-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-center text-sm font-medium text-gray-500 uppercase tracking-widest mb-8">
          ゲームで絞り込み
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {games.map((game) => (
            <button
              key={game.slug}
              onClick={() => onSelect(selectedGame === game.slug ? null : game.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGame === game.slug
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
              style={{
                boxShadow: selectedGame === game.slug ? `0 0 20px ${game.color}40` : undefined,
              }}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformFilter({ 
  selectedPlatform, 
  onSelect 
}: { 
  selectedPlatform: string | null; 
  onSelect: (platform: string | null) => void;
}) {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => onSelect(selectedPlatform === platform.id ? null : platform.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedPlatform === platform.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
              }`}
            >
              <span>{platform.icon}</span>
              {platform.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecruitmentCard({ recruitment }: { recruitment: Recruitment }) {
  return (
    <div
      className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02] cursor-pointer"
    >
      {/* ゲームタグ */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: `${recruitment.game.color}20`,
            color: recruitment.game.color,
          }}
        >
          {recruitment.game.name}
        </span>
        <span className="text-xs text-gray-500">{formatTimeAgo(recruitment.created_at)}</span>
      </div>

      {/* タイトル */}
      <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
        {recruitment.title}
      </h3>

      {/* 情報 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
          {PLATFORM_LABELS[recruitment.platform] || recruitment.platform}
        </span>
        {recruitment.rank && (
          <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
            {recruitment.rank}
          </span>
        )}
        {recruitment.voice_chat && (
          <span className="px-2 py-1 bg-green-500/10 rounded text-xs text-green-400">
            🎤 VC有り
          </span>
        )}
        {recruitment.is_full && (
          <span className="px-2 py-1 bg-red-500/10 rounded text-xs text-red-400">
            満員
          </span>
        )}
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {recruitment.owner.avatar ? (
            <img
              src={recruitment.owner.avatar}
              alt={recruitment.owner.discord_username}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500" />
          )}
          <span className="text-sm text-gray-400">{recruitment.owner.discord_username}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-cyan-400 font-bold">{recruitment.current_players}</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-400">{recruitment.max_players}</span>
          <span className="text-xs text-gray-500 ml-1">人</span>
        </div>
      </div>

      {/* ホバーエフェクト */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${recruitment.game.color}08 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

function RecruitmentList({ 
  recruitments,
  isLoading,
}: { 
  recruitments: Recruitment[];
  isLoading: boolean;
}) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            🔥 募集中のパーティ
            <span className="ml-3 text-sm font-normal text-gray-500">
              {recruitments.length}件
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recruitments.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">募集がありません</p>
            <p className="text-sm">最初の募集を作成してみましょう！</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recruitments.map((recruitment) => (
              <RecruitmentCard key={recruitment.id} recruitment={recruitment} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function RecruitmentSection() {
  const [games, setGames] = useState<Game[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ゲーム一覧を取得
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.games);
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      }
    };

    fetchGames();
  }, []);

  // 募集一覧を取得
  useEffect(() => {
    const fetchRecruitments = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedGame) params.append('game', selectedGame);
        if (selectedPlatform) params.append('platform', selectedPlatform);
        
        const url = `${API_ENDPOINTS.recruitments}?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();
        setRecruitments(data.recruitments || []);
      } catch (error) {
        console.error('Failed to fetch recruitments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecruitments();
  }, [selectedGame, selectedPlatform]);

  return (
    <>
      <GameFilter 
        games={games}
        selectedGame={selectedGame} 
        onSelect={setSelectedGame} 
      />
      <PlatformFilter 
        selectedPlatform={selectedPlatform} 
        onSelect={setSelectedPlatform} 
      />
      <RecruitmentList 
        recruitments={recruitments}
        isLoading={isLoading}
      />
    </>
  );
}
