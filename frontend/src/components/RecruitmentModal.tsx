'use client'

import { Game, User } from '@/types/profile'
import { useState } from 'react'
import { Modal } from './Modal'
import { API_ENDPOINTS } from '@/lib/api'


type RecruitmentModalProps = {
    isOpen: boolean,
    onClose: () => void,
    games: Game[],
    user: User | null,
}

export function RecruitmentModal({ isOpen, onClose, games, user }: RecruitmentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const data = Object.fromEntries(new FormData(e.currentTarget).entries());

            // バリデーション
            if (!data.title) {
                throw new Error('タイトルを入力してください');
            }
            if (!data.max_slots || isNaN(Number(data.max_slots)) || Number(data.max_slots) < 2) {
                throw new Error('最大人数は2以上の数字を入力してください');
            }

            const response = await fetch(API_ENDPOINTS.discordCreateRecruitment, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game: Number(data.game),
                    title: data.title,
                    rank: data.rank || '',
                    max_slots: Number(data.max_slots),
                    discord_owner_id: user?.discord_id,
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '募集の作成に失敗しました');
            }

            console.log('募集作成成功:', result);
            setSuccess(true);

            // 2秒後にモーダルを閉じる
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : '募集の作成に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="募集する">
            <div className="flex flex-col gap-4">
                {success ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">✅</div>
                        <p className="text-green-400 text-lg font-bold">募集を作成しました！</p>
                        <p className="text-gray-400 text-sm mt-2">Discordに投稿されます</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">ゲーム</label>
                            <select
                                name="game"
                                className="w-full bg-[#1a1c24] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--gaming-accent)]"
                            >
                                {games.map((game) => (
                                    <option key={game.id} value={game.id}>
                                        {game.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">タイトル <span className="text-red-400">*</span></label>
                            <input
                                name="title"
                                type="text"
                                maxLength={20}
                                placeholder="例: ギスギスなし！"
                                className="w-full bg-[#1a1c24] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--gaming-accent)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">ランク条件</label>
                            <input
                                name="rank"
                                type="text"
                                maxLength={10}
                                placeholder="例: ダイヤ↑"
                                className="w-full bg-[#1a1c24] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--gaming-accent)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">最大人数（自分含む） <span className="text-red-400">*</span></label>
                            <input
                                name="max_slots"
                                type="number"
                                min={2}
                                max={10}
                                defaultValue={3}
                                className="w-full bg-[#1a1c24] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--gaming-accent)]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-[var(--gaming-accent)] hover:bg-[var(--gaming-accent)]/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-black transition-all"
                        >
                            {isLoading ? '作成中...' : '募集を作成'}
                        </button>
                    </form>
                )}
            </div>
        </Modal>

    )
}