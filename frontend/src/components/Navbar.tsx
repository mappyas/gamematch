'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthModal } from './AuthModal';
import { API_ENDPOINTS } from '@/lib/api';

type User = {
  id: number;
  discord_id: string;
  discord_username: string;
  avatar: string | null;
  is_profile_complete: boolean;
};

type Game = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  color: string;
  bannerUrl: string;
};

type NavbarProps = {
  games?: Game[];
  selectedGame?: Game;
  onGameSelect?: (game: Game) => void;
};

export function Navbar({ games = [], selectedGame, onGameSelect }: NavbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.me, {
          credentials: 'include',
        });
        const data = await response.json();

        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(API_ENDPOINTS.logout, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* ロゴ */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-2xl text-white neon-border transition-transform group-hover:scale-105">
                  PF
                </div>
                <span className="text-white font-bold text-xl hidden sm:block">ロゴ</span>
              </div>
            </Link>

            {/* ゲームタブ（中央） */}
            {games.length > 0 && (
              <div className="flex-1 mx-6">
                <div className="flex flex-wrap justify-center gap-3">
                  {games.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => onGameSelect?.(game)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedGame?.id === game.id
                        ? 'glass-card-strong text-white border-2 border-cyan-400/60 glow'
                        : 'glass-card text-gray-400 hover:text-white border border-white/20 hover:border-cyan-400/40 hover:glow'
                        }`}
                    >
                      {game.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 右側: ログイン */}
            <div className="flex-shrink-0">
              {isLoading ? (
                <div className="w-28 h-10 bg-white/10 rounded-lg animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.discord_username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500" />
                    )}
                    <span className="text-sm text-gray-300 hidden sm:block">
                      {user.discord_username}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 text-sm bg-[#5865F2] hover:bg-[#4752C4] rounded-lg font-bold text-white transition-all flex items-center gap-2 glow-purple-strong shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  DISCORD ログイン
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
