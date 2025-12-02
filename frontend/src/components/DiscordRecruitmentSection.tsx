'use client';

import { DiscordRecruitment } from '@/types/discord';
import { Game } from '@/types/profile';

type DiscordRecruitmentSectionProps = {
    recruitments: DiscordRecruitment[];
    selectedGame: Game;
    isLoading: boolean;
};

export function DiscordRecruitmentSection({
    recruitments,
    selectedGame,
    isLoading,
}: DiscordRecruitmentSectionProps) {
    const filteredRecruitments = recruitments.filter((r) => r.game === selectedGame.id);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-gradient">募集カード</span>
                <span className="text-sm text-gray-500">({filteredRecruitments.length}件)</span>
            </h2>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : filteredRecruitments.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-2xl">
                    <p className="text-gray-500 text-lg">{selectedGame.name}の募集はまだありません</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredRecruitments.slice(0, 3).map((recruitment) => (
                        <div
                            key={recruitment.id}
                            className="glass-card-strong rounded-2xl p-8 border border-purple-400/30 hover:border-cyan-400/60 transition-all card-hover glow-purple"
                        >
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center neon-border-purple">
                                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                    </svg>
                                </div>
                            </div>

                            {/* ゲーム名 */}
                            <div className="font-bold text-cyan-400 mb-3 text-lg text-center">{recruitment.game_name}</div>

                            {/* 募集情報 */}
                            <div className="space-y-2 mb-4">
                                <div className="text-sm text-gray-300">
                                    <span className="text-gray-500">募集タイトル：</span>
                                    <span className="font-medium">{recruitment.title}</span>
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
                                    {recruitment.discord_owner_username}
                                </div>
                            </div>

                            {/* 参加者情報 */}
                            <div>
                                <div className="text-xs text-gray-500 mb-2">参加者</div>
                                <div className="text-sm text-gray-300 min-h-[40px]">
                                    {recruitment.participants_list.length > 0
                                        ? recruitment.participants_list.map((p) => p.discord_username).join(', ')
                                        : '参加者なし'}
                                </div>
                                <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                                    <span>定員状況</span>
                                    <span className={`font-bold ${recruitment.is_full ? 'text-red-400' : 'text-cyan-400'}`}>
                                        {recruitment.current_slots}/{recruitment.max_slots}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
