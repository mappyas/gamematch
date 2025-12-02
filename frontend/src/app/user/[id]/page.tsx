'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DiscordRecruitmentCard } from '@/components/DiscordRecruitmentCard';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ゲームカラーマップ
const GAME_COLORS: Record<number, string> = {
  1: '#DA292A', // Apex
  2: '#FF4655', // Valorant
  3: '#C89B3C', // LoL
  4: '#9D4DFF', // Fortnite
  5: '#F99E1A', // Overwatch
};

export default function UserProfilePage() {
  const params = useParams();
  const discordId = params.id as string;

  const [userRecruitments, setUserRecruitments] = useState<DiscordRecruitment[]>([]);
  const [participatedRecruitments, setParticipatedRecruitments] = useState<DiscordRecruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'created' | 'participated'>('created');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 全ての募集を取得
        const res = await fetch(`${API_URL}/accounts/api/discord/recruitments/`);
        const data = await res.json();
        const allRecruitments: DiscordRecruitment[] = data.recruitments || [];

        // このユーザーが作成した募集
        const created = allRecruitments.filter(
          (r) => r.discord_owner_id === discordId
        );

        // このユーザーが参加している募集
        const participated = allRecruitments.filter(
          (r) =>
            r.discord_owner_id !== discordId &&
            r.participants_list.some((p) => p.discord_user_id === discordId)
        );

        setUserRecruitments(created);
        setParticipatedRecruitments(participated);

        // ユーザー名を取得
        if (created.length > 0) {
          setUsername(created[0].discord_owner_username);
        } else if (participated.length > 0) {
          const participant = participated[0].participants_list.find(
            (p) => p.discord_user_id === discordId
          );
          if (participant) {
            setUsername(participant.discord_username);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [discordId]);

  const totalCreated = userRecruitments.length;
  const totalParticipated = participatedRecruitments.length;
  const totalActivity = totalCreated + totalParticipated;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              募集一覧に戻る
            </Link>

            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-16 w-16 bg-white/10 rounded-full mb-4" />
                <div className="h-8 w-48 bg-white/10 rounded mb-2" />
                <div className="h-4 w-32 bg-white/10 rounded" />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{username || `User ${discordId.slice(0, 8)}`}</h1>
                  <p className="text-gray-500 text-sm">Discord ID: {discordId}</p>
                </div>
              </div>
            )}
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{totalActivity}</div>
              <div className="text-xs text-gray-500">総アクティビティ</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{totalCreated}</div>
              <div className="text-xs text-gray-500">作成した募集</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{totalParticipated}</div>
              <div className="text-xs text-gray-500">参加した募集</div>
            </div>
          </div>

          {/* タブ */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'created'
                  ? 'text-white border-b-2 border-cyan-400'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              作成した募集 ({totalCreated})
            </button>
            <button
              onClick={() => setActiveTab('participated')}
              className={`px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'participated'
                  ? 'text-white border-b-2 border-purple-400'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              参加した募集 ({totalParticipated})
            </button>
          </div>

          {/* コンテンツ */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'created' ? (
            userRecruitments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500">まだ募集を作成していません</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRecruitments.map((recruitment) => (
                  <DiscordRecruitmentCard
                    key={recruitment.id}
                    recruitment={recruitment}
                    gameColor={GAME_COLORS[recruitment.game] || '#6366f1'}
                  />
                ))}
              </div>
            )
          ) : participatedRecruitments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎮</div>
              <p className="text-gray-500">まだ募集に参加していません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participatedRecruitments.map((recruitment) => (
                <DiscordRecruitmentCard
                  key={recruitment.id}
                  recruitment={recruitment}
                  gameColor={GAME_COLORS[recruitment.game] || '#6366f1'}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

