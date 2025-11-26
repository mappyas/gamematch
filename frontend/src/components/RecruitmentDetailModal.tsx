'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { getRecruitmentUrl, joinRecruitmentUrl, leaveRecruitmentUrl, deleteRecruitmentUrl } from '@/lib/api';

type Participant = {
  id: number;
  discord_username: string;
  avatar: string | null;
  joined_at: string;
};

type RecruitmentDetail = {
  id: number;
  title: string;
  description: string;
  game: {
    slug: string;
    name: string;
    color: string;
  };
  platform: string;
  max_players: number;
  current_players: number;
  rank: string;
  voice_chat: boolean;
  status: string;
  owner: {
    id: number;
    discord_username: string;
    avatar: string | null;
  };
  participants: Participant[];
  created_at: string;
  is_full: boolean;
};

type Props = {
  recruitmentId: number | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number | null;
  isLoggedIn: boolean;
};

const PLATFORM_LABELS: Record<string, string> = {
  pc: 'PC',
  ps: 'PlayStation',
  xbox: 'Xbox',
  switch: 'Switch',
  mobile: 'Mobile',
  crossplay: 'クロスプレイ',
};

const POLLING_INTERVAL = 3000; // 3秒ごとに更新

export function RecruitmentDetailModal({ 
  recruitmentId, 
  isOpen, 
  onClose, 
  currentUserId,
  isLoggedIn 
}: Props) {
  const [recruitment, setRecruitment] = useState<RecruitmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 募集詳細を取得
  const fetchRecruitmentDetail = useCallback(async () => {
    if (!recruitmentId) return;

    try {
      const response = await fetch(getRecruitmentUrl(recruitmentId), {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.recruitment) {
        setRecruitment(data.recruitment);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch recruitment detail:', err);
      setError('募集情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [recruitmentId]);

  // 初回取得
  useEffect(() => {
    if (isOpen && recruitmentId) {
      setIsLoading(true);
      fetchRecruitmentDetail();
    }
  }, [isOpen, recruitmentId, fetchRecruitmentDetail]);

  // ポーリングでリアルタイム更新
  useEffect(() => {
    if (!isOpen || !recruitmentId) return;

    const interval = setInterval(fetchRecruitmentDetail, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [isOpen, recruitmentId, fetchRecruitmentDetail]);

  // 参加処理
  const handleJoin = async () => {
    if (!recruitment || !isLoggedIn) return;

    setIsJoining(true);
    try {
      const response = await fetch(joinRecruitmentUrl(recruitment.id), {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        fetchRecruitmentDetail(); // 更新
      } else {
        setError(data.error || '参加に失敗しました');
      }
    } catch (err) {
      setError('通信エラーが発生しました');
    } finally {
      setIsJoining(false);
    }
  };

  // 離脱処理
  const handleLeave = async () => {
    if (!recruitment) return;

    setIsJoining(true);
    try {
      const response = await fetch(leaveRecruitmentUrl(recruitment.id), {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        fetchRecruitmentDetail(); // 更新
      } else {
        setError(data.error || '離脱に失敗しました');
      }
    } catch (err) {
      setError('通信エラーが発生しました');
    } finally {
      setIsJoining(false);
    }
  };

  // 削除処理（オーナーのみ）
  const handleDelete = async () => {
    if (!recruitment || !isOwner) return;

    if (!confirm('この募集を削除しますか？この操作は取り消せません。')) {
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(deleteRecruitmentUrl(recruitment.id), {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        onClose(); // モーダルを閉じる
      } else {
        setError(data.error || '削除に失敗しました');
      }
    } catch (err) {
      setError('通信エラーが発生しました');
    } finally {
      setIsJoining(false);
    }
  };

  // 自分が参加しているかチェック
  const isParticipant = recruitment?.participants.some(p => p.id === currentUserId);
  const isOwner = recruitment?.owner.id === currentUserId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            閉じる
          </button>
        </div>
      ) : recruitment ? (
        <div className="space-y-6">
          {/* ヘッダー */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${recruitment.game.color}20`,
                  color: recruitment.game.color,
                }}
              >
                {recruitment.game.name}
              </span>
              {recruitment.status === 'closed' && (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                  締切
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold">{recruitment.title}</h2>
          </div>

          {/* 募集者情報 */}
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            {recruitment.owner.avatar ? (
              <img
                src={recruitment.owner.avatar}
                alt={recruitment.owner.discord_username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500" />
            )}
            <div>
              <p className="text-xs text-gray-400">募集者</p>
              <p className="font-bold">{recruitment.owner.discord_username}</p>
            </div>
            {isOwner && (
              <span className="ml-auto px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                あなたの募集
              </span>
            )}
          </div>

          {/* 詳細情報 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">プラットフォーム</p>
              <p className="font-medium">{PLATFORM_LABELS[recruitment.platform]}</p>
            </div>
            {recruitment.rank && (
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">ランク</p>
                <p className="font-medium">{recruitment.rank}</p>
              </div>
            )}
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">ボイスチャット</p>
              <p className="font-medium">{recruitment.voice_chat ? '🎤 あり' : 'なし'}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">募集人数</p>
              <p className="font-medium">
                <span className="text-cyan-400">{recruitment.current_players}</span>
                <span className="text-gray-500"> / </span>
                <span>{recruitment.max_players}</span>
                <span className="text-gray-500 text-sm ml-1">人</span>
              </p>
            </div>
          </div>

          {/* 説明 */}
          {recruitment.description && (
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-xs text-gray-400 mb-2">説明</p>
              <p className="text-gray-200 whitespace-pre-wrap">{recruitment.description}</p>
            </div>
          )}

          {/* 参加者リスト */}
          <div>
            <p className="text-sm text-gray-400 mb-3">
              参加者 ({recruitment.current_players}/{recruitment.max_players})
            </p>
            <div className="space-y-2">
              {/* オーナー */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                {recruitment.owner.avatar ? (
                  <img
                    src={recruitment.owner.avatar}
                    alt={recruitment.owner.discord_username}
                    className="w-10 h-10 rounded-full ring-2 ring-yellow-500"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 ring-2 ring-yellow-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{recruitment.owner.discord_username}</p>
                  <p className="text-xs text-yellow-400">ホスト</p>
                </div>
              </div>

              {/* 参加者 */}
              {recruitment.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-fadeIn"
                >
                  {participant.avatar ? (
                    <img
                      src={participant.avatar}
                      alt={participant.discord_username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{participant.discord_username}</p>
                    <p className="text-xs text-gray-500">参加者</p>
                  </div>
                  {participant.id === currentUserId && (
                    <span className="text-xs text-cyan-400">あなた</span>
                  )}
                </div>
              ))}

              {/* 空きスロット */}
              {Array.from({ length: recruitment.max_players - recruitment.current_players }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-dashed border-white/10"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="text-gray-600">?</span>
                  </div>
                  <p className="text-gray-500">空きスロット</p>
                </div>
              ))}
            </div>
          </div>

          {/* アクションボタン（参加者用） */}
          {!isOwner && recruitment.status === 'open' && (
            <div className="pt-4 border-t border-white/10">
              {!isLoggedIn ? (
                <p className="text-center text-gray-400 text-sm">
                  参加するにはログインが必要です
                </p>
              ) : isParticipant ? (
                <button
                  onClick={handleLeave}
                  disabled={isJoining}
                  className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/30 transition disabled:opacity-50"
                >
                  {isJoining ? '処理中...' : '参加をキャンセル'}
                </button>
              ) : recruitment.is_full ? (
                <button
                  disabled
                  className="w-full py-3 bg-gray-500/20 text-gray-400 rounded-xl font-bold cursor-not-allowed"
                >
                  満員です
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
                >
                  {isJoining ? '処理中...' : 'このパーティに参加する'}
                </button>
              )}
            </div>
          )}

          {/* オーナー用アクション */}
          {isOwner && (
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleDelete}
                disabled={isJoining}
                className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🗑️</span>
                {isJoining ? '削除中...' : 'この募集を削除する'}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}

