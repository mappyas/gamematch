'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api';

export default function DiscordCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Discordと連携中...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('認証がキャンセルされました');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('認証コードがありません');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.discordCallback, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          
          if (data.is_new_user || !data.is_profile_complete) {
            setMessage('ログイン成功！プロフィール設定へ...');
            setTimeout(() => router.push('/profile/setup'), 1500);
          } else {
            setMessage('ログイン成功！');
            setTimeout(() => router.push('/'), 1500);
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'ログインに失敗しました');
          setTimeout(() => router.push('/'), 3000);
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('通信エラーが発生しました');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        {/* ローディングアニメーション */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 mx-auto border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
          )}
          {status === 'success' && (
            <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        <p className="text-xl text-white font-medium">{message}</p>
      </div>
    </div>
  );
}

