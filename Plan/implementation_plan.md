# Discord Bot統合 - パーティ募集機能

Discord Botを使って、Discordチャット上でパーティ募集を行い、Webサイトとリアルタイムで連携する機能を実装します。

## User Review Required
## already Review it 

> [!IMPORTANT]
> **Discord Bot開発の前提条件**
> - Discord Developer Portalでアプリケーションを作成する必要があります
> - Bot Tokenの取得が必要です
> - サーバーへのBot招待権限が必要です

> [!WARNING]
> **リアルタイム通信の実装方法**
> 1. **WebSocket**: Django Channels + Redis を使用
>
> [!IMPORTANT]
> **Discord Bot のホスティング**
> - Bot は24時間稼働する必要があります
> - Renderで稼働（現在のbackendのホスティングと同様）

## Proposed Changes

### Discord Bot コンポーネント

新しいDiscord Botサービスを作成します。

#### [NEW] [bot.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/discord_bot/bot.py)

Discord Bot のメインロジック:
- `discord.py` ライブラリを使用
- スラッシュコマンド `/recruit` で募集作成
- Embed メッセージとボタンUI
- ボタンクリックでスロット管理
- バックエンドAPIとの通信

#### [NEW] [views.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/discord_bot/views.py)

Discord Botインタラクション処理:
- Discord Interactionの受信エンドポイント
- 署名検証
- ボタンクリックハンドラー
- 募集データの更新

#### [NEW] [requirements.txt更新](file:///c:/Users/mapio/Desktop/next/gamematch/backend/requirements.txt)

追加パッケージ:
```python
discord.py==2.3.2        # Discord Bot SDK
aiohttp==3.9.1           # 非同期HTTP
channels==4.0.0          # WebSocket (推奨の場合)
channels-redis==4.1.0    # Redisバックエンド
daphne==4.0.0            # ASGI サーバー
```

---

### バックエンドAPI拡張

#### [MODIFY] [models.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/accounts/models.py)

新しいモデル追加:
- `DiscordRecruitment`: Discord募集情報
  - `discord_message_id`: DiscordメッセージID
  - `discord_channel_id`: チャンネルID
  - `discord_guild_id`: サーバーID
  - `owner`: オーナー（User外部キー）
  - `title`: 募集タイトル
  - `description`: 詳細
  - `max_slots`: 最大人数
  - `current_slots`: 現在の参加者数
  - `participants`: 参加者リスト（JSONField）
  - `status`: ステータス（募集中/終了）
  - `created_at`, `updated_at`

#### [MODIFY] [serializers.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/accounts/serializers.py)

新しいシリアライザー:
- `DiscordRecruitmentSerializer`: Discord募集のシリアライズ
- 参加者情報の展開

#### [MODIFY] [views.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/accounts/views.py)

新しいAPIエンドポイント:
- `POST /api/discord/recruitments/`: Discord募集作成
- `GET /api/discord/recruitments/`: 募集一覧取得
- `GET /api/discord/recruitments/{id}/`: 募集詳細
- `POST /api/discord/recruitments/{id}/join/`: 参加処理
- `POST /api/discord/recruitments/{id}/leave/`: 退出処理
- `PATCH /api/discord/recruitments/{id}/`: 募集更新（Bot用）
- `DELETE /api/discord/recruitments/{id}/`: 募集削除

#### [MODIFY] [urls.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/accounts/urls.py)

新しいURLパターン追加

---

### リアルタイム通信（WebSocket使用の場合）

#### [NEW] [consumers.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/accounts/consumers.py)

WebSocketコンシューマー:
- `RecruitmentConsumer`: 募集のリアルタイム更新を配信
- Channelレイヤーでブロードキャスト
- 参加/退出イベントの配信

#### [NEW] [routing.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/accounts/routing.py)

WebSocketルーティング設定

#### [MODIFY] [settings.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/project/settings.py)

Channels設定追加:
- `INSTALLED_APPS`に`channels`追加
- `ASGI_APPLICATION`設定
- `CHANNEL_LAYERS`設定（Redis）

#### [MODIFY] [asgi.py](file:///c:/Users/mapio/Desktop/next/gamematch/backend/project/asgi.py)

ASGI設定でWebSocketルーティング追加

---

### フロントエンド実装

#### [NEW] [discord-recruitments/page.tsx](file:///c:/Users/mapio/Desktop/next/gamematch/frontend/src/app/discord-recruitments/page.tsx)

Discord募集一覧ページ:
- リアルタイム募集リスト表示
- WebSocket接続
- 自動更新

#### [NEW] [DiscordRecruitmentCard.tsx](file:///c:/Users/mapio/Desktop/next/gamematch/frontend/src/components/DiscordRecruitmentCard.tsx)

Discord募集カードコンポーネント:
- 募集情報表示
- スロット進捗バー
- Discord参加ボタンリンク
- リアルタイム更新対応

#### [NEW] [useDiscordRecruitments.ts](file:///c:/Users/mapio/Desktop/next/gamematch/frontend/src/lib/useDiscordRecruitments.ts)

カスタムフック:
- WebSocket接続管理
- 募集データの状態管理
- リアルタイム更新処理

#### [MODIFY] [page.tsx](file:///c:/Users/mapio/Desktop/next/gamematch/frontend/src/app/page.tsx)

ホームページに Discord募集セクション追加

---

### 環境設定

#### [MODIFY] [.env](file:///c:/Users/mapio/Desktop/next/gamematch/backend/.env)

新しい環境変数:
```
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_PUBLIC_KEY=your_public_key
BACKEND_API_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379  # WebSocketの場合
```

## Verification Plan

### Automated Tests

1. **バックエンドテスト**
```bash
cd backend
python manage.py test accounts.tests.DiscordRecruitmentTests
```

2. **Discord Bot ローカルテスト**
```bash
cd backend
python discord_bot/bot.py
```

### Manual Verification

1. **Discord Bot動作確認**
   - Discord サーバーで `/recruit` コマンド実行
   - 募集メッセージが表示されることを確認
   - 参加ボタンをクリックしてスロットが増えることを確認

2. **Webサイト連携確認**
   - フロントエンドでDiscord募集ページを開く
   - Discord で作成した募集が表示されることを確認
   - Discord でボタンを押すとリアルタイムで更新されることを確認

3. **エンドツーエンドフロー**
   - Discord で募集作成
   - Webサイトに即座に反映
   - Discord で参加ボタンクリック
   - Webサイトのスロット数がリアルタイム更新
   - スロット満員で募集終了

---

## 実装の流れ（推奨順序）

1. **Phase 1: Discord Bot基盤**
   - Discord Developer Portalでアプリ作成
   - Bot Token取得
   - 基本的なBotコード実装
   - スラッシュコマンド `/recruit` 実装

2. **Phase 2: バックエンドAPI**
   - モデル作成とマイグレーション
   - APIエンドポイント実装
   - Bot ↔ API 連携

3. **Phase 3: リアルタイム通信**
   - WebSocket または Polling 実装
   - リアルタイム更新機能

4. **Phase 4: フロントエンド**
   - Discord募集ページ作成
   - リアルタイム表示実装

5. **Phase 5: 統合テスト**
   - エンドツーエンドテスト
   - バグ修正

---

## 代替案・簡易版の提案

もし初期段階で簡易的に実装したい場合:

### 簡易版（WebSocket不要）

- **Polling方式**: フロントエンドが5秒ごとにAPIをチェック
- **Discord Bot**: そのまま実装
- **API**: REST APIのみ（WebSocketなし）
- **メリット**: 実装が簡単、インフラがシンプル
- **デメリット**: リアルタイム性が若干劣る、サーバー負荷増

この方式なら、ChannelsやRedisが不要で、既存のDjango環境だけで実装可能です。

---

どの実装方式を選択しますか？また、追加の要望やご質問があれば教えてください。
