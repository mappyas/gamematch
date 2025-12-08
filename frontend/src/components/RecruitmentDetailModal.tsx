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
        <Modal isOpen={isOpen} onClose={onClose} title="募集詳細">
            <div className="space-y-4">
                {/* ゲーム情報 */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
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
                    <div className="text-xs text-gray-500 mb-1">募集タイトル</div>
                    <div className="text-white font-medium">{recruitment.title}</div>
                </div>

                {/* 募集ランク */}
                <div>
                    <div className="text-xs text-gray-500 mb-1">募集ランク</div>
                    <div className="text-purple-400 font-medium">{recruitment.rank || '指定なし'}</div>
                </div>

                {/* 参加状況 */}
                <div>
                    <div className="text-xs text-gray-500 mb-1">参加状況</div>
                    <div className={`font-bold ${recruitment.is_full ? 'text-red-400' : 'text-cyan-400'}`}>
                        {recruitment.current_slots} / {recruitment.max_slots}人
                    </div>
                </div>

                {/* ステータス */}
                <div>
                    <div className="text-xs text-gray-500 mb-1">ステータス</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${recruitment.status === 'open' ? 'bg-green-500/20 text-green-400' :
                        recruitment.status === 'ongoing' ? 'bg-cyan-500/20 text-cyan-400' :
                            recruitment.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-red-500/20 text-red-400'
                        }`}>
                        {recruitment.status === 'open' ? '募集中' :
                            recruitment.status === 'ongoing' ? '進行中' :
                                recruitment.status === 'closed' ? '終了' : 'キャンセル'}
                    </span>
                </div>

                {/* 募集者 */}
                <div className="pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-500 mb-2">募集者</div>
                    <div className="flex items-center gap-2">
                        <img
                            src={recruitment.discord_owner_avatar || DEFAULT_AVATAR}
                            alt={recruitment.discord_owner_username}
                            className="w-8 h-8 rounded-full"
                        />
                        <Link href={`/profile/${recruitment.discord_owner_id}`}>
                            <span className="text-white font-medium">{recruitment.discord_owner_username}</span>
                        </Link>
                    </div>
                </div>

                {/* 参加者リスト */}
                {recruitment.participants_list.length > 0 && (
                    <div>
                        <div className="text-xs text-gray-500 mb-2">参加者</div>
                        <div className="flex flex-wrap gap-2">
                            {recruitment.participants_list.map((participant) => (
                                <div key={participant.discord_user_id} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                                    <img
                                        src={participant.avatar || DEFAULT_AVATAR}
                                        alt={participant.discord_username}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <Link href={`/profile/${participant.discord_user_id}`}>
                                        <span className="text-sm text-gray-300 hover:text-cyan-400">
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