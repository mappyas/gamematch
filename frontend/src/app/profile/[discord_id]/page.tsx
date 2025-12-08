'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { User } from '@/types/profile';
import { getUserProfileUrl } from '@/lib/api';

type Props = {
    params: Promise<{ discord_id: string }>;
}

type MatchedUser = {
    discord_user_id: string;
    discord_username: string;
    match_count: number;
    last_matched_at: string;
};

type ProfileData = {
    user: User;
    profile: any;
    created_recruitments: any[];
    participated_recruitments: any[];
    riot_account: any;
    matched_users?: MatchedUser[];
};

export default function UserProfilePage({ params }: Props) {
    const { discord_id } = use(params);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(getUserProfileUrl(discord_id), {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('プロフィールの取得に失敗しました');
                }

                const data = await response.json();
                setProfileData(data);
            } catch (err) {
                setError('プロフィールの取得に失敗しました');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [discord_id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f]">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen bg-[#0a0a0f]">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <p className="text-red-400 mb-4">{error || 'プロフィールの取得に失敗しました'}</p>
                        <Link href="/" className="px-4 py-2 bg-cyan-500 text-white rounded-lg">
                            ホームに戻る
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <Navbar />

            <main className="pt-28 pb-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* プロフィールカード - TOP.jpeg通り */}
                    <div className="glass-card-strong rounded-2xl p-8 mb-8 glow-strong animate-fadeIn">
                        <div className="flex items-center gap-8">
                            {/* アバター */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden neon-border animate-pulse-slow">
                                    {profileData.user.avatar ? (
                                        <img src={profileData.user.avatar} alt={profileData.user.discord_username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl text-white font-bold">{profileData.user.discord_username.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                            </div>

                            {/* ユーザー情報 */}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white mb-2 text-gradient">プレイヤー名</h1>
                                <p className="text-gray-300 text-lg mb-6">{profileData.user.discord_username}</p>
                                <p className="text-amber-400 text-sm mb-6 flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span>高評価: xx</span>
                                </p>

                                <div className="flex gap-4">
                                    <button className="px-6 py-3 glass-card hover:glass-card-strong rounded-full text-sm text-gray-200 transition-all border border-cyan-400/30 hover:border-cyan-400/60 hover:glow">
                                        プラットフォーム
                                    </button>
                                    <button className="px-6 py-3 glass-card hover:glass-card-strong rounded-full text-sm text-gray-200 transition-all border border-purple-400/30 hover:border-purple-400/60 hover:glow-purple">
                                        プレイスタイル
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
