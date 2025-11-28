import { RiotAccount } from '@/types';

type RiotAccountCardProps = {
  riotAccount: RiotAccount;
};

/**
 * Riotアカウント情報カードコンポーネント
 * Riot IDとLoLランク情報を表示
 */
export function RiotAccountCard({ riotAccount }: RiotAccountCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-700/50">
      <h3 className="text-xl font-bold mb-4">Riotアカウント</h3>
      <div className="space-y-3">
        {/* RIOT ID */}
        <div>
          <span className="text-sm text-gray-400">RIOT ID:</span>
          <span className="ml-2 font-medium">{riotAccount.riot_id}</span>
        </div>

        {/* リージョン */}
        <div>
          <span className="text-sm text-gray-400">リージョン:</span>
          <span className="ml-2">{riotAccount.region.toUpperCase()}</span>
        </div>

        {/* LoLランク */}
        {riotAccount.lol_ranks && riotAccount.lol_ranks.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">LoLランク:</p>
            <div className="space-y-2">
              {riotAccount.lol_ranks.map((rank, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{rank.queue_type_display}</span>
                    <span className="text-cyan-400 font-bold">{rank.display_rank}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>LP: {rank.league_points}</span>
                    <span>勝ち: {rank.wins}</span>
                    <span>負け: {rank.losses}</span>
                    <span>
                      勝率: {((rank.wins / (rank.wins + rank.losses)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

