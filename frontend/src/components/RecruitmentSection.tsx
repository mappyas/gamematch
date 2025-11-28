'use client';

import { useState, useEffect, useMemo } from 'react';
import { API_ENDPOINTS } from '@/lib/api';
import { RecruitmentDetailModal } from './RecruitmentDetailModal';
import { RecruitmentCard } from './RecruitmentCard';
import { Recruitment, Game, SearchFilters } from '@/types';

const platforms = [
  { id: 'pc', name: 'PC', icon: '💻' },
  { id: 'ps', name: 'PlayStation', icon: '🎮' },
  { id: 'xbox', name: 'Xbox', icon: '🟢' },
  { id: 'switch', name: 'Switch', icon: '🔴' },
  { id: 'mobile', name: 'Mobile', icon: '📱' },
];



/**
 * 統合検索フィルターコンポーネント
 * テキスト検索、ゲーム選択、プラットフォーム選択を一つにまとめたUI
 */
function SearchFilter({
  games,
  filters,
  onFiltersChange,
}: {
  games: Game[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}) {
  const { searchQuery, selectedGame, selectedPlatform } = filters;

  // 選択中のゲーム情報を取得
  const selectedGameData = games.find((g) => g.slug === selectedGame);
  const selectedPlatformData = platforms.find((p) => p.id === selectedPlatform);

  // フィルターがアクティブかどうか
  const hasActiveFilters = searchQuery || selectedGame || selectedPlatform;

  // 全てクリア
  const clearAllFilters = () => {
    onFiltersChange({
      searchQuery: '',
      selectedGame: null,
      selectedPlatform: null,
    });
  };

  return (
    <section className="py-12 border-b border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        {/* メイン検索バー */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchQuery: e.target.value })
            }
            placeholder="募集を検索（タイトル、説明、ユーザー名）"
            className="w-full pl-14 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* フィルターセクション */}
        <div className="space-y-4">
          {/* ゲーム選択 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              🎮 ゲーム
            </label>
            <div className="flex flex-wrap gap-2">
              {games.map((game) => (
                <button
                  key={game.slug}
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      selectedGame: selectedGame === game.slug ? null : game.slug,
                    })
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGame === game.slug
                      ? 'text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor:
                      selectedGame === game.slug ? game.color : undefined,
                    boxShadow:
                      selectedGame === game.slug
                        ? `0 0 20px ${game.color}50`
                        : undefined,
                  }}
                >
                  {game.name}
                </button>
              ))}
            </div>
          </div>

          {/* プラットフォーム選択 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              🖥️ プラットフォーム
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      selectedPlatform:
                        selectedPlatform === platform.id ? null : platform.id,
                    })
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedPlatform === platform.id
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span>{platform.icon}</span>
                  {platform.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* アクティブフィルター表示 & クリアボタン */}
        {hasActiveFilters && (
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
            <span className="text-sm text-gray-500">検索条件:</span>

            {/* テキスト検索 */}
            {searchQuery && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm">
                「{searchQuery}」
                <button
                  onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}

            {/* 選択中のゲーム */}
            {selectedGameData && (
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: `${selectedGameData.color}30`,
                  color: selectedGameData.color,
                }}
              >
                {selectedGameData.name}
                <button
                  onClick={() => onFiltersChange({ ...filters, selectedGame: null })}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </span>
            )}

            {/* 選択中のプラットフォーム */}
            {selectedPlatformData && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                {selectedPlatformData.icon} {selectedPlatformData.name}
                <button
                  onClick={() => onFiltersChange({ ...filters, selectedPlatform: null })}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </span>
            )}

            {/* 全てクリア */}
            <button
              onClick={clearAllFilters}
              className="ml-auto text-sm text-gray-400 hover:text-white transition-colors"
            >
              すべてクリア
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * 募集リストコンポーネント
 */
function RecruitmentList({
  recruitments,
  isLoading,
  onCardClick,
  hasFilters,
}: {
  recruitments: Recruitment[];
  isLoading: boolean;
  onCardClick: (id: number) => void;
  hasFilters: boolean;
}) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            🔥 募集中のパーティ
            <span className="ml-3 text-sm font-normal text-gray-500">
              {recruitments.length}件
              {hasFilters && ' (フィルター適用中)'}
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recruitments.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">
              {hasFilters ? '条件に一致する募集がありません' : '募集がありません'}
            </p>
            <p className="text-sm">
              {hasFilters
                ? '検索条件を変更してみてください'
                : '最初の募集を作成してみましょう！'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recruitments.map((recruitment) => (
              <RecruitmentCard
                key={recruitment.id}
                recruitment={recruitment}
                variant="compact"
                onCardClick={() => onCardClick(recruitment.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function RecruitmentSection() {
  const [games, setGames] = useState<Game[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // フィルター状態を統合
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    selectedGame: null,
    selectedPlatform: null,
  });

  // モーダル用のstate
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ユーザー情報
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.me, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.authenticated) {
          setCurrentUserId(data.user.id);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  // ゲーム一覧を取得
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.games);
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      }
    };

    fetchGames();
  }, []);

  // 募集一覧を取得する関数
  const fetchRecruitments = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.selectedGame) params.append('game', filters.selectedGame);
      if (filters.selectedPlatform) params.append('platform', filters.selectedPlatform);

      const url = `${API_ENDPOINTS.recruitments}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      setRecruitments(data.recruitments || []);
    } catch (error) {
      console.error('Failed to fetch recruitments:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // 初回取得 & フィルター変更時
  useEffect(() => {
    fetchRecruitments(true);
  }, [filters.selectedGame, filters.selectedPlatform]);

  // ポーリングで自動更新（5秒ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecruitments(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [filters.selectedGame, filters.selectedPlatform]);

  // テキスト検索でフィルタリング（フロントエンド側）
  const filteredRecruitments = useMemo(() => {
    if (!filters.searchQuery.trim()) {
      return recruitments;
    }

    const query = filters.searchQuery.toLowerCase().trim();
    return recruitments.filter((r) => {
      return (
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.owner?.discord_username.toLowerCase().includes(query) ||
        r.game.name.toLowerCase().includes(query)
      );
    });
  }, [recruitments, filters.searchQuery]);

  // フィルターがアクティブかどうか
  const hasActiveFilters = !!(
    filters.searchQuery ||
    filters.selectedGame ||
    filters.selectedPlatform
  );

  // カードクリック時の処理
  const handleCardClick = (id: number) => {
    setSelectedRecruitmentId(id);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecruitmentId(null);
  };

  return (
    <>
      <SearchFilter
        games={games}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <RecruitmentList
        recruitments={filteredRecruitments}
        isLoading={isLoading}
        onCardClick={handleCardClick}
        hasFilters={hasActiveFilters}
      />

      {/* 募集詳細モーダル */}
      <RecruitmentDetailModal
        recruitmentId={selectedRecruitmentId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentUserId={currentUserId}
        isLoggedIn={isLoggedIn}
      />
    </>
  );
}
