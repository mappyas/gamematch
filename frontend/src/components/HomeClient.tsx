'use client';

import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { CurrentGameSection } from '@/components/CurrentGameSection';
import { GameImageSection } from '@/components/GameImageSection';
import { DiscordRecruitmentSection } from '@/components/DiscordRecruitmentSection';
import { Footer } from '@/components/Footer';
import { Game, User, GAMES } from '@/types/profile';
import { DiscordRecruitment } from '@/types/discord';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

type HomeClientProps = {
    initialRecruitments: DiscordRecruitment[];
    initialUser: User | null;
};

export function HomeClient({ initialRecruitments, initialUser }: HomeClientProps) {
    const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0]);
    const [recruitments, setRecruitments] = useState<DiscordRecruitment[]>(initialRecruitments);
    const [myRecruitment, setMyRecruitment] = useState<DiscordRecruitment | null>(null);
    const [user, setUser] = useState<User | null>(initialUser);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    // クライアント側でユーザー情報を取得（認証のため）
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_URL}/accounts/api/me/`, { credentials: 'include' });
                const data = await res.json();
                if (data.authenticated) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('User fetch error:', error);
            }
        };
        fetchUser();
    }, []);

    // 自分が参加中の募集を探す
    useEffect(() => {
        if (user && recruitments.length > 0) {
            const myRec = recruitments.find(
                (r: DiscordRecruitment) =>
                    r.discord_owner_id === user.discord_id ||
                    r.participants_list.some((p) => p.discord_user_id === user.discord_id)
            );
            setMyRecruitment(myRec || null);
        }
    }, [user, recruitments]);

    // WebSocket接続
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/ws/discord-recruitments/`);
        wsRef.current = ws;

        ws.onopen = () => setIsConnected(true);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'recruitment_created') {
                setRecruitments((prev) => [data.recruitment, ...prev]);
            } else if (data.type === 'recruitment_update') {
                setRecruitments((prev) =>
                    prev.map((r) => (r.id === data.recruitment.id ? data.recruitment : r))
                );
            } else if (data.type === 'recruitment_deleted') {
                setRecruitments((prev) => prev.filter((r) => r.id !== data.recruitment_id));
            }
        };
        ws.onerror = () => setIsConnected(false);
        ws.onclose = () => setIsConnected(false);

        return () => ws.close();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <Navbar games={GAMES} selectedGame={selectedGame} onGameSelect={setSelectedGame} />

            <main className="pt-28 pb-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* 現在参加中のゲームバナー */}
                    {myRecruitment && <CurrentGameSection myRecruitment={myRecruitment} />}

                    {/* ゲームトップ画像エリア */}
                    <GameImageSection />

                    {/* 募集カード一覧 */}
                    <DiscordRecruitmentSection
                        recruitments={recruitments}
                        selectedGame={selectedGame}
                        isLoading={isLoading}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
