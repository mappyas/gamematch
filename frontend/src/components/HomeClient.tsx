'use client';

import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { CurrentGameSection } from '@/components/CurrentGameSection';
import { DiscordRecruitmentSection } from '@/components/DiscordRecruitmentSection';
import { Footer } from '@/components/Footer';
import { Game, User } from '@/types/profile';
import { DiscordRecruitment } from '@/types/discord';
import { API_ENDPOINTS } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

type HomeClientProps = {
    initialRecruitments: DiscordRecruitment[];
    initialUser: User | null;
};

export function HomeClient({ initialRecruitments, initialUser }: HomeClientProps) {
    const [selectedGame, setSelectedGame] = useState<Game | undefined>(undefined);
    const [games, setGames] = useState<Game[]>([]); // Add state for games
    const [recruitments, setRecruitments] = useState<DiscordRecruitment[]>(initialRecruitments);
    const [myRecruitment, setMyRecruitment] = useState<DiscordRecruitment | null>(null);
    const [user, setUser] = useState<User | null>(initialUser);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingGames, setIsLoadingGames] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    // クライアント側でユーザー情報を取得（認証のため）
    // 初回レンダリング時のみ実行
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(API_ENDPOINTS.me, {
                    credentials: 'include'
                });
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
                    r.status !== 'closed' &&
                    r.discord_owner_id === user.discord_id ||
                    r.participants_list.some((p) => p.discord_user_id === user.discord_id)
            );
            setMyRecruitment(myRec || null);
        }
    }, [user, recruitments]);

    //DBからゲーム一覧を取得
    useEffect(() => {
        const fetchgames = async () => {
            try {
                setIsLoadingGames(true);
                const gamelist = await fetch(`${API_URL}/accounts/api/games/`);
                const data = await gamelist.json();
                setGames(data); //DBから取得したゲーム一覧をstateに保存
                if (data.length > 0) {
                    setSelectedGame(data[0]); //最初のゲームをデフォルトで選択
                }
            } catch (error) {
                console.error('Games fetch error:', error);
            } finally {
                setIsLoadingGames(false);
            }
        }
        fetchgames();
    }, []);

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

    if (isLoadingGames) {
        return <div>Loading...</div>;
    }
    console.log(myRecruitment);
    console.log(user);
    return (
        <div className="min-h-screen text-white relative flex flex-col">
            {/* 背景画像（selectedGameの画像） */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: selectedGame?.bannerUrl
                        ? `url(${selectedGame.bannerUrl})`
                        : 'linear-gradient(180deg, #0f1115 0%, #1a1a20 100%)'
                }}
            >
                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>

            {/* ナビゲーションバー props*/}
            <Navbar games={games} selectedGame={selectedGame} onGameSelect={setSelectedGame} />

            <main className="relative z-10 pt-28 pb-12 flex-grow">
                <div className="max-w-6xl mx-auto px-4">
                    {/* 現在参加中のゲームバナー（参加していなくても表示） */}
                    {user && <CurrentGameSection myRecruitment={myRecruitment} userdata={user} />}

                    {/* 募集カード一覧 */}
                    <DiscordRecruitmentSection
                        key={`recruitment-${selectedGame?.id}`}
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
