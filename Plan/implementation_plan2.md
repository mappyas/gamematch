# コードリファクタリング計画

## 🔍 発見された問題点

### 1. 型定義の重複

**問題**: `User` と `Game` 型が複数のファイルで定義されている

- `types/profile.ts` ✅ 正しい定義場所
- `components/Navbar.tsx` ❌ 重複定義
- `app/profile/page.tsx` ❌ 重複定義

**影響**: 
- メンテナンス性の低下
- 型の不一致リスク
- コードの冗長性

---

### 2. カスタムフックの欠如

**問題**: 同じロジックが複数箇所で繰り返されている

#### ユーザー認証チェック
- `HomeClient.tsx` → useEffect でユーザー取得
- `Navbar.tsx` → useEffect でユーザー取得
- `profile/page.tsx` → useEffect でプロフィール取得

**改善案**: `useAuth()` カスタムフックを作成

#### WebSocket接続
- `HomeClient.tsx` → WebSocket接続ロジック

**改善案**: `useWebSocket()` カスタムフックを作成

---

### 3. 定数のハードコード

**問題**: API URL や環境変数の参照が分散している

```tsx
// HomeClient.tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
```

**改善案**: `lib/api.ts` に統一して export

---

### 4. コンポーネント責任の肥大化

**問題**: `Navbar.tsx` が認証状態管理まで担当

- 表示ロジック
- 認証チェック
- ログアウト処理

**改善案**: 認証ロジックをカスタムフックに分離

---

## 📋 リファクタリング項目

### 優先度HIGH

#### 1. 型定義の統一

**対象ファイル**:
- ✅ [types/profile.ts](file:///c:/Users/ktdn30-alt/Desktop/next/frontend/src/types/profile.ts) - 既存
- ❌ [components/Navbar.tsx](file:///c:/Users/ktdn30-alt/Desktop/next/frontend/src/components/Navbar.tsx) - 削除
- ❌ [app/profile/page.tsx](file:///c:/Users/ktdn30-alt/Desktop/next/frontend/src/app/profile/page.tsx) - 削除

**作業内容**:
```tsx
// components/Navbar.tsx
// Before
type User = { ... };
type Game = { ... };

// After
import { User, Game } from '@/types/profile';
```

---

#### 2. useAuth カスタムフック作成

**[NEW] [hooks/useAuth.ts](file:///c:/Users/ktdn30-alt/Desktop/next/frontend/src/hooks/useAuth.ts)**

```tsx
import { useState, useEffect } from 'react';
import { User } from '@/types/profile';
import { API_URL } from '@/lib/constants';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/accounts/api/me/`, { 
          credentials: 'include' 
        });
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('User fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_URL}/accounts/api/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { user, setUser, isLoading, logout };
}
```

**使用例**:
```tsx
// Navbar.tsx
const { user, isLoading, logout } = useAuth();
```

---

#### 3. useWebSocket カスタムフック作成

**[NEW] [hooks/useWebSocket.ts](file:///c:/Users/ktdn30-alt/Desktop/next/frontend/src/hooks/useWebSocket.ts)**

```tsx
import { useEffect, useRef, useState } from 'react';
import { DiscordRecruitment } from '@/types/discord';
import { WS_URL } from '@/lib/constants';

type WebSocketMessage = {
  type: 'recruitment_created' | 'recruitment_update' | 'recruitment_deleted';
  recruitment?: DiscordRecruitment;
  recruitment_id?: number;
};

export function useWebSocket(
  initialRecruitments: DiscordRecruitment[]
) {
  const [recruitments, setRecruitments] = useState(initialRecruitments);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/discord-recruitments/`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    
    ws.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      
      if (data.type === 'recruitment_created' && data.recruitment) {
        setRecruitments((prev) => [data.recruitment!, ...prev]);
      } else if (data.type === 'recruitment_update' && data.recruitment) {
        setRecruitments((prev) =>
          prev.map((r) => (r.id === data.recruitment!.id ? data.recruitment! : r))
        );
      } else if (data.type === 'recruitment_deleted' && data.recruitment_id) {
        setRecruitments((prev) => prev.filter((r) => r.id !== data.recruitment_id));
      }
    };
    
    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => setIsConnected(false);

    return () => ws.close();
  }, []);

  return { recruitments, isConnected };
}
```

---

#### 4. 定数の抜き出し

**[NEW] [lib/constants.ts](file:///c:/Users/ktdn30-alt/Desktop/next/frontend/src/lib/constants.ts)**

```tsx
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
```

**更新**: [lib/api.ts](file:///c:/Users/ktdn30-alt/Desktop/next/frontend/src/lib/api.ts)

```tsx
import { API_URL, WS_URL } from './constants';

// 既存のコードを更新
export { API_URL, WS_URL }; // 再エクスポート
```

---

### 優先度MEDIUM

#### 5. 自分が参加している募集を見つけるロジック

**[NEW] [utils/recruitmentHelpers.ts](file:///c:/Users/ktdn30-alt/Desktop/next/frontend/src/utils/recruitmentHelpers.ts)**

```tsx
import { DiscordRecruitment } from '@/types/discord';
import { User } from '@/types/profile';

export function findMyRecruitment(
  recruitments: DiscordRecruitment[],
  user: User | null
): DiscordRecruitment | null {
  if (!user || recruitments.length === 0) return null;

  return recruitments.find(
    (r) =>
      r.discord_owner_id === user.discord_id ||
      r.participants_list.some((p) => p.discord_user_id === user.discord_id)
  ) || null;
}
```

**使用例**:
```tsx
// HomeClient.tsx
import { findMyRecruitment } from '@/utils/recruitmentHelpers';

useEffect(() => {
  setMyRecruitment(findMyRecruitment(recruitments, user));
}, [user, recruitments]);
```

---

#### 6. プロフィールページの型定義分離

**[NEW] [types/profile-data.ts](file:///c:/Users/ktdn30-alt/Desktop/next/frontend/src/types/profile-data.ts)**

```tsx
import { User } from './profile';

export type MatchedUser = {
  discord_user_id: string;
  discord_username: string;
  match_count: number;
  last_matched_at: string;
};

export type ProfileData = {
  user: User;
  profile: any;
  created_recruitments: any[];
  participated_recruitments: any[];
  riot_account: any;
  matched_users?: MatchedUser[];
};
```

---

### 優先度LOW

#### 7. エラーハンドリングの統一

**問題**: try-catch が各所で異なる形式

**改善案**:
```tsx
// lib/errorHandler.ts
export function handleApiError(error: unknown, context: string) {
  console.error(`${context} error:`, error);
  // 必要に応じてエラー通知機能を追加
}
```

#### 8. ローディング状態コンポーネント

**問題**: ローディングUIが各所で重複

**改善案**:
```tsx
// components/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={`${sizes[size]} border-2 border-cyan-500 border-t-transparent rounded-full animate-spin`} />
  );
}
```

---

## 🛠️ 実装順序

### フェーズ1: 基盤整備（1-4）

1. ✅ 定数ファイル作成 (`lib/constants.ts`)
2. ✅ カスタムフック作成 (`hooks/useAuth.ts`, `hooks/useWebSocket.ts`)
3. ✅ ユーティリティ作成 (`utils/recruitmentHelpers.ts`)
4. ✅ 型定義の重複削除

### フェーズ2: コンポーネント更新（5-7）

5. ✅ `HomeClient.tsx` をカスタムフック使用に更新
6. ✅ `Navbar.tsx` を型import + useAuth使用に更新
7. ✅ `profile/page.tsx` を型import + useAuth使用に更新

### フェーズ3: 最適化（8-9）

8. ⏸️ エラーハンドリング統一化（optional）
9. ⏸️ ローディングコンポーネント作成（optional）

---

## ✅ リファクタリング後の改善効果

### コード品質

- ✅ **DRY原則**: 重複コード削減
- ✅ **型安全性**: 型定義の一元管理
- ✅ **再利用性**: カスタムフックによる分離
- ✅ **可読性**: 責任分離による明確化

### 開発効率

- ✅ **保守性向上**: 変更箇所の一元化
- ✅ **バグ削減**: ロジックの共通化
- ✅ **テスト容易性**: 関数の独立化

### パフォーマンス

- ✅ **変更なし**: リファクタリングによる性能劣化なし
- ✅ **将来の最適化**: 構造改善により最適化しやすく

---

## 📊 影響範囲

| ファイル | 変更内容 | 影響度 |
|---------|----------|--------|
| `lib/constants.ts` | 新規作成 | - |
| `hooks/useAuth.ts` | 新規作成 | - |
| `hooks/useWebSocket.ts` | 新規作成 | - |
| `utils/recruitmentHelpers.ts` | 新規作成 | - |
| `types/profile-data.ts` | 新規作成 | - |
| `HomeClient.tsx` | 大幅更新 | 🔴 高 |
| `Navbar.tsx` | 中程度更新 | 🟡 中 |
| `app/profile/page.tsx` | 軽微更新 | 🟢 低 |
| `lib/api.ts` | 軽微更新 | 🟢 低 |

---

## ⚠️ 注意事項

1. **段階的リファクタリング**: 一度に全部変更しない
2. **動作確認**: 各フェーズ後に動作テスト
3. **Git コミット**: 各ファイル変更ごとにコミット
4. **後方互換性**: 既存のpropsやAPIは維持

---

## 🎯 次のアクション

1. ユーザー承認取得
2. フェーズ1開始（基盤整備）
3. 動作確認
4. フェーズ2実行（コンポーネント更新）
5. 最終確認
