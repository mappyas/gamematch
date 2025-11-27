'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/api';
import Link from 'next/link';

type RiotAccount = {
  riot_id: string;
  game_name: string;
  tag_line: string;
  region: string;
};

type LoLRank = {
  queue_type: string;
  queue_type_display: string;
  tier: string;
  rank: string;
  league_points: number;
  wins: number;
  losses: number;
  display_rank: string;
};

export default function RiotTestPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // フォーム
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('jp');

  // 連携情報
  const [riotAccount, setRiotAccount] = useState<RiotAccount | null>(null);
  const [lolRanks, setLolRanks] = useState<LoLRank[]>([]);
  const [isLinked, setIsLinked] = useState(false);

  // ログイン確認
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.me, { credentials: 'include' });
        const data = await res.json();
        setIsLoggedIn(data.authenticated);
        if (data.authenticated) {
          fetchRiotAccount();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Riot アカウント情報取得
  const fetchRiotAccount = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.riotAccount, { credentials: 'include' });
      const data = await res.json();
      setIsLinked(data.linked);
      if (data.linked) {
        setRiotAccount(data.riot_account);
        setLolRanks(data.lol_ranks || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Riot アカウント連携
  const handleLink = async () => {
    if (!gameName || !tagLine) {
      setIsError(true);
      setMessage('Riot ID とタグを入力してください');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch(API_ENDPOINTS.riotLink, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          game_name: gameName,
          tag_line: tagLine,
          region,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setIsError(false);
        setMessage('連携成功！');
        fetchRiotAccount();
      } else {
        setIsError(true);
        setMessage(data.error || '連携に失敗しました');
      }
    } catch (e) {
      setIsError(true);
      setMessage('通信エラー');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // ランク更新
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.riotRefresh, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('ランク更新完了！');
        setIsError(false);
        fetchRiotAccount();
      } else {
        setMessage(data.error);
        setIsError(true);
      }
    } catch (e) {
      setMessage('通信エラー');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 連携解除
  const handleUnlink = async () => {
    if (!confirm('連携を解除しますか？')) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.riotUnlink, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('連携解除しました');
        setIsError(false);
        setIsLinked(false);
        setRiotAccount(null);
        setLolRanks([]);
      } else {
        setMessage(data.error);
        setIsError(true);
      }
    } catch (e) {
      setMessage('通信エラー');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-cyan-400 hover:underline mb-4 inline-block">
          ← 戻る
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">🎮 Riot API テストページ</h1>

        {!isLoggedIn ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">ログインが必要です</p>
            <Link href="/" className="text-cyan-400 hover:underline">
              トップページでログイン
            </Link>
          </div>
        ) : (
          <>
            {/* 連携済み情報 */}
            {isLinked && riotAccount && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-green-400 mb-4">✅ 連携済み</h2>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Riot ID:</span> {riotAccount.riot_id}</p>
                  <p><span className="text-gray-400">リージョン:</span> {riotAccount.region.toUpperCase()}</p>
                </div>

                {/* ランク情報 */}
                {lolRanks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-500/20">
                    <h3 className="font-bold mb-2">LoL ランク</h3>
                    <div className="space-y-2">
                      {lolRanks.map((rank) => (
                        <div key={rank.queue_type} className="bg-black/20 rounded p-3">
                          <p className="text-sm text-gray-400">{rank.queue_type_display}</p>
                          <p className="text-lg font-bold">{rank.display_rank}</p>
                          <p className="text-sm text-gray-500">
                            {rank.wins}勝 {rank.losses}敗 
                            ({((rank.wins / (rank.wins + rank.losses)) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lolRanks.length === 0 && (
                  <p className="text-gray-500 mt-4">ランク情報がありません（アンランクかも）</p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30"
                  >
                    🔄 ランク更新
                  </button>
                  <button
                    onClick={handleUnlink}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  >
                    連携解除
                  </button>
                </div>
              </div>
            )}

            {/* 連携フォーム */}
            {!isLinked && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Riot アカウント連携</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Riot ID (ゲーム名)</label>
                    <input
                      type="text"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      placeholder="例: Player"
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">タグライン</label>
                    <input
                      type="text"
                      value={tagLine}
                      onChange={(e) => setTagLine(e.target.value)}
                      placeholder="例: JP1"
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">リージョン</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded text-white"
                    >
                      <option value="jp">Japan</option>
                      <option value="kr">Korea</option>
                      <option value="na">North America</option>
                      <option value="eu">Europe</option>
                      <option value="ap">Asia Pacific</option>
                      <option value="oce">Oceania</option>
                      <option value="br">Brazil</option>
                    </select>
                  </div>

                  <button
                    onClick={handleLink}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {isLoading ? '処理中...' : '連携する'}
                  </button>
                </div>
              </div>
            )}

            {/* メッセージ */}
            {message && (
              <div className={`mt-4 p-4 rounded ${isError ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {message}
              </div>
            )}

            {/* デバッグ情報 */}
            <div className="mt-8 p-4 bg-black/30 rounded text-xs font-mono">
              <p className="text-gray-500 mb-2">Debug Info:</p>
              <pre className="text-gray-400 overflow-auto">
                {JSON.stringify({ isLinked, riotAccount, lolRanks }, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

