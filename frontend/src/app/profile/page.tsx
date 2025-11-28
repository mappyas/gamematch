'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ProfileCard, RiotAccountCard, RecruitmentList } from '@/components/profile';
import { API_ENDPOINTS } from '@/lib/api';
import { ProfileData } from '@/types';

/**
 * プロフィールページ
 * ユーザーの基本情報、作成した募集、参加した募集を表示
 */
export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.profileDetail, {
          credentials: 'include', // ← Cookieを送信
        });

        console.log('[Profile] Response status:', response.status);

        if (response.status === 401) {
          // 未認証の場合はホームにリダイレクト
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

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー時
  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'プロフィールの取得に失敗しました'}</p>
            <Link
              href="/"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, profile, created_recruitments, participated_recruitments, riot_account } =
    profileData;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12 pt-24">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">マイページ</h1>
          <p className="text-gray-400">プロフィール情報と活動履歴</p>
        </div>

        {/* プロフィールカード */}
        <ProfileCard user={user} profile={profile} />

        {/* Riotアカウント情報 */}
        {riot_account && <RiotAccountCard riotAccount={riot_account} />}

        {/* 作成した募集 */}
        <RecruitmentList
          title="作成した募集"
          recruitments={created_recruitments}
          emptyMessage="まだ募集を作成していません"
        />

        {/* 参加した募集 */}
        <RecruitmentList
          title="参加した募集"
          recruitments={participated_recruitments}
          showOwner={true}
          emptyMessage="まだ募集に参加していません"
        />
      </div>
    </div>
  );
}
