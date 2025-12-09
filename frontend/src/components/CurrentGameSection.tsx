'use client';

import { DiscordRecruitment } from '@/types/discord';
import { API_ENDPOINTS } from '@/lib/api';
import { User } from '@/types/profile';
import { useState } from 'react';

type CurrentGameSectionProps = {
    myRecruitment: DiscordRecruitment;
    userdata: User;
};
const DEFAULT_AVATAR = 'https://marketplace.canva.com/yqbBM/MAGzZ0yqbBM/1/tl/canva-discord-logo-MAGzZ0yqbBM.png';


export function CurrentGameSection({ myRecruitment, userdata }: CurrentGameSectionProps) {

    const [leavestatus, setleavestatus] = useState(false);

    const getStatusDisplay = () => {
        switch (myRecruitment.status) {
            case 'ongoing':
                return {
                    text: '🎮 マッチ中',
                    color: 'text-[#fafad2]',
                    borderColor: 'border-[#fafad2]',
                };
            case 'open':
                return {
                    text: '📢 募集中',
                    color: 'text-[#78A55A]',
                    borderColor: 'border-[#78A55A]',
                };
            default:
                return {
                    text: '終了',
                    color: 'text-gray-400',
                    borderColor: 'border-gray-400',
                };
        }
    }

    const exitGame = async () => {
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
            const data = await res.json();
        } catch (error) {
            console.error(error);
        }
    }

    const statusDisplay = getStatusDisplay();
    return (
        <div className="mt-4 mb-4 animate-slideUp rounded-2xl bg-black/50">

            <div className={`glass-card-strong rounded-2xl p-4 sm:p-8 border-l-4 ${statusDisplay.borderColor} glow-purple-strong`}>
                {/* ステータスバッジ */}
                <div className="flex justify-center items-center gap-2 sm:gap-4 mb-4">
                    <img
                        src={myRecruitment.icon}
                        alt=""
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                    />

                    <span className={`${statusDisplay.color} font-bold text-base sm:text-xl px-2 sm:px-3 py-1 bg-white/10 rounded-full`}>
                        {statusDisplay.text}
                    </span>
                    {myRecruitment.status === 'ongoing' && (
                        <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">
                            マッチ中
                        </span>
                    )}

                </div>


                {/* 参加者アイコン - 横スクロール対応 */}
                <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                    <div className="flex items-center gap-4 sm:gap-8 justify-start sm:justify-center min-w-max">
                        {/* 募集者 */}
                        <div className="flex flex-col items-center group flex-shrink-0">
                            <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center neon-border-purple transition-transform group-hover:scale-110">
                                <img
                                    src={myRecruitment.discord_owner_avatar || DEFAULT_AVATAR}
                                    alt={myRecruitment.discord_owner_username}
                                    className="w-14 h-14 sm:w-24 sm:h-24 rounded-full"
                                />
                            </div>
                            <span className="text-xs sm:text-sm mt-2 sm:mt-3 text-gray-300 font-medium max-w-[60px] sm:max-w-none truncate">{myRecruitment.discord_owner_username}</span>
                        </div>

                        {/* 参加者 */}
                        {myRecruitment.participants_list.map((p, idx) => (
                            <div key={p.discord_user_id} className="flex flex-col items-center group flex-shrink-0">
                                <div className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${idx % 3 === 0 ? '' :
                                    idx % 3 === 1 ? 'from-purple-400 to-pink-500' :
                                        'from-green-400 to-teal-500'
                                    } flex items-center justify-center neon-border transition-transform group-hover:scale-110`}>
                                    <img
                                        src={p.avatar || DEFAULT_AVATAR}
                                        alt={p.discord_username}
                                        className="w-14 h-14 sm:w-24 sm:h-24 rounded-full"
                                    />
                                </div>
                                <span className="text-xs sm:text-sm mt-2 sm:mt-3 text-gray-300 font-medium max-w-[60px] sm:max-w-none truncate">{p.discord_username}</span>
                            </div>
                        ))}

                        {/* 空きスロット */}
                        {Array.from({ length: myRecruitment.max_slots - myRecruitment.current_slots }).map((_, i) => (
                            <div key={`empty-${i}`} className="flex flex-col items-center opacity-50 flex-shrink-0">
                                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                                    <span className="text-2xl sm:text-4xl text-gray-600">?</span>
                                </div>
                                <span className="text-xs sm:text-sm mt-2 sm:mt-3 text-gray-400">空き</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 募集情報 + 退出ボタン */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
                    <div className="text-gray-200 text-sm sm:text-lg font-semibold space-y-1 sm:space-y-0">
                        <div>
                            <span className="text-gray-400">タイトル: </span>
                            <span className="text-white font-bold">{myRecruitment.title}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">ランク: </span>
                            <span className="text-[#fafad2] font-bold">{myRecruitment.rank || '指定なし'}</span>
                        </div>
                    </div>

                    <button
                        onClick={exitGame}
                        className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors whitespace-nowrap flex-shrink-0"
                    >
                        退出
                    </button>
                </div>

            </div>
        </div>
    );
}

