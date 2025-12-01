# Discord Bot統合 - パーティ募集機能

## Phase 1: Discord Bot基盤
- [x] Discord Developer Portalでアプリケーション作成
  - [x] Discord Developer Portalにアクセス
  - [x] 新しいアプリケーションを作成
  - [x] Bot Tokenを取得
  - [x] 必要な権限（Intents）を設定
  - [x] サーバーにBotを招待
- [x] プロジェクト構造の準備
  - [x] `backend/discord_bot/` ディレクトリ作成
  - [x] 必要なパッケージをrequirements.txtに追加
  - [x] 環境変数設定（.env）
- [x] 基本的なBotコード実装
  - [x] `bot.py` の基本構造作成
  - [x] Bot起動とイベントハンドリング
- [x] スラッシュコマンド `/recruit` 実装
  - [x] コマンド定義
  - [x] Embedメッセージ作成
  - [x] ボタンUI実装

## Phase 2: バックエンドAPI拡張
- [x] モデル作成
  - [x] DiscordRecruitmentモデル定義
  - [x] マイグレーション実行
- [x] シリアライザー作成
- [/] APIエンドポイント実装
- [ ] URLルーティング設定

## Phase 3: リアルタイム通信（WebSocket）
- [ ] Django Channels設定
- [ ] Redis設定
- [ ] WebSocketコンシューマー実装
- [ ] リアルタイム更新機能

## Phase 4: フロントエンド実装
- [ ] Discord募集一覧ページ作成
- [ ] WebSocket接続実装
- [ ] リアルタイム表示

## Phase 5: 統合テスト
- [ ] エンドツーエンドテスト
- [ ] Render環境デプロイ
