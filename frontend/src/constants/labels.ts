// プラットフォームラベル
export const PLATFORM_LABELS: Record<string, string> = {
  pc: 'PC',
  ps: 'PlayStation',
  xbox: 'Xbox',
  switch: 'Switch',
  mobile: 'Mobile',
  crossplay: 'クロスプレイ',
};

// ステータスラベル
export const STATUS_LABELS: Record<string, string> = {
  open: '募集中',
  closed: '締切',
  cancelled: 'キャンセル',
};

// ステータスカラー
export const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-500/20 text-green-400',
  closed: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

