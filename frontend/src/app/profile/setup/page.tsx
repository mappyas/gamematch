'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/lib/api';

const PLATFORM_OPTIONS = [
  { value: 'pc', label: 'PC', icon: '💻' },
  { value: 'ps', label: 'PlayStation', icon: '🎮' },
  { value: 'xbox', label: 'Xbox', icon: '🟢' },
  { value: 'switch', label: 'Switch', icon: '🔴' },
  { value: 'mobile', label: 'Mobile', icon: '📱' },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // フォームの状態
  const [displayName, setDisplayName] = useState('');
  const [platform, setPlatform] = useState('pc');
  const [bio, setBio] = useState('');

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.me, {
          credentials: 'include',
        });
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/');
          return;
        }

        // Discordのユーザー名を初期値として設定
        if (data.user?.discord_username) {
          setDisplayName(data.user.discord_username);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(API_ENDPOINTS.profile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          display_name: displayName,
          platform,
          bio,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsError(false);
        setMessage('プロフィールを保存しました！');
        setTimeout(() => router.push('/'), 1500);
      } else {
        setIsError(true);
        setMessage(data.error || '保存に失敗しました');
      }
    } catch (error) {
      setIsError(true);
      setMessage('通信エラーが発生しました');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* 背景エフェクト */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-bold">
                PT
              </div>
              <span className="text-2xl font-bold">
                Party<span className="text-cyan-400">Finder</span>
              </span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">プロフィール設定</h1>
            <p className="text-gray-400">あなたの情報を教えてください</p>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 表示名 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                表示名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ゲームで使う名前"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                maxLength={50}
              />
            </div>

            {/* プラットフォーム */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                メインプラットフォーム
              </label>
              <div className="grid grid-cols-5 gap-2">
                {PLATFORM_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPlatform(option.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      platform === option.value
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xl mb-1">{option.icon}</div>
                    <div className="text-xs">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                自己紹介（任意）
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="プレイスタイルや好きなゲームなど..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {bio.length}/500
              </div>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isLoading || !displayName}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
            >
              {isLoading ? '保存中...' : '保存して始める'}
            </button>

            {/* メッセージ */}
            {message && (
              <div
                className={`p-4 rounded-xl text-center ${
                  isError
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}
              >
                {message}
              </div>
            )}
          </form>

          {/* スキップリンク */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              あとで設定する
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

