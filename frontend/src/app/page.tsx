'use client';

import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

// 型定義
type Game = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  color: string;
  bannerUrl: string;
};

type DiscordRecruitment = {
  id: number;
  game: number;
  game_name: string;
  title: string;
  rank: string;
  discord_owner_id: string;
  discord_owner_username: string;
  max_slots: number;
  current_slots: number;
  participants_list: { discord_user_id: string; discord_username: string }[];
  status: string;
  is_full: boolean;
  created_at: string;
};

type User = {
  id: number;
  discord_id: string;
  discord_username: string;
  avatar: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

// ゲーム一覧
const GAMES: Game[] = [
  { id: 1, slug: 'apex', name: 'Apex Legends', icon: '🎯', color: '#DA292A', bannerUrl: '' },
  { id: 2, slug: 'valorant', name: 'VALORANT', icon: '🔫', color: '#FF4655', bannerUrl: '' },
  { id: 3, slug: 'lol', name: 'League of Legends', icon: '⚔️', color: '#C89B3C', bannerUrl: '' },
  { id: 4, slug: 'fortnite', name: 'Fortnite', icon: '🏗️', color: '#9D4DFF', bannerUrl: '' },
  { id: 5, slug: 'overwatch', name: 'Overwatch 2', icon: '🦸', color: '#F99E1A', bannerUrl: '' },
  { id: 6, slug: 'minecraft', name: 'Minecraft', icon: '⛏️', color: '#62B47A', bannerUrl: '' },
];

export default function HomePage() {
  const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0]);
  const [recruitments, setRecruitments] = useState<DiscordRecruitment[]>([]);
  const [myRecruitment, setMyRecruitment] = useState<DiscordRecruitment | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // ユーザー情報取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/accounts/api/me/`, { credentials: 'include' });
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('User fetch error:', error);
      }
    };
    fetchUser();
  }, []);

  // 募集一覧を取得
  const fetchRecruitments = async () => {
    try {
      const res = await fetch(`${API_URL}/accounts/api/discord/recruitments/`);
      const data = await res.json();
      const allRecruitments = data.recruitments || [];
      setRecruitments(allRecruitments);

      // 自分が参加中の募集を探す
      if (user) {
        const myRec = allRecruitments.find(
          (r: DiscordRecruitment) =>
            r.discord_owner_id === user.discord_id ||
            r.participants_list.some((p) => p.discord_user_id === user.discord_id)
        );
        setMyRecruitment(myRec || null);
      }
    } catch (error) {
      console.error('募集取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitments();
  }, [user]);

  // WebSocket接続
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/discord-recruitments/`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'recruitment_created') {
        setRecruitments((prev) => [data.recruitment, ...prev]);
      } else if (data.type === 'recruitment_update') {
        setRecruitments((prev) =>
          prev.map((r) => (r.id === data.recruitment.id ? data.recruitment : r))
        );
      } else if (data.type === 'recruitment_deleted') {
        setRecruitments((prev) => prev.filter((r) => r.id !== data.recruitment_id));
      }
    };
    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => setIsConnected(false);

    return () => ws.close();
  }, []);

  // 選択されたゲームの募集をフィルタ
  const filteredRecruitments = recruitments.filter((r) => r.game === selectedGame.id);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar games={GAMES} selectedGame={selectedGame} onGameSelect={setSelectedGame} />

      <main className="pt-28 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* 現在参加中のゲームバナー - mypage.jpeg通り大きく強調 */}
          {myRecruitment && (
            <div className="mb-8 animate-slideUp">
              <div className="glass-card-strong rounded-2xl p-8 border-l-4 border-cyan-400 glow-purple-strong">
                <p className="text-gray-200 mb-6 text-xl font-semibold">
                  現在参加中のゲーム：<span className="text-cyan-400 font-bold text-2xl">{myRecruitment.game_name}</span>
                  募集タイトル：<span className="text-white font-bold">{myRecruitment.title}</span>
                  募集ランク：<span className="text-purple-400 font-bold">{myRecruitment.rank || '指定なし'}</span>
                </p>

                {/* 参加者アイコン - 横一列 */}
                <div className="flex items-center gap-8 justify-center">
                  {/* 募集者 */}
                  <div className="flex flex-col items-center group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center neon-border-purple transition-transform group-hover:scale-110">
                      <span className="text-3xl text-white font-bold">
                        {myRecruitment.discord_owner_username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm mt-3 text-gray-300 font-medium">{myRecruitment.discord_owner_username}</span>
                  </div>

                  {/* 参加者 */}
                  {myRecruitment.participants_list.map((p, idx) => (
                    <div key={p.discord_user_id} className="flex flex-col items-center group">
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${idx % 3 === 0 ? 'from-cyan-400 to-blue-500' :
                          idx % 3 === 1 ? 'from-purple-400 to-pink-500' :
                            'from-green-400 to-teal-500'
                        } flex items-center justify-center neon-border transition-transform group-hover:scale-110`}>
                        <span className="text-3xl text-white font-bold">
                          {p.discord_username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm mt-3 text-gray-300 font-medium">{p.discord_username}</span>
                    </div>
                  ))}

                  {/* 空きスロット */}
                  {Array.from({ length: myRecruitment.max_slots - myRecruitment.current_slots }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex flex-col items-center opacity-50">
                      <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">?</span>
                      </div>
                      <span className="text-sm mt-3 text-gray-600">ユーザー{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ゲームトップ画像エリア - mypage.jpeg通り */}
          <div className="mb-8 animate-fadeIn">
            <div className="glass-card rounded-2xl overflow-hidden glow">
              <div className="bg-gradient-to-br from-red-600/30 via-purple-600/30 to-blue-600/30 h-80 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="relative z-10 text-center">
                  <p className="text-gray-300 text-lg mb-2">各ゲームのトップ画像</p>
                  <p className="text-gray-500 text-sm">(とりあえず適当な画像で構わない、あとで差し替え)</p>
                </div>
              </div>
            </div>
          </div>

          {/* 募集カード一覧 - mypage.jpeg通り3つ大きく横並び */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-gradient">募集カード</span>
              <span className="text-sm text-gray-500">({filteredRecruitments.length}件)</span>
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredRecruitments.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <p className="text-gray-500 text-lg">{selectedGame.name}の募集はまだありません</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredRecruitments.slice(0, 3).map((recruitment) => (
                  <div
                    key={recruitment.id}
                    className="glass-card-strong rounded-2xl p-8 border border-purple-400/30 hover:border-cyan-400/60 transition-all card-hover glow-purple"
                  >
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center neon-border-purple">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      </div>
                    </div>

                    {/* ゲーム名 */}
                    <div className="font-bold text-cyan-400 mb-3 text-lg text-center">{recruitment.game_name}</div>

                    {/* 募集情報 */}
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-300">
                        <span className="text-gray-500">募集タイトル：</span>
                        <span className="font-medium">{recruitment.title}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="text-gray-500">募集ランク：</span>
                        <span className="font-medium text-purple-400">{recruitment.rank || '指定なし'}</span>
                      </div>
                    </div>

                    {/* 募集者 */}
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <div className="text-xs text-gray-500 mb-1">募集者</div>
                      <div className="font-medium text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                        {recruitment.discord_owner_username}
                      </div>
                    </div>

                    {/* 参加者情報 */}
                    <div>
                      <div className="text-xs text-gray-500 mb-2">参加者</div>
                      <div className="text-sm text-gray-300 min-h-[40px]">
                        {recruitment.participants_list.length > 0
                          ? recruitment.participants_list.map((p) => p.discord_username).join(', ')
                          : '参加者なし'}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                        <span>定員状況</span>
                        <span className={`font-bold ${recruitment.is_full ? 'text-red-400' : 'text-cyan-400'}`}>
                          {recruitment.current_slots}/{recruitment.max_slots}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
