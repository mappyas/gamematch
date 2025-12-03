'use client';

import { DiscordRecruitment } from '@/types/discord';
import { Game } from '@/types/profile';

type DiscordRecruitmentSectionProps = {
    recruitments: DiscordRecruitment[];
    selectedGame: Game | undefined;
    isLoading: boolean;
};

export function DiscordRecruitmentSection({ recruitments, selectedGame, isLoading,
}: DiscordRecruitmentSectionProps) {
    const filteredRecruitments = selectedGame
        ? recruitments.filter((r) => r.game === selectedGame.id)
        : [];

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
                    <p className="text-gray-500 text-lg">{selectedGame?.name ?? 'ゲーム'}の募集はまだありません</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredRecruitments.slice(0, 3).map((recruitment) => (
                        <div
                            key={recruitment.id}
                            className="glass-card-strong rounded-2xl p-8 border border-purple-400/30 hover:border-cyan-400/60 transition-all card-hover glow-purple"
                        >
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
