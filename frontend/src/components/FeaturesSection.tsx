export function FeaturesSection() {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          PartyFinderの<span className="text-cyan-400">特徴</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center text-3xl">
              🎮
            </div>
            <h3 className="text-xl font-bold mb-2">マルチゲーム対応</h3>
            <p className="text-gray-400 text-sm">
              Apex、Valorant、フォートナイトなど人気タイトルから、モンハン、マイクラまで幅広く対応
            </p>
          </div>
          
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center text-3xl">
              🌐
            </div>
            <h3 className="text-xl font-bold mb-2">クロスプラットフォーム</h3>
            <p className="text-gray-400 text-sm">
              PC、PlayStation、Xbox、Switch、モバイル。どのプラットフォームでも仲間を見つけられます
            </p>
          </div>
          
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center text-3xl">
              ⚡
            </div>
            <h3 className="text-xl font-bold mb-2">リアルタイム更新</h3>
            <p className="text-gray-400 text-sm">
              募集状況はリアルタイムで更新。枠が埋まる前にすぐ参加できます
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

