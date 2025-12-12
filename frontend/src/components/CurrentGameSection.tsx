'use client';

import { DiscordRecruitment } from '@/types/discord';
import { API_ENDPOINTS } from '@/lib/api';
import { User } from '@/types/profile';
import { useState } from 'react';

type CurrentGameSectionProps = {
    myRecruitment: DiscordRecruitment | null;
    userdata: User;
};
const DEFAULT_AVATAR = 'https://marketplace.canva.com/yqbBM/MAGzZ0yqbBM/1/tl/canva-discord-logo-MAGzZ0yqbBM.png';


export function CurrentGameSection({ myRecruitment, userdata }: CurrentGameSectionProps) {

    const [leavestatus, setleavestatus] = useState(false);

    const getStatusDisplay = () => {
        if (!myRecruitment) {
            return {
                text: 'パーティに参加していません',
                color: 'text-gray-500',
                bg: 'bg-[#1a1c24]',
                borderColor: 'border-[var(--gaming-border)]',
            };
        }
        switch (myRecruitment.status) {
            case 'ongoing':
                return {
                    text: 'マッチ中',
                    color: 'text-[#e0e0e0]',
                    bg: 'bg-[var(--gaming-bg-panel)]',
                    borderColor: 'border-[var(--gaming-accent-sub)]',
                };
            case 'open':
                return {
                    text: '募集中',
                    color: 'text-[var(--gaming-accent)]',
                    bg: 'bg-[var(--gaming-bg-panel)]',
                    borderColor: 'border-[var(--gaming-accent)]',
                };
            default:
                return {
                    text: '終了',
                    color: 'text-gray-500',
                    bg: 'bg-gray-800',
                    borderColor: 'border-gray-600',
                };
        }
    }

    const exitGame = async () => {
        if (!myRecruitment) return;
        if (!confirm('募集者の場合、ルームは解散されます。本当に退出しますか？')) return;
        try {

            const res = await fetch(`${API_ENDPOINTS.discordRecruitments}${myRecruitment.id}/leave/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'discord_user_id': userdata.discord_id
                }),

            })
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }

    const statusDisplay = getStatusDisplay();

    // 空の状態用のダミーデータ
    const displayTitle = myRecruitment ? myRecruitment.title : "パーティに参加していません";
    const displayRank = myRecruitment ? myRecruitment.rank : "-";
    const displayIcon = myRecruitment ? myRecruitment.icon : DEFAULT_AVATAR;

    return (
        <div className="mt-4 mb-8 animate-slideUp">
            {/* ゲーミングパネル */}
            <div className={`gaming-panel relative overflow-hidden bg-[#15171e]/90 backdrop-blur-sm p-6 sm:p-8 ${!myRecruitment ? 'opacity-80' : ''}`}>
                {/* 装飾: 上部のライン */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${myRecruitment ? 'via-[var(--gaming-accent)]' : 'via-gray-700'} to-transparent opacity-50`} />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* 左側: ステータスとタイトル */}
                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusDisplay.color} ${statusDisplay.borderColor} ${statusDisplay.bg} bg-opacity-10 tracking-wider shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
                                {statusDisplay.text}
                            </span>
                            {myRecruitment && (
                                <img
                                    src={displayIcon}
                                    alt=""
                                    className="w-6 h-6 rounded-full opacity-80"
                                />
                            )}
                        </div>

                        <div>
                            <h2 className={`text-xl sm:text-2xl font-bold tracking-wide mb-1 ${myRecruitment ? 'text-white' : 'text-gray-400'}`}>
                                {displayTitle}
                            </h2>
                            {myRecruitment && (
                                <div className="flex items-center gap-2 text-sm text-[var(--gaming-text-sub)]">
                                    <span className="uppercase tracking-wider text-[10px] border border-[var(--gaming-border)] px-1 rounded">Rank</span>
                                    <span className="text-[var(--gaming-accent-sub)] font-medium">{displayRank || 'Any'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 右側: 参加者リスト */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-start md:justify-end">

                            {myRecruitment ? (
                                <>
                                    {/* 募集者 */}
                                    <div className="relative group" title={`Owner: ${myRecruitment.discord_owner_username}`}>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--gaming-accent)] p-0.5 shadow-[0_0_10px_rgba(0,255,136,0.3)]">
                                            <img
                                                src={myRecruitment.discord_owner_avatar || DEFAULT_AVATAR}
                                                alt={myRecruitment.discord_owner_username}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--gaming-accent)] rounded-full border-2 border-[#15171e] flex items-center justify-center">
                                            <span className="text-[8px] font-bold text-black">C</span>
                                        </div>
                                    </div>

                                    {/* 参加者 */}
                                    {myRecruitment.participants_list.map((p) => (
                                        <div key={p.discord_user_id} className="relative group" title={p.discord_username}>
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[var(--gaming-border)] p-0.5 bg-[#1a1c24]">
                                                <img
                                                    src={p.avatar || DEFAULT_AVATAR}
                                                    alt={p.discord_username}
                                                    className="w-full h-full rounded-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* 空きスロット */}
                                    {Array.from({ length: myRecruitment.max_slots - myRecruitment.current_slots }).map((_, i) => (
                                        <div key={`empty-${i}`} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[var(--gaming-border)] border-dashed flex items-center justify-center bg-[#1a1c24]/50">
                                            <div className="w-2 h-2 rounded-full bg-[var(--gaming-border)]"></div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                /* 未参加時の全空きスロット */
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={`empty-ph-${i}`} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[var(--gaming-border)] border-dashed flex items-center justify-center bg-[#1a1c24]/30 opacity-50">
                                        <div className="w-2 h-2 rounded-full bg-[var(--gaming-border)]"></div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 退出ボタン (モバイルでは下部、デスクトップでは右端) */}
                    {myRecruitment && (
                        <div className="md:ml-4 flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                            <button
                                onClick={exitGame}
                                className="w-full md:w-auto px-4 py-2 rounded border border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors text-xs uppercase tracking-widest font-bold"
                            >
                                Lose
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
