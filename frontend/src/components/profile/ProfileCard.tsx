import Link from 'next/link';
import Image from 'next/image';
import { User, Profile } from '@/types';
import { PLATFORM_LABELS } from '@/constants';

type ProfileCardProps = {
  user: User;
  profile: Profile | null;
};

/**
 * プロフィールカードコンポーネント
 * ユーザーの基本情報とゲームアカウント情報を表示
 */
export function ProfileCard({ user, profile }: ProfileCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 mb-8 border border-gray-700/50">
      <div className="flex flex-col md:flex-row gap-6">
        {/* アバター */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <div className="relative w-32 h-32 rounded-full border-4 border-cyan-500/50 overflow-hidden">
              {/* <Image
                src={user.avatar}
                alt={user.discord_username}
                fill
                className="object-cover"
                sizes="128px"
              /> */}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 border-4 border-cyan-500/50" />
          )}
        </div>

        {/* 基本情報 */}
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">
              {profile?.display_name || user.discord_username}
            </h2>
            <p className="text-gray-400">@{user.discord_username}</p>
          </div>

          {profile ? (
            <div className="space-y-3">
              {/* メインゲーム */}
              {profile.main_game && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">メインゲーム:</span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${profile.main_game.color}20`,
                      color: profile.main_game.color,
                    }}
                  >
                    {profile.main_game.name}
                  </span>
                </div>
              )}

              {/* プラットフォーム */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">プラットフォーム:</span>
                <span className="text-sm">
                  {PLATFORM_LABELS[profile.platform] || profile.platform}
                </span>
              </div>

              {/* 自己紹介 */}
              {profile.bio && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">自己紹介:</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}

              {/* ゲームアカウント */}
              {profile.game_accounts && profile.game_accounts.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">ゲームアカウント:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.game_accounts.map((ga) => (
                      <div
                        key={ga.id}
                        className="px-3 py-1 bg-gray-800/50 rounded-lg text-sm"
                      >
                        <span className="font-medium">{ga.game.name}:</span> {ga.player_id}
                        {ga.rank && <span className="text-gray-400 ml-2">({ga.rank})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm mb-2">プロフィールが未設定です</p>
              <Link
                href="/profile/setup"
                className="text-yellow-400 hover:text-yellow-300 text-sm underline"
              >
                プロフィールを設定する →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

