'use client';

import { Recruitment } from '@/types';
import { PLATFORM_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/constants';

type RecruitmentCardProps = {
  recruitment: Recruitment;
  showOwner?: boolean;
  onCardClick?: (recruitment: Recruitment) => void;
};

/**
 * 募集カードコンポーネント
 * プロフィールページや募集一覧で使用される共通コンポーネント
 */
export function RecruitmentCard({
  recruitment,
  showOwner = false,
  onCardClick,
}: RecruitmentCardProps) {
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(recruitment);
    }
  };

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
            <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[recruitment.status]}`}>
              {STATUS_LABELS[recruitment.status] || recruitment.status}
            </span>
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
          プラットフォーム: {PLATFORM_LABELS[recruitment.platform] || recruitment.platform}
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

