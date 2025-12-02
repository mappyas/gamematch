'use client';

import Link from 'next/link';

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

type Props = {
  recruitment: DiscordRecruitment;
  gameColor?: string;
};

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

export function DiscordRecruitmentCard({
  recruitment,
  gameColor = '#6366f1',
}: Props) {
  const progress = (recruitment.current_slots / recruitment.max_slots) * 100;

  return (
    <div className="bg-[#1e1e2f] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all shadow-lg">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: `${gameColor}20`,
            color: gameColor,
          }}
        >
          {recruitment.game_name}
        </span>
        <span className="text-xs text-gray-500">
          {formatTimeAgo(recruitment.created_at)}
        </span>
      </div>

      {/* タイトル */}
      <h3 className="text-lg font-bold mb-2 text-white">
        {recruitment.title}
      </h3>

      {/* ランク条件 */}
      {recruitment.rank && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">ランク条件:</span>
          <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">
            🏆 {recruitment.rank}
          </span>
        </div>
      )}

      {/* 募集者 */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="text-gray-500">募集者:</span>
        <Link
          href={`/user/${recruitment.discord_owner_id}`}
          className="flex items-center gap-1 font-medium hover:underline transition-all"
          style={{ color: gameColor }}
        >
          <span className="text-amber-400">👑</span>
          {recruitment.discord_owner_username}
        </Link>
      </div>

      {/* 参加者リスト */}
      {recruitment.participants_list.length > 0 && (
        <div className="mb-4">
          <span className="text-xs text-gray-500 block mb-2">参加者:</span>
          <div className="flex flex-wrap gap-1">
            {recruitment.participants_list.map((p) => (
              <Link
                key={p.discord_user_id}
                href={`/user/${p.discord_user_id}`}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300 hover:text-white transition-all"
              >
                {p.discord_username}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* プログレスバー */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">参加状況</span>
          <span className="text-white font-bold">
            {recruitment.current_slots}/{recruitment.max_slots}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: recruitment.is_full ? '#ef4444' : gameColor,
            }}
          />
        </div>
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            recruitment.status === 'open'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {recruitment.status === 'open' ? '🟢 募集中' : '🔴 締切'}
        </span>

        {recruitment.is_full && (
          <span className="text-xs text-red-400 font-medium">満員</span>
        )}
      </div>
    </div>
  );
}
