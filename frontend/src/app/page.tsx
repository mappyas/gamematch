import { HomeClient } from '@/components/HomeClient';
import { DiscordRecruitment } from '@/types/discord';
import { User } from '@/types/profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const dynamic = 'force-dynamic';

// サーバーサイドでデータフェッチ
async function getInitialData() {
  try {
    // 募集一覧を取得
    const recruitmentsRes = await fetch(`${API_URL}/accounts/api/discord/recruitments/`, {
      cache: 'no-store', // 常に最新データを取得
    });
    const recruitmentsData = await recruitmentsRes.json();
    const recruitments: DiscordRecruitment[] = recruitmentsData.recruitments || [];

    // ユーザー情報は認証が必要なのでクライアント側で取得
    // SSRではcookieが必要なため、ここではnullを返す
    const user: User | null = null;

    return { recruitments, user };
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    return { recruitments: [], user: null };
  }
}

// サーバーコンポーネント
export default async function HomePage() {
  const { recruitments, user } = await getInitialData();

  return <HomeClient initialRecruitments={recruitments} initialUser={user} />;
}
