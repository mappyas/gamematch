'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { API_ENDPOINTS } from '@/lib/api';

type User = {
  id: number;
  discord_id: string;
  discord_username: string;
  avatar: string | null;
};

type MatchedUser = {
  discord_user_id: string;
  discord_username: string;
  match_count: number;
  last_matched_at: string;
};

type ProfileData = {
  user: User;
  profile: any;
  created_recruitments: any[];
  participated_recruitments: any[];
  riot_account: any;
  matched_users?: MatchedUser[];
};

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.profileDetail, {
          credentials: 'include',
        });

        if (response.status === 401) {
          router.push('/');
          return;
        }

        if (!response.ok) {
          throw new Error(`プロフィールの取得に失敗しました (${response.status})`);
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'プロフィールの取得に失敗しました'}</p>
            <Link href="/" className="px-4 py-2 bg-cyan-500 text-white rounded-lg">
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, matched_users = [] } = profileData;

  // ダミーデータ（後でAPIから取得）
  const dummyMatchedUsers: MatchedUser[] = [
    { discord_user_id: '1', discord_username: 'Player1', match_count: 15, last_matched_at: '2025-12-01' },
    { discord_user_id: '2', discord_username: 'Player2', match_count: 12, last_matched_at: '2025-12-01' },
    { discord_user_id: '3', discord_username: 'Player3', match_count: 8, last_matched_at: '2025-11-30' },
    { discord_user_id: '4', discord_username: 'Player4', match_count: 5, last_matched_at: '2025-11-29' },
    { discord_user_id: '5', discord_username: 'Player5', match_count: 3, last_matched_at: '2025-11-28' },
  ];

  const displayMatchedUsers = matched_users.length > 0 ? matched_users : dummyMatchedUsers;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <main className="pt-28 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* プロフィールカード - TOP.jpeg通り */}
          <div className="glass-card-strong rounded-2xl p-8 mb-8 glow-strong animate-fadeIn">
            <div className="flex items-center gap-8">
              {/* アバター */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden neon-border animate-pulse-slow">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.discord_username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl text-white font-bold">{user.discord_username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* ユーザー情報 */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2 text-gradient">プレイヤー名</h1>
                <p className="text-gray-300 text-lg mb-6">{user.discord_username}</p>
                <p className="text-amber-400 text-sm mb-6 flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span>高評価: xx</span>
                </p>

                <div className="flex gap-4">
                  <button className="px-6 py-3 glass-card hover:glass-card-strong rounded-full text-sm text-gray-200 transition-all border border-cyan-400/30 hover:border-cyan-400/60 hover:glow">
                    プラットフォーム
                  </button>
                  <button className="px-6 py-3 glass-card hover:glass-card-strong rounded-full text-sm text-gray-200 transition-all border border-purple-400/30 hover:border-purple-400/60 hover:glow-purple">
                    プレイスタイル
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 現在参加中のゲーム - TOP.jpeg通り */}
          <div className="mb-8 animate-slideUp">
            <div className="glass-card rounded-2xl p-6 border-l-4 border-cyan-400 glow-strong">
              <p className="text-gray-300 mb-6 text-lg">
                現在参加中のゲーム：<span className="text-cyan-400 font-bold">Apex Legends</span>
                募集タイトル：<span className="text-white font-semibold">xxxxx</span>
                募集ランク：<span className="text-purple-400 font-semibold">xxxxxx</span>
              </p>

              {/* 参加者アイコン - 横一列 */}
              <div className="flex items-center gap-8 justify-center">
                {displayMatchedUsers.slice(0, 5).map((matchedUser, idx) => (
                  <div key={matchedUser.discord_user_id} className="flex flex-col items-center group">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${idx === 0 ? 'from-amber-400 to-orange-500' :
                        idx % 3 === 0 ? 'from-cyan-400 to-blue-500' :
                          idx % 3 === 1 ? 'from-purple-400 to-pink-500' :
                            'from-green-400 to-teal-500'
                      } flex items-center justify-center ${idx === 0 ? 'neon-border-purple' : 'neon-border'
                      } transition-transform group-hover:scale-110`}>
                      <span className="text-3xl text-white font-bold">
                        {matchedUser.discord_username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm mt-3 text-gray-300 font-medium">{matchedUser.discord_username}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 募集カード - TOP.jpeg通り3つ横並び */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-gradient">募集カード</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profileData.created_recruitments?.slice(0, 3).map((recruitment: any, i) => (
                <div key={recruitment.id || i} className="glass-card-strong rounded-xl p-6 border-l-4 border-cyan-400 hover:border-purple-400 transition-all card-hover glow animate-fadeIn">
                  {/* ゲーム名 */}
                  <div className="font-bold text-cyan-400 mb-3 text-lg">{recruitment.game?.name || 'ゲーム名'}</div>

                  {/* 募集情報 */}
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-300">
                      <span className="text-gray-500">募集タイトル：</span>
                      <span className="font-medium">{recruitment.title || 'タイトル'}</span>
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
                      {user.discord_username}
                    </div>
                  </div>

                  {/* 参加者情報 */}
                  <div>
                    <div className="text-xs text-gray-500 mb-2">参加者</div>
                    <div className="text-sm text-gray-300 min-h-[40px]">
                      参加者情報
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                      <span>定員状況</span>
                      <span className="font-bold text-cyan-400">
                        {recruitment.current_slots || 1}/{recruitment.max_slots || 5}
                      </span>
                    </div>
                  </div>
                </div>
              )) || [1, 2, 3].map((i) => (
                <div key={i} className="glass-card-strong rounded-xl p-6 border-l-4 border-cyan-400 hover:border-purple-400 transition-all card-hover glow animate-fadeIn">
                  <div className="font-bold text-cyan-400 mb-3 text-lg">募集カード {i}</div>
                  <div className="text-sm text-gray-400">募集情報がここに表示されます</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
