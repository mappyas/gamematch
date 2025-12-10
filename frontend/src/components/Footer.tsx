import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-12 border-t-4 border-[#8b7340] tatami-bg relative">
      {/* 木の枠 */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-[#8b7340] to-[#6b5a30]"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* ロゴ・説明 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#f9f3e3] px-4 py-2 rounded-lg border-2 border-[#8b7340] shadow-md">
                <span className="handwritten-logo text-xl font-bold italic">
                  matcha-gg.com
                </span>
              </div>
            </div>
            <p className="text-sm text-[#2a2a1a] max-w-sm bg-[#f9f3e3]/80 p-3 rounded border border-[#c4a35a]">
              DiscordでApex、Valorant、LoLなどのゲーム仲間を簡単に見つけよう。
              リアルタイムで募集を確認して、すぐにパーティを組める！
            </p>
          </div>

          {/* リンク */}
          <div className="bg-[#f9f3e3]/80 p-4 rounded-lg border border-[#c4a35a]">
            <h4 className="text-sm font-semibold text-[#5a4a20] mb-4 border-b border-[#c4a35a] pb-2">サービス</h4>
            <ul className="space-y-2 text-sm text-[#2a2a1a]">
              <li>
                <Link href="/" className="hover:text-[#78A55A] transition-colors">
                  募集一覧
                </Link>
              </li>
              <li>
                <a
                  href="https://discord.gg/your-server"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#78A55A] transition-colors"
                >
                  Discord参加
                </a>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div className="bg-[#f9f3e3]/80 p-4 rounded-lg border border-[#c4a35a]">
            <h4 className="text-sm font-semibold text-[#5a4a20] mb-4 border-b border-[#c4a35a] pb-2">法的情報</h4>
            <ul className="space-y-2 text-sm text-[#2a2a1a]">
              <li>
                <Link href="#" className="hover:text-[#78A55A] transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#78A55A] transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#78A55A] transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="pt-8 border-t-2 border-[#c4a35a] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#5a4a20] bg-[#f9f3e3]/80 px-3 py-1 rounded">
            © 2025 matcha-gg.com. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            {/* Discord */}
            <a
              href="https://discord.gg/your-server"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5a4a20] hover:text-[#5865F2] transition-colors bg-[#f9f3e3]/80 p-2 rounded-full"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5a4a20] hover:text-[#1da1f2] transition-colors bg-[#f9f3e3]/80 p-2 rounded-full"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
