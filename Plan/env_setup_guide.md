# 環境変数設定ガイド

## .env ファイルに追加する環境変数

`backend/.env` ファイルを開いて、以下の環境変数を追加してください。

### Discord Bot 関連

```bash
# Discord Bot Token (Discord Developer Portalで取得したもの)
DISCORD_BOT_TOKEN=your_bot_token_here

# Discord Application ID (Client ID)
DISCORD_CLIENT_ID=your_client_id_here

# Discord Client Secret (必要な場合)
DISCORD_CLIENT_SECRET=your_client_secret_here

# Discord Public Key
DISCORD_PUBLIC_KEY=your_public_key_here
```

### バックエンドAPI URL

```bash
# ローカル開発環境
BACKEND_API_URL=http://localhost:8000

# 本番環境では以下のように変更
# BACKEND_API_URL=https://your-render-backend-url.onrender.com
```

### Redis URL (WebSocket用)

```bash
# ローカル開発環境 (Redisをローカルで動かす場合)
REDIS_URL=redis://localhost:6379

# 本番環境では以下のように変更 (Render Redis Addonなど)
# REDIS_URL=redis://your-redis-url
```

---

## 設定例

以下は`.env`ファイルの完全な例です（値は実際のものに置き換えてください）:

```bash
# Django設定
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Discord Bot設定
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_PUBLIC_KEY=your_discord_public_key_here

# API設定
BACKEND_API_URL=http://localhost:8000

# Redis設定
REDIS_URL=redis://localhost:6379
```

---

## 注意事項

> [!CAUTION]
> **絶対に `.env` ファイルをGitにコミットしないでください！**
> - `.env` は `.gitignore` に含まれているはずです
> - Bot Tokenなどの機密情報が含まれています
> - 本番環境では環境変数として設定します

---

## 次のステップ

環境変数の設定が完了したら:
1. 新しいパッケージをインストール: `pip install -r requirements.txt`
2. Bot コードの実装に進みます
