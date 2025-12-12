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
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-[var(--gaming-accent)]">●</span>
                    <span>募集一覧</span>
                    <span className="text-sm text-[var(--gaming-text-sub)]">({filteredRecruitments.length})</span>
                </h2>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-[var(--gaming-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : filteredRecruitments.length === 0 ? (
                    <div className="text-center py-16 gaming-panel bg-[#1a1c24]/50">
                        <p className="text-[var(--gaming-text-sub)] text-lg">{selectedGame?.name ?? 'this game'}の募集は現在ありません</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredRecruitments.slice(0, 3).map((recruitment) => (
                            <div
                                key={recruitment.id}
                                className="border bg-[#1a1c24]/50 gaming-card p-5 cursor-pointer rounded-lg relative overflow-hidden group"
                                onClick={() => setSelectedRecruitment(recruitment)}
                            >
                                {/* カード上部のアクセントライン */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gaming-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* ゲームアイコンとスロット */}
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={recruitment.icon}
                                            alt={recruitment.game_name}
                                            className="w-8 h-8 rounded-full bg-[#15171e]"
                                        />
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${recruitment.is_full ? 'text-red-400 border-red-900 bg-red-900/10' : 'text-[var(--gaming-accent)] border-[var(--gaming-accent)] bg-[var(--gaming-accent)]/10'}`}>
                                            {recruitment.current_slots}/{recruitment.max_slots}
                                        </span>
                                    </div>
                                    <span className="text-xs text-[var(--gaming-text-sub)] bg-[#15171e] px-2 py-1 rounded">
                                        {recruitment.rank || 'Any'}
                                    </span>
                                </div>

                                {/* 募集情報 */}
                                <div className="space-y-1 mb-4">
                                    <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-[var(--gaming-accent)] transition-colors">{recruitment.title}</h3>
                                    <p className="text-xs text-[var(--gaming-text-sub)]">Hosted by {recruitment.discord_owner_username}</p>
                                </div>

                                {/* 参加者プレビュー */}
                                <div className="flex items-center gap-1 pt-3 border-t border-[var(--gaming-border)]">
                                    <img
                                        src={recruitment.discord_owner_avatar || DEFAULT_AVATAR}
                                        alt={recruitment.discord_owner_username}
                                        className="w-6 h-6 rounded-full border border-[var(--gaming-border)]"
                                    />
                                    {recruitment.participants_list.slice(0, 4).map((p) => (
                                        <img
                                            key={p.discord_user_id}
                                            src={p.avatar || DEFAULT_AVATAR}
                                            alt={p.discord_username}
                                            className="w-6 h-6 rounded-full border border-[var(--gaming-border)]"
                                        />
                                    ))}
                                    {recruitment.participants_list.length > 4 && (
                                        <span className="text-xs text-[var(--gaming-text-sub)] ml-1">+{recruitment.participants_list.length - 4}</span>
                                    )}
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
