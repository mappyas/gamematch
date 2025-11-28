'use client'
import { Recruitment } from '@/types';
import { RecruitmentCard } from '@/components/RecruitmentCard';

type RecruitmentListProps = {
  title: string;
  recruitments: Recruitment[];
  showOwner?: boolean;
  emptyMessage?: string;
};

/**
 * 募集リストコンポーネント
 * 作成した募集または参加した募集のリストを表示
 */
export function RecruitmentList({
  title,
  recruitments,
  showOwner = false,
  emptyMessage = '募集がありません',
}: RecruitmentListProps) {
  return (
    <div className="mb-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <span className="text-gray-400 text-sm">{recruitments.length}件</span>
      </div>

      {/* リスト */}
      {recruitments.length > 0 ? (
        <div className="space-y-4">
          {recruitments.map((recruitment) => (
            <RecruitmentCard
              key={recruitment.id}
              recruitment={recruitment}
              showOwner={showOwner}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-xl p-8 text-center border border-gray-700/50">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

