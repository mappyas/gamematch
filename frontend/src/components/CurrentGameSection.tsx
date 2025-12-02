'use client';

import { DiscordRecruitment } from '@/types/discord';

type CurrentGameSectionProps = {
    myRecruitment: DiscordRecruitment;
};

export function CurrentGameSection({ myRecruitment }: CurrentGameSectionProps) {
    return (
        <div className="mb-8 animate-slideUp">
            <div className="glass-card-strong rounded-2xl p-8 border-l-4 border-cyan-400 glow-purple-strong">
                <p className="text-gray-200 mb-6 text-xl font-semibold">
                    現在参加中のゲーム：<span className="text-cyan-400 font-bold text-2xl">{myRecruitment.game_name}</span>
                    募集タイトル：<span className="text-white font-bold">{myRecruitment.title}</span>
                    募集ランク：<span className="text-purple-400 font-bold">{myRecruitment.rank || '指定なし'}</span>
                </p>

                {/* 参加者アイコン - 横一列 */}
                <div className="flex items-center gap-8 justify-center">
                    {/* 募集者 */}
                    <div className="flex flex-col items-center group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center neon-border-purple transition-transform group-hover:scale-110">
                            <span className="text-3xl text-white font-bold">
                                {myRecruitment.discord_owner_username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="text-sm mt-3 text-gray-300 font-medium">{myRecruitment.discord_owner_username}</span>
                    </div>

                    {/* 参加者 */}
                    {myRecruitment.participants_list.map((p, idx) => (
                        <div key={p.discord_user_id} className="flex flex-col items-center group">
                            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${idx % 3 === 0 ? 'from-cyan-400 to-blue-500' :
                                    idx % 3 === 1 ? 'from-purple-400 to-pink-500' :
                                        'from-green-400 to-teal-500'
                                } flex items-center justify-center neon-border transition-transform group-hover:scale-110`}>
                                <span className="text-3xl text-white font-bold">
                                    {p.discord_username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm mt-3 text-gray-300 font-medium">{p.discord_username}</span>
                        </div>
                    ))}

                    {/* 空きスロット */}
                    {Array.from({ length: myRecruitment.max_slots - myRecruitment.current_slots }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex flex-col items-center opacity-50">
                            <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                                <span className="text-4xl text-gray-600">?</span>
                            </div>
                            <span className="text-sm mt-3 text-gray-600">ユーザー{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
