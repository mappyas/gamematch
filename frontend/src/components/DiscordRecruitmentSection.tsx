'use client';

import { DiscordRecruitment } from '@/types/discord';
import { Game } from '@/types/profile';
import { RecruitmentDetailModal } from './RecruitmentDetailModal';
import { useState } from 'react';


type DiscordRecruitmentSectionProps = {
    recruitments: DiscordRecruitment[];
    selectedGame: Game | undefined;
    isLoading: boolean;
};
const DEFAULT_AVATAR = 'https://marketplace.canva.com/yqbBM/MAGzZ0yqbBM/1/tl/canva-discord-logo-MAGzZ0yqbBM.png';

export function DiscordRecruitmentSection({ recruitments, selectedGame, isLoading,
}: DiscordRecruitmentSectionProps) {
    const [selectedRecruitment, setSelectedRecruitment] = useState<DiscordRecruitment | null>(null);
    const filteredRecruitments = selectedGame
        ? recruitments.filter((r) => r.game === selectedGame.id)
        : [];

    return (
        <>
            <div className="animate-slideUp ">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-gradient">募集カード</span>
                    <span className="text-sm text-gray-500">({filteredRecruitments.length}件)</span>
                </h2>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-[#78A55A] border-t-transparent rounded-full animate-spin mx-auto" />
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
                                className="bg-[#1E1E1E] rounded-2xl  p-3 border transition-all card-hover glow cursor-pointer"
                                onClick={() => setSelectedRecruitment(recruitment)}
                            >
                                {/* ゲームアイコン */}
                                <div className="flex items-center justify-between gap-2 font-bold text-[#78A55A] mb-3 text-lg text-center">
                                    <img
                                        src={recruitment.icon}
                                        alt={recruitment.game_name}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span className={`font-bold ${recruitment.is_full ? 'text-red-400' : 'text-[#78A55A]'}`}>
                                        {recruitment.current_slots}/{recruitment.max_slots}
                                    </span>
                                </div>

                                {/* 募集情報 */}
                                <div className="space-y-2 mb-4">
                                    <div className="text-sm text-gray-300">
                                        <span className="text-gray-500">募集タイトル：</span>
                                        <span className="font-medium">{recruitment.title}</span>
                                    </div>
                                    <div className="text-sm text-gray-300">
                                        <span className="text-gray-500">募集ランク：</span>
                                        <span className="font-medium text-[#fafad2]">{recruitment.rank || '指定なし'}</span>
                                    </div>
                                </div>

                                {/* 募集者 */}
                                <div className="pb-2 border-b border-white/50">
                                    <div className="text-xs text-gray-500 mb-1">募集者</div>
                                    <div className="font-medium text-white flex items-center gap-2">
                                        <img
                                            src={recruitment.discord_owner_avatar || DEFAULT_AVATAR}
                                            alt={recruitment.discord_owner_username}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        {recruitment.participants_list.length > 0
                                            ? recruitment.participants_list.map((p) =>
                                                <img
                                                    key={p.discord_user_id}
                                                    src={p.avatar || DEFAULT_AVATAR}
                                                    alt={p.discord_username}
                                                    className="w-6 h-6 rounded-full"
                                                />
                                            )

                                            : '参加者なし'}

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
            <RecruitmentDetailModal
                recruitment={selectedRecruitment}
                isOpen={selectedRecruitment !== null}
                onClose={() => setSelectedRecruitment(null)}
            />

        </>
    );
}
