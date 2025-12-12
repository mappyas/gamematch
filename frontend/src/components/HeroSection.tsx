'use client';

type HeroSectionProps = {
    onLoginClick: () => void;
};

export function HeroSection({ onLoginClick }: HeroSectionProps) {
    return (
        <div className="relative overflow-hidden py-16 sm:py-20 bg-[#0a0a0f]">
            {/* 背景装飾 */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20 transform scale-105 animate-pulse-slow"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop")',
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--gaming-accent)]/10 via-transparent to-transparent opacity-40"></div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center z-10">
                <div className="inline-block mb-3 px-3 py-0.5 rounded-full border border-[var(--gaming-accent)]/30 bg-[var(--gaming-accent)]/10 text-[var(--gaming-accent)] text-[10px] font-bold tracking-widest uppercase animate-slideUp">
                    The Ultimate LFG Platform
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl mb-4 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    Find Your Perfect <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gaming-accent)] to-emerald-500 drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                        Gaming Squad
                    </span>
                </h1>

                <p className="mt-4 text-base leading-7 text-[var(--gaming-text-sub)] max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    Matcha.ggは、Valorant, Apex, LoLなどの人気タイトルで<br className="hidden sm:block" />
                    一緒に遊ぶ仲間を簡単に見つけられるコミュニティプラットフォームです。
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <button
                        onClick={onLoginClick}
                        className="w-full sm:w-auto rounded-full bg-[var(--gaming-accent)] px-6 py-3 text-sm font-bold text-[#0a0a0f] shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                        Discordで始める
                    </button>
                    <a href="/guide" className="text-sm font-semibold leading-6 text-white hover:text-[var(--gaming-accent)] transition-colors">
                        使い方を見る <span aria-hidden="true">→</span>
                    </a>
                </div>

                {/* 簡易スタッツや信頼性を示す要素 */}
                {/* <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-16 opacity-70">
                    <div className="flex flex-col gap-1">
                        <dt className="text-sm leading-6 text-gray-400">Total Users</dt>
                        <dd className="text-3xl font-bold tracking-tight text-white">1,000+</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                        <dt className="text-sm leading-6 text-gray-400">Active Rooms</dt>
                        <dd className="text-3xl font-bold tracking-tight text-white">50+</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                        <dt className="text-sm leading-6 text-gray-400">Games</dt>
                        <dd className="text-3xl font-bold tracking-tight text-white">5+</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                        <dt className="text-sm leading-6 text-gray-400">Uptime</dt>
                        <dd className="text-3xl font-bold tracking-tight text-white">99.9%</dd>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
