'use client';

import { Recruitment } from '@/types';
import { PLATFORM_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/constants';

type RecruitmentCardProps = {
  recruitment: Recruitment;
  variant?: 'compact' | 'detailed';
  showOwner?: boolean;
  onCardClick?: (recruitment: Recruitment) => void;
};

/**
 * 相対時間をフォーマットする（例: "3分前", "1時間前"）
 */
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

/**
 * 募集カードコンポーネント
 * トップページ（compact）とプロフィールページ（detailed）で使用される共通コンポーネント
 *
 * @param variant - 'compact': トップページ用のリッチなデザイン, 'detailed': プロフィール用の詳細表示
 */
export function RecruitmentCard({
  recruitment,
  variant = 'compact',
  showOwner = true,
  onCardClick,
}: RecruitmentCardProps) {
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(recruitment);
    }
  };

  // Compact バリアント（トップページ用）
  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        className={`group relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02] ${
          onCardClick ? 'cursor-pointer' : ''
        }`}
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
          <span className="text-xs text-gray-500">
            {formatTimeAgo(recruitment.created_at)}
          </span>
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {recruitment.title}
        </h3>

        {/* 情報タグ */}
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

        {/* フッター - 参加者アイコン */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center">
            {/* オーナーアイコン（王冠付き） */}
            {recruitment.owner && (
              <div className="relative" title={recruitment.owner.discord_username}>
                {recruitment.owner.avatar ? (
                  <img
                    src={recruitment.owner.avatar}
                    alt={recruitment.owner.discord_username}
                    className="w-8 h-8 rounded-full border-2 border-yellow-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 border-2 border-yellow-500" />
                )}
                <span className="absolute -top-1 -right-1 text-xs">👑</span>
              </div>
            )}

            {/* 参加者アイコン（重ねて表示） */}
            {recruitment.participants && recruitment.participants.length > 0 && (
              <div className="flex -space-x-2 ml-2">
                {recruitment.participants.slice(0, 4).map((participant) => (
                  <div key={participant.id} title={participant.discord_username}>
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant.discord_username}
                        className="w-7 h-7 rounded-full border-2 border-gray-800"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-gray-800" />
                    )}
                  </div>
                ))}
                {/* 残り人数表示（5人以上の場合） */}
                {recruitment.participants.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-300">
                    +{recruitment.participants.length - 4}
                  </div>
                )}
              </div>
            )}

            {/* 空きスロット表示 */}
            {(() => {
              const emptySlots = recruitment.max_players - recruitment.current_players;
              if (emptySlots > 0 && emptySlots <= 3) {
                return (
                  <div className="flex -space-x-2 ml-2">
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="w-7 h-7 rounded-full border-2 border-dashed border-gray-600 bg-gray-800/50"
                      />
                    ))}
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* 人数カウント */}
          <div className="flex items-center gap-1 text-sm">
            <span className="text-cyan-400 font-bold">
              {recruitment.current_players}
            </span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">{recruitment.max_players}</span>
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

  // Detailed バリアント（プロフィールページ用）
  return (
    <div
      className={`bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-colors ${
        onCardClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h4 className="text-lg font-bold">{recruitment.title}</h4>

            {/* ゲームバッジ */}
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: `${recruitment.game.color}20`,
                color: recruitment.game.color,
              }}
            >
              {recruitment.game.name}
            </span>

            {/* ステータスバッジ */}
            {recruitment.status && (
              <span
                className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[recruitment.status]}`}
              >
                {STATUS_LABELS[recruitment.status] || recruitment.status}
              </span>
            )}
          </div>

          {/* 説明 */}
          {recruitment.description && (
            <p className="text-gray-400 text-sm mb-2 line-clamp-2">
              {recruitment.description}
            </p>
          )}

          {/* 募集者情報（参加した募集の場合のみ表示） */}
          {showOwner && recruitment.owner && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-400">募集者:</span>
              {recruitment.owner.avatar ? (
                <img
                  src={recruitment.owner.avatar}
                  alt={recruitment.owner.discord_username}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500" />
              )}
              <span className="text-sm">{recruitment.owner.discord_username}</span>
            </div>
          )}
        </div>
      </div>

      {/* メタ情報 */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
        <span>
          プラットフォーム:{' '}
          {PLATFORM_LABELS[recruitment.platform] || recruitment.platform}
        </span>
        <span>
          参加者: {recruitment.current_players}/{recruitment.max_players}
        </span>
        {recruitment.rank && <span>ランク: {recruitment.rank}</span>}
        {recruitment.voice_chat && (
          <span className="text-cyan-400">🎤 ボイスチャット必須</span>
        )}

        {/* 参加日時（参加した募集の場合） */}
        {recruitment.joined_at && (
          <span className="text-cyan-400">
            参加日時: {new Date(recruitment.joined_at).toLocaleString('ja-JP')}
          </span>
        )}

        {/* 作成日時（作成した募集の場合） */}
        {!recruitment.joined_at && (
          <span className="text-gray-500">
            {new Date(recruitment.created_at).toLocaleString('ja-JP')}
          </span>
        )}
      </div>
    </div>
  );
}
