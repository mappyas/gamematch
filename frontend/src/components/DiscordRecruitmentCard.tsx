'use client'

type DiscordRecruitment = {
    id: number;
    game: number;
    game_name: string;
    title: string;
    description: string;
    discord_owner_id: string;
    discord_owner_username: string;
    max_slots: number;
    current_slots: number;
    participants_list: {discord_user_id: string; discord_username: string}[];
    status: string;
    is_full: boolean;
    created_at: string;
}

type Props = {
    recruitment: DiscordRecruitment
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

export function DiscordRecruitmentCard({recruitment}: Props) {

    const progress = (recruitment.current_slots / recruitment.max_slots) * 100;

    return (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-5 border border-white/10 hover:border-indigo-500/50 transition-all">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400">
              {recruitment.game_name}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(recruitment.created_at)}
          </span>
        </div>
  
        {/* タイトル */}
        <h3 className="text-lg font-bold mb-2 text-white">
          {recruitment.title}
        </h3>
  
        {/* 説明 */}
        {recruitment.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {recruitment.description}
          </p>
        )}
  
        {/* 募集者 */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <span className="text-gray-500">募集者:</span>
          <span className="text-white font-medium">
            👑 {recruitment.discord_owner_username}
          </span>
        </div>
  
        {/* 参加者リスト */}
        {recruitment.participants_list.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-gray-500">参加者:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {recruitment.participants_list.map((p) => (
                <span
                  key={p.discord_user_id}
                  className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300"
                >
                  {p.discord_username}
                </span>
              ))}
            </div>
          </div>
        )}
  
        {/* プログレスバー */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">参加状況</span>
            <span className="text-white font-bold">
              {recruitment.current_slots}/{recruitment.max_slots}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                recruitment.is_full ? 'bg-red-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
  
        {/* ステータス */}
        <div className="flex items-center justify-between">
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
            <span className="text-xs text-red-400">満員</span>
          )}
        </div>
      </div>
    );
  }