'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { API_ENDPOINTS } from '@/lib/api';
import { User } from '@/types/profile';
import { CurrentGameSection } from '@/components/CurrentGameSection';
import { DiscordRecruitment } from '@/types/discord';



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
  const [myRecruitment, setMyRecruitment] = useState<DiscordRecruitment | null>(null);
  const [recruitments, setRecruitments] = useState<DiscordRecruitment[]>([]);

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

  useEffect(() => {
    const fetchRecruitments = async () => {
      const response = await fetch(API_ENDPOINTS.discordRecruitments)
      const data = await response.json()
      setRecruitments(data.recruitments)
    }
    fetchRecruitments()
  }, [])

  useEffect(() => {
    if (profileData?.user && recruitments.length > 0) {
      const myRec = recruitments.find(
        (r) => r.discord_owner_id === profileData.user.discord_id ||
          r.participants_list.some((p) => p.discord_user_id === profileData.user.discord_id)
      );
      setMyRecruitment(myRec || null);
    }
  }, [profileData?.user, recruitments]);

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
                  {profileData.user.avatar ? (
                    <img src={profileData.user.avatar} alt={profileData.user.discord_username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl text-white font-bold">{profileData.user.discord_username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* ユーザー情報 */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2 text-gradient">プレイヤー名</h1>
                <p className="text-gray-300 text-lg mb-6">{profileData.user.discord_username}</p>
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

          {/* 現在参加中のゲーム  */}
          <div className="mb-8 animate-slideUp">
            {myRecruitment && (
              <CurrentGameSection
                myRecruitment={myRecruitment}
                userdata={profileData.user}  // ← これを追加
              />
            )}
          </div>

          {/* 募集カード */}
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
                      {profileData.user.discord_username}
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
