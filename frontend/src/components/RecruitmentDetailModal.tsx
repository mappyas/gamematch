'use client'

import { Modal } from './Modal';
import { DiscordRecruitment } from '@/types/discord';
import Link from 'next/link';

type RecruitmentDetailModalProps = {
    recruitment: DiscordRecruitment | null;
    isOpen: boolean;
    onClose: () => void;
}

const DEFAULT_AVATAR = 'https://cdn.discordapp.com/embed/avatars/0.png';

export function RecruitmentDetailModal({ isOpen, onClose, recruitment }: RecruitmentDetailModalProps) {
    if (!recruitment) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Recruitment Details">
            <div className="space-y-4">
                {/* ゲーム情報 */}
                <div className="flex items-center gap-3 pb-3 border-b border-[var(--gaming-border)]">
                    <img
                        src={recruitment.icon}
                        alt={recruitment.game_name}
                        className="w-10 h-10 rounded-full"
                    />
                    <span className="text-lg font-bold text-white">
                        {recruitment.game_name}
                    </span>
                </div>

                {/* 募集タイトル */}
                <div>
                    <div className="text-xs text-[var(--gaming-text-sub)] mb-1 uppercase tracking-wider">Title</div>
                    <div className="text-white font-medium">{recruitment.title}</div>
                </div>

                {/* 募集ランク */}
                <div>
                    <div className="text-xs text-[var(--gaming-text-sub)] mb-1 uppercase tracking-wider">Rank</div>
                    <div className="text-[var(--gaming-accent-sub)] font-medium">{recruitment.rank || 'Any'}</div>
                </div>

                {/* 参加状況 */}
                <div>
                    <div className="text-xs text-[var(--gaming-text-sub)] mb-1 uppercase tracking-wider">Slots</div>
                    <div className={`font-bold ${recruitment.is_full ? 'text-red-400' : 'text-[var(--gaming-accent)]'}`}>
                        {recruitment.current_slots} / {recruitment.max_slots}
                    </div>
                </div>

                {/* ステータス */}
                <div>
                    <div className="text-xs text-[var(--gaming-text-sub)] mb-1 uppercase tracking-wider">Status</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${recruitment.status === 'open' ? 'bg-[var(--gaming-accent)]/10 text-[var(--gaming-accent)] border border-[var(--gaming-accent)]' :
                        recruitment.status === 'ongoing' ? 'bg-[var(--gaming-accent-sub)]/10 text-[var(--gaming-accent-sub)] border border-[var(--gaming-accent-sub)]' :
                            recruitment.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-red-500/20 text-red-400'
                        }`}>
                        {recruitment.status === 'open' ? 'RECRUITING' :
                            recruitment.status === 'ongoing' ? 'IN MATCH' :
                                recruitment.status === 'closed' ? 'CLOSED' : 'CANCELLED'}
                    </span>
                </div>

                {/* 募集者 */}
                <div className="pt-3 border-t border-[var(--gaming-border)]">
                    <div className="text-xs text-[var(--gaming-text-sub)] mb-2 uppercase tracking-wider">Owner</div>
                    <div className="flex items-center gap-2">
                        <img
                            src={recruitment.discord_owner_avatar || DEFAULT_AVATAR}
                            alt={recruitment.discord_owner_username}
                            className="w-8 h-8 rounded-full border border-[var(--gaming-border)]"
                        />
                        <Link href={`/profile/${recruitment.discord_owner_id}`}>
                            <span className="text-white font-medium hover:text-[var(--gaming-accent)] transition-colors">{recruitment.discord_owner_username}</span>
                        </Link>
                    </div>
                </div>

                {/* 参加者リスト */}
                {recruitment.participants_list.length > 0 && (
                    <div>
                        <div className="text-xs text-[var(--gaming-text-sub)] mb-2 uppercase tracking-wider">Participants</div>
                        <div className="flex flex-wrap gap-2">
                            {recruitment.participants_list.map((participant) => (
                                <div key={participant.discord_user_id} className="flex items-center gap-2 bg-[#1a1c24] rounded-lg px-2 py-1 border border-[var(--gaming-border)]">
                                    <img
                                        src={participant.avatar || DEFAULT_AVATAR}
                                        alt={participant.discord_username}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <Link href={`/profile/${participant.discord_user_id}`}>
                                        <span className="text-sm text-[var(--gaming-text-sub)] hover:text-[var(--gaming-accent)] transition-colors">
                                            {participant.discord_username}
                                        </span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}