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
            <div className="animate-slideUp">
                <h2 className="text-2xl font-bold text-[#f9f3e3] mb-6 flex items-center gap-3">
                    <span className="bg-[#8b7340] px-3 py-1 rounded">📜 募集カード</span>
                    <span className="text-sm text-[#c4a35a]">({filteredRecruitments.length}件)</span>
                </h2>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-[#78A55A] border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : filteredRecruitments.length === 0 ? (
                    <div className="text-center py-16 scroll-card mt-6">
                        <p className="text-[#5a4a20] text-lg pt-4 pb-4">{selectedGame?.name ?? 'ゲーム'}の募集はまだありません</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredRecruitments.slice(0, 3).map((recruitment) => (
                            <div
                                key={recruitment.id}
                                className="scroll-card p-4 pt-6 pb-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
                                onClick={() => setSelectedRecruitment(recruitment)}
                            >
                                {/* ゲームアイコンとスロット */}
                                <div className="flex items-center justify-between gap-2 font-bold text-[#5a4a20] mb-3 text-lg text-center">
                                    <img
                                        src={recruitment.icon}
                                        alt={recruitment.game_name}
                                        className="w-8 h-8 rounded-full border-2 border-[#8b7340]"
                                    />
                                    <span className={`font-bold px-2 py-1 rounded ${recruitment.is_full ? 'text-[#d35339] bg-red-100' : 'text-[#78A55A] bg-green-100'}`}>
                                        {recruitment.current_slots}/{recruitment.max_slots}
                                    </span>
                                </div>

                                {/* 募集情報 */}
                                <div className="space-y-2 mb-4 text-[#2a2a1a]">
                                    <div className="text-sm">
                                        <span className="text-[#5a4a20]">募集タイトル：</span>
                                        <span className="font-medium text-[#1a1a1a]">{recruitment.title}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-[#5a4a20]">募集ランク：</span>
                                        <span className="font-medium text-[#d35339]">{recruitment.rank || '指定なし'}</span>
                                    </div>
                                </div>

                                {/* 募集者 */}
                                <div className="pt-2 border-t border-[#c4a35a]">
                                    <div className="text-xs text-[#5a4a20] mb-1">募集者</div>
                                    <div className="font-medium text-[#2a2a1a] flex items-center gap-2">
                                        <img
                                            src={recruitment.discord_owner_avatar || DEFAULT_AVATAR}
                                            alt={recruitment.discord_owner_username}
                                            className="w-6 h-6 rounded-full border border-[#78A55A]"
                                        />
                                        {recruitment.participants_list.length > 0
                                            ? recruitment.participants_list.map((p) =>
                                                <img
                                                    key={p.discord_user_id}
                                                    src={p.avatar || DEFAULT_AVATAR}
                                                    alt={p.discord_username}
                                                    className="w-6 h-6 rounded-full border border-[#78A55A]"
                                                />
                                            )

                                            : <span className="text-[#8b7340] text-sm">参加者なし</span>}

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
