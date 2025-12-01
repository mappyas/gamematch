'use client';

import { useState, useEffect, useRef } from 'react';
import { DiscordRecruitmentCard } from '@/components/DiscordRecruitmentCard';

// 型定義
type DiscordRecruitment = {
  id: number;
  game: number;
  game_name: string;
  title: string;
  description: string;
  discord_owner_id: string;
  discord_owner_username: string;
  max_slots: number;
  current_slots: number;
  participants_list: { discord_user_id: string; discord_username: string }[];
  status: string;
  is_full: boolean;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export default function DiscordRecruitmentsPage() {
  const [recruitments, setRecruitments] = useState<DiscordRecruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // 募集一覧を取得
  const fetchRecruitments = async () => {
    try {
      const res = await fetch(`${API_URL}/accounts/api/discord/recruitments/`);
      const data = await res.json();
      setRecruitments(data.recruitments || []);
    } catch (error) {
      console.error('募集取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket接続
  useEffect(() => {
    fetchRecruitments();

    // WebSocket接続
    const ws = new WebSocket(`${WS_URL}/ws/discord-recruitments/`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket接続成功');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📩 受信:', data);

      if (data.type === 'recruitment_created') {
        // 新規募集を追加
        setRecruitments((prev) => [data.recruitment, ...prev]);
      } else if (data.type === 'recruitment_update') {
        // 募集を更新
        setRecruitments((prev) =>
          prev.map((r) =>
            r.id === data.recruitment.id ? data.recruitment : r
          )
        );
      } else if (data.type === 'recruitment_deleted') {
        // 募集を削除
        setRecruitments((prev) =>
          prev.filter((r) => r.id !== data.recruitment_id)
        );
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocketエラー:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket切断');
      setIsConnected(false);
    };

    // クリーンアップ
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🎮 Discord募集
            </h1>
            <p className="text-gray-400">
              Discordで作成された募集がリアルタイムで表示されます
            </p>
          </div>
          
          {/* 接続状態 */}
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-400">
              {isConnected ? 'リアルタイム接続中' : '接続なし'}
            </span>
          </div>
        </div>

        {/* ローディング */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">読み込み中...</p>
          </div>
        ) : recruitments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-gray-400">まだ募集がありません</p>
            <p className="text-gray-500 text-sm mt-2">
              Discordで /recruit コマンドを使って募集を作成してみよう！
            </p>
          </div>
        ) : (
          /* 募集一覧 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recruitments.map((recruitment) => (
              <DiscordRecruitmentCard
                key={recruitment.id}
                recruitment={recruitment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}