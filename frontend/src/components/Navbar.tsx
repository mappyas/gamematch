'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { API_ENDPOINTS } from '@/lib/api';
import { User, Game } from '@/types/profile'

const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

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
  const [isRecruitmentModalOpen, setIsRecruitmentModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleLogin = () => {
    setIsModalOpen(true);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[var(--gaming-border)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* ロゴ - シンプルテキスト */}
          <Link href="/" className="flex-shrink-0 group">
            <span className="text-2xl font-bold tracking-tight text-[var(--gaming-text-main)] group-hover:text-[var(--gaming-accent)] transition-colors">
              Matcha.gg
            </span>
          </Link>

          {/* ゲームタブ（デスクトップ）- シンプルサークル */}
          {games.length > 0 && (
            <div className="hidden md:flex flex-1 mx-6">
              <div className="flex flex-wrap justify-center gap-3">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => onGameSelect?.(game)}
                    className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center border
                        ${selectedGame?.id === game.id
                        ? 'border-[var(--gaming-accent)] bg-[var(--gaming-accent)]/10 shadow-[0_0_10px_rgba(0,255,136,0.2)] scale-105'
                        : 'border-[var(--gaming-border)] bg-[#15171e] hover:border-[var(--gaming-accent)] hover:bg-[#1a1c24]'
                      }`}
                  >
                    <img
                      src={game.icon}
                      alt={game.name}
                      className="w-6 h-6 rounded-full"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 右側メニュー（ログイン/ユーザー） */}
          <div className="flex items-center gap-4">
            {/* 募集するボタン（デスクトップ） */}
            <button
              onClick={() => setIsRecruitmentModalOpen(true)}
              className="hidden md:flex items-center gap-2 gaming-button px-5 py-2 rounded-full text-sm shadow-md"
            >
              <span>募集する</span>
            </button>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[var(--gaming-text-sub)] hover:text-[var(--gaming-text-main)] transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* ユーザーメニュー */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 pl-4 border-l border-[var(--gaming-border)] transition-opacity hover:opacity-80"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-[var(--gaming-text-main)]">{user.discord_username}</div>
                    <div className="text-xs text-[var(--gaming-accent)]">Online</div>
                  </div>
                  <img
                    src={user.avatar || DEFAULT_AVATAR}
                    alt={user.discord_username}
                    className={`w-9 h-9 rounded-full border border-[var(--gaming-border)] ${showUserMenu ? 'ring-2 ring-[var(--gaming-accent)]' : ''}`}
                  />
                </button>

                {/* ドロップダウンメニュー */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 gaming-panel z-50 py-1 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-[var(--gaming-border)] sm:hidden">
                        <div className="text-sm font-bold text-[var(--gaming-text-main)]">{user.discord_username}</div>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-[var(--gaming-text-sub)] hover:text-[var(--gaming-text-main)] hover:bg-[#1a1c24]"
                      >
                        プロフィール
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#1a1c24]"
                      >
                        ログアウト
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 gaming-button-outline px-4 py-2 rounded-lg text-sm font-bold ml-2"
              >
                <img src="/discord-icon.svg" alt="" className="w-5 h-5" />
                <span>ログイン</span>
              </button>
            )}
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--gaming-border)] animate-slideUp">
            {/* ゲーム選択（モバイル） */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-[var(--gaming-text-sub)] uppercase px-2">Games</div>
              <div className="flex flex-wrap gap-2 px-2">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      onGameSelect?.(game);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors w-full
                      ${selectedGame?.id === game.id
                        ? 'bg-[var(--gaming-accent)]/10 text-[var(--gaming-accent)] border border-[var(--gaming-accent)]'
                        : 'text-[var(--gaming-text-sub)] hover:bg-[#1a1c24] border border-transparent'
                      }`}
                  >
                    <img src={game.icon} alt="" className="w-5 h-5 rounded-full" />
                    <span>{game.name}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-[var(--gaming-border)] px-2">
                <button
                  onClick={() => {
                    setIsRecruitmentModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full gaming-button py-2 rounded-lg text-sm flex items-center justify-center gap-2 mb-3"
                >
                  <span>募集を作成する</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* 募集モーダル - 一時的に無効化またはコメントアウト */}
      {/* 
            <RecruitmentModal
                isOpen={isRecruitmentModalOpen}
                onClose={() => setIsRecruitmentModalOpen(false)}
                games={games}
                user={user}
            /> 
            */}
    </nav>
  );
}
