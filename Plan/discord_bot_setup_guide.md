# Discord Bot セットアップガイド（Phase 1）

## Step 1: Discord Developer Portal でアプリケーション作成

### 1-1. Discord Developer Portal にアクセス

1. **ブラウザで以下のURLにアクセス**:
   ```
   https://discord.com/developers/applications
   ```

2. **Discordアカウントでログイン**
   - まだログインしていない場合はログインしてください

### 1-2. 新しいアプリケーションを作成

1. **「New Application」ボタンをクリック**
   
2. **アプリケーション名を入力**
   - 例: `GameMatch Bot` または好きな名前
   
3. **利用規約に同意して「Create」をクリック**

### 1-3. Bot を作成

1. **左サイドバーの「Bot」をクリック**

2. **「Add Bot」ボタンをクリック**

3. **確認ダイアログで「Yes, do it!」をクリック**

### 1-4. Bot Token を取得（重要！）

1. **「TOKEN」セクションで「Reset Token」をクリック**
   - または最初の場合は「Copy」ボタンが表示されます
   
2. **トークンをコピーして安全な場所に保存**
   > ⚠️ **警告**: このトークンは一度しか表示されません！必ず安全に保存してください
   
3. **後で `.env` ファイルに追加します**

### 1-5. Bot の権限（Intents）を設定

**「Privileged Gateway Intents」セクションで以下をONにする:**

- ✅ **PRESENCE INTENT** (オプション)
- ✅ **SERVER MEMBERS INTENT**
- ✅ **MESSAGE CONTENT INTENT**

これらの権限により、Botがメッセージを読んだりメンバー情報を取得できます。

### 1-6. 必要な情報を取得

1. **Application ID を取得**
   - 「General Information」タブに戻る
   - 「APPLICATION ID」をコピー
   
2. **Public Key を取得**
   - 同じページの「PUBLIC KEY」をコピー

---

## Step 2: Bot をサーバーに招待

### 2-1. OAuth2 URL を生成

1. **左サイドバーの「OAuth2」→「URL Generator」をクリック**

2. **「SCOPES」で以下を選択:**
   - ✅ `bot`
   - ✅ `applications.commands`

3. **「BOT PERMISSIONS」で以下を選択:**
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Use Slash Commands
   - ✅ Add Reactions

4. **ページ下部に生成された URL をコピー**

### 2-2. Bot を招待

1. **コピーした URL をブラウザの新しいタブで開く**

2. **招待したいサーバーを選択**

3. **「認証」ボタンをクリック**

4. **reCAPTCHAを完了**

✅ これで Bot がサーバーに追加されました！

---

## Step 3: 取得した情報をメモ

以下の情報を手元にメモしておいてください:

- ✅ **Bot Token**: `xxxxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx`
- ✅ **Application ID (Client ID)**: `1234567890123456789`
- ✅ **Public Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

これらは次のステップで `.env` ファイルに設定します。

---

## 次のステップ

Discord Developer Portal での設定が完了したら、次は:
- プロジェクト構造の準備
- 環境変数の設定
- Bot コードの実装

に進みます！
