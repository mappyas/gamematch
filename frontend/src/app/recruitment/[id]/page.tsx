'use client'

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { API_ENDPOINTS } from '@/lib/api';
import { DiscordRecruitment } from '@/types/discord';
import { User } from '@/types/profile';

export default function RecruitmentDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const recruitmentId = params.id as string;
    const shouldJoin = searchParams.get('join') === 'true';

    const [recruitment, setRecruitment] = useState<DiscordRecruitment | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 募集詳細とユーザー情報を取得
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 募集詳細取得
                const recruitRes = await fetch(API_ENDPOINTS.discordRecruitmentDetail(recruitmentId));
                const recruitData = await recruitRes.json();
                setRecruitment(recruitData.recruitment);

                // ユーザー情報取得
                const userRes = await fetch(API_ENDPOINTS.me, { credentials: 'include' });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                }
            } catch (error) {
                console.error('データ取得エラー:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [recruitmentId]);

    const handleJoin = useCallback(async () => {
        if (!user) {
            alert('参加するにはログインが必要です');
            return;
        }
        if (!recruitment) return;

        if (confirm(`「${recruitment.title}」に参加しますか？`)) {
            const res = await fetch(
                API_ENDPOINTS.discordJoinRecruitment(recruitmentId),
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        discord_user_id: user.discord_id,
                        discord_username: user.discord_username
                    })
                }
            );
            const result = await res.json();
            if (res.ok) {
                alert('参加しました！');
                // 募集情報を再取得
                const recruitRes = await fetch(API_ENDPOINTS.discordRecruitmentDetail(recruitmentId));
                const recruitData = await recruitRes.json();
                setRecruitment(recruitData.recruitment);
            } else {
                alert(result.error || '参加に失敗しました');
            }
        }
    }, [user, recruitment, recruitmentId]);

    // ?join=true の場合、自動で参加ダイアログ表示
    useEffect(() => {
        if (shouldJoin && recruitment && user) {
            handleJoin();
        }
    }, [shouldJoin, recruitment, user, handleJoin]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!recruitment) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-white">募集が見つかりません</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white p-8 pt-24">
            <div className="max-w-2xl mx-auto">
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4">
                    {/* ゲーム名 */}
                    <div className="text-[var(--gaming-accent)] text-sm font-medium">{recruitment.game_name}</div>

                    {/* タイトル */}
                    <h1 className="text-2xl font-bold">{recruitment.title}</h1>

                    {/* ランク */}
                    {recruitment.rank && (
                        <div className="text-gray-400">ランク条件: {recruitment.rank}</div>
                    )}

                    {/* 参加状況 */}
                    <div className={`text-lg font-bold ${recruitment.is_full ? 'text-red-400' : 'text-[var(--gaming-accent)]'}`}>
                        参加者: {recruitment.current_slots} / {recruitment.max_slots}
                    </div>

                    {/* 募集者 */}
                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                        <span className="text-gray-400">募集者:</span>
                        <span className="text-white font-medium">{recruitment.discord_owner_username}</span>
                    </div>

                    {/* 参加ボタン */}
                    {!recruitment.is_full && recruitment.status === 'open' && (
                        <button
                            onClick={handleJoin}
                            className="w-full py-3 bg-[var(--gaming-accent)] hover:bg-[var(--gaming-accent)]/80 rounded-xl font-bold text-black transition-all"
                        >
                            参加する
                        </button>
                    )}

                    {recruitment.is_full && (
                        <div className="text-center text-red-400 font-medium">この募集は満員です</div>
                    )}
                </div>
            </div>
        </div>
    );
}