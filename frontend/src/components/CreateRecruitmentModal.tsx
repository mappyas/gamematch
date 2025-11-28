'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Modal } from './Modal';
import { API_ENDPOINTS } from '@/lib/api';

type Game = {
  id: number;
  slug: string;
  name: string;
  color: string;
  max_players: number;
  platforms: string[];
  ranks: {
    id: number;
    rankname: string;
    rankorder: number;
    icon: string;
  }[]
};

type CreateRecruitmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const PLATFORM_OPTIONS = [
  { value: 'pc', label: 'PC', icon: '💻' },
  { value: 'ps', label: 'PlayStation', icon: '🎮' },
  { value: 'xbox', label: 'Xbox', icon: '🟢' },
  { value: 'switch', label: 'Switch', icon: '🔴' },
  { value: 'mobile', label: 'Mobile', icon: '📱' },
  { value: 'crossplay', label: 'クロスプレイ', icon: '🌐' },
];

export function CreateRecruitmentModal({ isOpen, onClose, onSuccess }: CreateRecruitmentModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // フォームの状態
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('pc');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [rank, setRank] = useState('');
  const [voiceChat, setVoiceChat] = useState(false);

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

    if (isOpen) {
      fetchGames();
    }
  }, [isOpen]);

  const availablePlatforms = PLATFORM_OPTIONS.filter(
    option => selectedGame?.platforms?.includes(option.value) ?? true
  );

  // ゲーム選択時に最大人数とプラットフォームを更新
  useEffect(() => {
    if (selectedGame) {
      setMaxPlayers(selectedGame.max_players);
      
      // 選択中のプラットフォームが対応外ならリセット
      if (!selectedGame.platforms.includes(platform)) {
        setPlatform(selectedGame.platforms[0] || 'pc');
      }
    }
  }, [selectedGame]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedGame) {
      setIsError(true);
      setMessage('ゲームを選択してください');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(API_ENDPOINTS.createRecruitment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          game_id: selectedGame.id,
          title,
          description,
          platform,
          max_players: maxPlayers,
          rank,
          voice_chat: voiceChat,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsError(false);
        setMessage('募集を作成しました！');
        
        // フォームリセット
        setTimeout(() => {
          setSelectedGame(null);
          setTitle('');
          setDescription('');
          setPlatform('pc');
          setRank('');
          setVoiceChat(false);
          setMessage('');
          onClose();
          onSuccess?.();
        }, 1000);
      } else {
        setIsError(true);
        setMessage(data.error || '作成に失敗しました');
      }
    } catch (error) {
      setIsError(true);
      setMessage('通信エラーが発生しました');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="募集を作成">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ゲーム選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ゲーム <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {games.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => setSelectedGame(game)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedGame?.id === game.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
                style={{
                  borderColor: selectedGame?.id === game.id ? game.color : undefined,
                }}
              >
                <span className="text-sm font-medium">{game.name}</span>
              </button>
            ))}
          </div>
          {games.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">
              ゲームが登録されていません。管理画面から追加してください。
            </p>
          )}
        </div>

        {/* タイトル */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            タイトル <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: ランクマッチ @2 ダイヤ目指したい！"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
            maxLength={100}
          />
        </div>

        {/* プラットフォーム */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            プラットフォーム
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availablePlatforms.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPlatform(option.value)}
                className={`p-2 rounded-lg border text-center transition-all text-sm ${
                  platform === option.value
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 募集人数 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            募集人数（自分含む）
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max={selectedGame?.max_players || 10}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-2xl font-bold text-cyan-400 w-12 text-center">
              {maxPlayers}
            </span>
          </div>
        </div>

        {/* ランク */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ランク条件（任意）
          </label>
          <select
            className = "text-gray-400"
            value={rank}
            onChange={(e) => setRank(e.target.value)}>
              <option value="">指定なし</option>
              {selectedGame?.ranks.map((r) => (
                <option key={r.id} value={r.rankname}>{r.rankname}</option>
              ))}
          </select>
        </div>

        {/* VC有無 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVoiceChat(!voiceChat)}
            className={`w-12 h-6 rounded-full transition-all ${
              voiceChat ? 'bg-cyan-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-all ${
                voiceChat ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className="text-gray-300">ボイスチャット必須</span>
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            詳細説明（任意）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="追加の条件や連絡先など..."
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all resize-none"
            maxLength={500}
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isLoading || !selectedGame || !title}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
        >
          {isLoading ? '作成中...' : '募集を作成'}
        </button>

        {/* メッセージ */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm text-center ${
              isError
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </Modal>
  );
}

