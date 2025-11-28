import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ProfileCard, RiotAccountCard, RecruitmentList } from '@/components/profile';
import { API_ENDPOINTS } from '@/lib/api';
import { ProfileData } from '@/types';

// 動的レンダリングを強制（cookies使用のため）
export const dynamic = 'force-dynamic';

/**
 * プロフィールデータを取得する
 * サーバーサイドでCookieを使って認証情報を渡す
 */
async function getProfileData(): Promise<ProfileData> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // デバッグ: APIのURLを確認
  console.log('[Profile] API URL:', API_ENDPOINTS.profileDetail);
  console.log('[Profile] Cookie exists:', !!cookieHeader);

  try {
    const response = await fetch(API_ENDPOINTS.profileDetail, {
      headers: cookieHeader
        ? {
            Cookie: cookieHeader,
          }
        : undefined,
      cache: 'no-store',
    });

    // デバッグ: レスポンス状態を確認
    console.log('[Profile] Response status:', response.status);

    if (response.status === 401) {
      redirect('/');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Profile] Error response:', errorText);
      throw new Error(`プロフィールの取得に失敗しました (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Profile] Fetch error:', error);
    throw error;
  }
}

/**
 * プロフィールページ
 * ユーザーの基本情報、作成した募集、参加した募集を表示
 */
export default async function ProfilePage() {
  let profileData: ProfileData;

  try {
    profileData = await getProfileData();
  } catch (error) {
    console.error('Profile fetch error:', error);
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">プロフィールの取得に失敗しました</p>
          <Link
            href="/"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
          >
            ホームに戻る
          </Link>
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
