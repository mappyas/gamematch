'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthModal } from './AuthModal';
import { API_ENDPOINTS } from '@/lib/api';
import { User, Game } from '@/types/profile'

type NavbarProps = {
  games?: Game[];
  selectedGame?: Game;
  onGameSelect?: (game: Game) => void;
};

export function Navbar({ games = [], selectedGame, onGameSelect }: NavbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleGameSelect = (game: Game) => {
    onGameSelect?.(game);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* ロゴ - matcha-gg 手書き風 */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#f9f3e3] rounded-lg border-2 border-[#8b7340] shadow-md">
                <span className="handwritten-logo text-2xl font-bold italic tracking-wide">
                  matcha-gg.com
                </span>
              </div>
            </Link>

            {/* ゲームタブ（デスクトップ）- 墨絵風 */}
            {games.length > 0 && (
              <div className="hidden md:flex flex-1 mx-6">
                <div className="flex flex-wrap justify-center gap-3">
                  {games.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => onGameSelect?.(game)}
                      className={
                        `w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center
                          ${selectedGame?.id === game.id
                          ? 'ink-circle ring-4 ring-[#78A55A] shadow-lg scale-110'
                          : 'ink-circle hover:ring-2 hover:ring-[#78A55A]/60 hover:scale-105'
                        }`}
                    >
                      <img
                        src={game.icon}
                        alt={game.name}
                        className="w-8 h-8 rounded-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 右側: モバイルメニューボタン + ログイン */}
            <div className="flex items-center gap-3">
              {/* ハンバーガーメニューボタン（モバイル） */}
              {games.length > 0 && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg bg-[#f9f3e3] border border-[#8b7340] hover:bg-[#e8d4a0] transition-colors"
                  aria-label="メニュー"
                >
                  <svg
                    className="w-6 h-6 text-[#2a2a1a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              )}

              {/* ログインボタン */}
              <div className="flex-shrink-0">
                {isLoading ? (
                  <div className="w-28 h-10 bg-[#c4a35a]/50 rounded-lg animate-pulse" />
                ) : user ? (
                  <div className="flex items-center gap-3 bg-[#f9f3e3] px-3 py-2 rounded-lg border border-[#8b7340]">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.discord_username}
                          className="w-8 h-8 rounded-full border-2 border-[#78A55A]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#78A55A] to-[#2D4B2D]" />
                      )}
                      <span className="text-sm text-[#2a2a1a] font-medium hidden sm:block">
                        {user.discord_username}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-[#8b7340] hover:text-[#d35339] transition-colors font-medium"
                    >
                      ログアウト
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm bg-[#5865F2] hover:bg-[#4752C4] rounded-lg font-bold text-white transition-all flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    <span className="hidden sm:inline">DISCORD ログイン</span>
                    <span className="sm:hidden">ログイン</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* モバイルメニュー（ドロワー） */}
        {games.length > 0 && (
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="px-4 py-3 border-t border-[#8b7340] bg-[#c4a35a]/90">
              <p className="text-xs text-[#5a4a20] mb-3 font-medium">ゲームを選択</p>
              <div className="grid grid-cols-2 gap-2">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedGame?.id === game.id
                      ? 'bg-[#78A55A]/30 border-2 border-[#78A55A]'
                      : 'bg-[#f9f3e3]/80 border border-[#8b7340] hover:bg-[#f9f3e3]'
                      }`}
                  >
                    <img
                      src={game.icon}
                      alt={game.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-[#2a2a1a] font-medium truncate">
                      {game.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
