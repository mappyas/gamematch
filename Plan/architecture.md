# プロジェクト全体のデータフロー・アーキテクチャドキュメント

## 📁 プロジェクト構成

```
next/
├── frontend/          # Next.js 16 (React 19) + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # Reactコンポーネント
│   │   ├── types/            # TypeScript型定義
│   │   └── lib/              # ユーティリティ・API設定
├── backend/           # Django 4.2 + Django Channels + PostgreSQL
│   ├── accounts/             # メインアプリケーション
│   ├── discord_bot/          # Discord Bot (discord.py)
│   └── project/              # Django設定
```

---

## 🏗️ システムアーキテクチャ概要

### レイヤー構成

```mermaid
graph TB
    subgraph "Frontend (Next.js SSR)"
        A[Browser] --> B[Server Components]
        B --> C[Client Components]
        C --> D[WebSocket Client]
    end
    
    subgraph "Backend (Django)"
        E[REST API]
        F[WebSocket Server]
        G[Database PostgreSQL]
    end
    
    subgraph "Discord"
        H[Discord Bot]
        I[Discord Server]
    end
    
    B -->|HTTP| E
    C -->|HTTP| E
    D -->|WebSocket| F
    H -->|HTTP| E
    H <-->|Discord API| I
    E --> G
    F --> G
```

---

## 🔄 データフェッチフロー

### 1. フロントエンド（Next.js）

#### **SSR（サーバーサイドレンダリング）フロー**

##### トップページ (`app/page.tsx`)

```tsx
// サーバーコンポーネント
async function getInitialData() {
  // サーバー側でデータフェッチ
  const recruitmentsRes = await fetch(`${API_URL}/accounts/api/discord/recruitments/`, {
    cache: 'no-store', // 常に最新データ
  });
  return { recruitments, user: null };
}

export default async function HomePage() {
  const { recruitments, user } = await getInitialData();
  return <HomeClient initialRecruitments={recruitments} initialUser={user} />;
}
```

**フロー**:
1. ユーザーがページアクセス
2. **サーバー側**で募集一覧APIを呼び出し
3. 初期データを含むHTMLを生成
4. クライアントにHTMLを送信（高速初期表示）
5. クライアント側でハイドレーション

#### **クライアントサイドフロー** (`components/HomeClient.tsx`)

```tsx
export function HomeClient({ initialRecruitments, initialUser }: HomeClientProps) {
  const [recruitments, setRecruitments] = useState(initialRecruitments);
  const [user, setUser] = useState(initialUser);
  
  // クライアント側でユーザー認証情報を取得
  useEffect(() => {
    fetch(`${API_URL}/accounts/api/me/`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);
  
  // WebSocket接続（リアルタイム更新）
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/discord-recruitments/`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // 募集の作成・更新・削除をリアルタイム反映
    };
  }, []);
}
```

**フロー**:
1. サーバーから受け取った初期データを状態に設定
2. クライアント側でユーザー認証APIを呼び出し（Cookie送信）
3. WebSocket接続を確立してリアルタイム更新を受信

---

### 2. バックエンド（Django）

#### **REST API エンドポイント**

| カテゴリ | エンドポイント | メソッド | 説明 |
|---------|--------------|---------|------|
| **認証** | `/accounts/api/discord/login/` | GET | Discord OAuth2認証URL取得 |
| | `/accounts/api/discord/callback/` | GET | OAuth2コールバック処理 |
| | `/accounts/api/me/` | GET | 現在のユーザー情報取得 |
| | `/accounts/api/logout/` | POST | ログアウト |
| **プロフィール** | `/accounts/api/profile/` | POST/PUT | プロフィール作成・更新 |
| | `/accounts/api/profile/detail/` | GET | プロフィール詳細取得 |
| **ゲーム** | `/accounts/api/games/` | GET | ゲーム一覧取得 |
| **募集（Web用）** | `/accounts/api/recruitments/` | GET | 募集一覧取得 |
| | `/accounts/api/recruitments/create/` | POST | 募集作成 |
| | `/accounts/api/recruitments/<id>/` | GET | 募集詳細取得 |
| | `/accounts/api/recruitments/<id>/join/` | POST | 募集参加 |
| | `/accounts/api/recruitments/<id>/leave/` | POST | 募集離脱 |
| | `/accounts/api/recruitments/<id>/close/` | POST | 募集締切 |
| | `/accounts/api/recruitments/<id>/delete/` | DELETE | 募集削除 |
| **Discord募集** | `/accounts/api/discord/recruitments/` | GET | Discord募集一覧 |
| | `/accounts/api/discord/recruitments/create/` | POST | Discord募集作成 |
| | `/accounts/api/discord/recruitments/<id>/join/` | POST | 参加 |
| | `/accounts/api/discord/recruitments/<id>/leave/` | POST | 離脱 |
| | `/accounts/api/discord/recruitments/<id>/update/` | POST | 更新 |
| | `/accounts/api/discord/recruitments/<id>/delete/` | DELETE | 削除 |
| **Discordサーバー** | `/accounts/api/discord/server/<server_id>/setting/` | GET | サーバー設定取得 |
| | `/accounts/api/discord/server/setting/` | POST | サーバー設定保存 |
| **Riot API** | `/accounts/api/riot/link/` | POST | Riotアカウント連携 |
| | `/accounts/api/riot/account/` | GET | Riot情報取得 |
| | `/accounts/api/riot/refresh/` | POST | ランク更新 |
| | `/accounts/api/riot/unlink/` | POST | 連携解除 |
| **VC・評価** | `/accounts/api/discord/vc/join/` | POST | VC参加記録 |
| | `/accounts/api/discord/vc/leave/<id>/` | POST | VC退出記録 |
| | `/accounts/api/discord/ratings/submit/` | POST | 評価送信 |

#### **WebSocket エンドポイント**

| パス | 用途 |
|------|------|
| `/ws/discord-recruitments/` | Discord募集のリアルタイム更新 |

**WebSocketメッセージ形式**:

```json
// 募集作成
{
  "type": "recruitment_created",
  "recruitment": { /* DiscordRecruitmentデータ */ }
}

// 募集更新
{
  "type": "recruitment_update",
  "recruitment": { /* DiscordRecruitmentデータ */ }
}

// 募集削除
{
  "type": "recruitment_deleted",
  "recruitment_id": 123
}
```

---

### 3. Discord Bot

#### **Bot → バックエンド連携フロー**

```mermaid
sequenceDiagram
    participant User
    participant Discord
    participant Bot
    participant Backend
    participant DB

    User->>Discord: /recruit コマンド実行
    Discord->>Bot: コマンド受信
    Bot->>Backend: POST /api/discord/recruitments/create/
    Backend->>DB: DiscordRecruitment作成
    DB-->>Backend: 保存完了
    Backend-->>Bot: 募集IDを返す
    Bot->>Discord: Embedメッセージ送信
    Bot->>Backend: POST /api/discord/recruitments/{id}/update/<br/>(メッセージID保存)
    Backend->>WebSocket: broadcast 'recruitment_created'
    WebSocket-->>Frontend: リアルタイム通知
```

#### **主な処理フロー**

1. **サーバー設定** (`/setup`)
   - ユーザーがゲーム選択
   - `POST /api/discord/server/setting/` でサーバー設定を保存

2. **募集作成** (`/recruit`)
   - サーバー設定取得: `GET /api/discord/server/{server_id}/setting/`
   - モーダルで募集内容入力
   - `POST /api/discord/recruitments/create/` で募集作成
   - Embedメッセージを送信
   - `POST /api/discord/recruitments/{id}/update/` でメッセージID保存

3. **参加/退出ボタン**
   - 参加: `POST /api/discord/recruitments/{id}/join/`
   - 退出: `POST /api/discord/recruitments/{id}/leave/`
   - Embedメッセージを更新

4. **満員時のVC招待**
   - 募集が満員になる
   - 空いているVCを検索
   - 招待URLを生成（30分有効）
   - 全参加者にDM送信

---

## 📊 データモデル

### 主要モデル

#### **Account** (ユーザー)
- `discord_id` - Discord ID（ユニーク）
- `discord_username` - Discord表示名
- `avatar` - アバターURL
- `is_profile_complete` - プロフィール完成フラグ

#### **Game** (ゲーム)
- `slug` - URL用識別子
- `name` - ゲーム名
- `icon` - アイコンURL
- `color` - テーマカラー
- `max_players` - 最大人数

#### **DiscordRecruitment** (Discord募集)
- `game` - ゲームFK
- `discord_server_id` - サーバーID
- `discord_channel_id` - チャンネルID
- `discord_message_id` - メッセージID
- `discord_owner_id` - 募集者ID
- `title` - 募集タイトル
- `rank` - ランク条件
- `max_slots` - 最大人数
- `current_slots` - 現在人数
- `participants` - 参加者リスト（JSON）
- `status` - ステータス (open/closed/full/cancelled)

#### **DiscordServerSetting** (サーバー設定)
- `discord_server_id` - サーバーID（ユニーク）
- `game` - デフォルトゲームFK
- `default_max_slots` - デフォルト募集人数
- `voice_category_id` - VCカテゴリID

#### **VoiceChannelParticipation** (VC参加履歴)
- `recruitment` - 募集FK
- `discord_user_id` - ユーザーID
- `voice_channel_id` - VCID
- `joined_at` - 参加時刻
- `left_at` - 退出時刻
- `duration_seconds` - 滞在時間

#### **UserRating** (ユーザー評価)
- `recruitment` - 募集FK
- `rater_discord_id` - 評価者ID
- `rated_discord_id` - 評価対象ID
- `rating` - 評価（1-5）
- `comment` - コメント
- `is_auto_submitted` - 自動送信フラグ

---

## 🔐 認証フロー

### Discord OAuth2

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Discord

    User->>Frontend: ログインボタンクリック
    Frontend->>Backend: GET /api/discord/login/
    Backend-->>Frontend: Discord認証URL
    Frontend->>Discord: リダイレクト
    Discord-->>User: ログイン画面表示
    User->>Discord: 認証許可
    Discord->>Backend: GET /api/discord/callback/?code=xxx
    Backend->>Discord: POST /oauth2/token (codeをtokenに交換)
    Discord-->>Backend: access_token
    Backend->>Discord: GET /users/@me (ユーザー情報取得)
    Discord-->>Backend: ユーザー情報
    Backend->>DB: Account作成/更新
    Backend->>Session: ユーザーをログイン
    Backend-->>Frontend: リダイレクト (/)
```

**実装詳細** (`views.py: discord_callback`):

```python
# 1. codeをaccess_tokenに交換
token_response = requests.post('https://discord.com/api/oauth2/token', data={
    'client_id': DISCORD_CLIENT_ID,
    'client_secret': DISCORD_CLIENT_SECRET,
    'grant_type': 'authorization_code',
    'code': code,
    'redirect_uri': DISCORD_REDIRECT_URI,
})

# 2. ユーザー情報を取得
user_response = requests.get('https://discord.com/api/users/@me', headers={
    'Authorization': f'Bearer {access_token}'
})

# 3. Accountを作成/更新
account, created = Account.objects.get_or_create(
    discord_id=user_data['id'],
    defaults={
        'discord_username': user_data['username'],
        'avatar': avatar_url,
    }
)

# 4. Djangoセッションにログイン
login(request, account)
```

---

## 🌐 リアルタイム通信（WebSocket）

### Django Channels構成

#### **routing.py**
```python
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/discord-recruitments/', consumers.DiscordRecruitmentConsumer.as_asgi()),
]
```

#### **consumers.py**
```python
class DiscordRecruitmentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # グループに参加
        await self.channel_layer.group_add('discord_recruitments', self.channel_name)
        await self.accept()
    
    async def recruitment_update(self, event):
        # クライアントにメッセージ送信
        await self.send(text_data=json.dumps(event['data']))
```

#### **募集更新の通知** (`views.py`)

```python
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# 募集が更新されたとき
channel_layer = get_channel_layer()
async_to_sync(channel_layer.group_send)(
    'discord_recruitments',
    {
        'type': 'recruitment_update',
        'data': {
            'type': 'recruitment_created',
            'recruitment': recruitment_data
        }
    }
)
```

### フロントエンド WebSocket接続

```tsx
useEffect(() => {
  const ws = new WebSocket(`${WS_URL}/ws/discord-recruitments/`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'recruitment_created') {
      setRecruitments(prev => [data.recruitment, ...prev]);
    } else if (data.type === 'recruitment_update') {
      setRecruitments(prev => 
        prev.map(r => r.id === data.recruitment.id ? data.recruitment : r)
      );
    } else if (data.type === 'recruitment_deleted') {
      setRecruitments(prev => prev.filter(r => r.id !== data.recruitment_id));
    }
  };
  
  return () => ws.close();
}, []);
```

---

## 🎮 Discord Bot機能フロー

### Phase 1: VC管理機能

**VC参加監視**:
```python
@bot.event
async def on_voice_state_update(member, before, after):
    if before.channel is None and after.channel is not None:
        # VC参加時
        # POST /api/discord/vc/join/ で記録
        
    elif before.channel is not None and after.channel is None:
        # VC退出時
        # POST /api/discord/vc/leave/{id}/ で記録
```

**満員時VC招待**:
```python
async def check_and_send_vc_invite(recruitment_data):
    if recruitment_data['is_full']:
        # 空いているVCを検索
        available_vc = find_empty_voice_channel(guild)
        
        # 招待URL生成（30分有効）
        invite = await available_vc.create_invite(max_age=1800)
        
        # 全参加者にDM送信
        for user_id in all_participants:
            await user.send(embed=vc_invite_embed)
```

### Phase 4: ユーザー評価システム

**評価DM送信**:
```python
async def send_rating_dm(user, other_participants, recruitment_id):
    embed = discord.Embed(
        title="⭐ パーティメンバーを評価",
        description="評価しない場合、30分後に全員★5で自動送信"
    )
    view = RatingView(other_participants, recruitment_id)
    await user.send(embed=embed, view=view)
```

**評価送信**:
```python
class RatingView(discord.ui.View):
    async def submit_ratings(self, interaction):
        for user in self.rated_users:
            rating_data = {
                'recruitment_id': self.recruitment_id,
                'rater_discord_id': interaction.user.id,
                'rated_discord_id': user['discord_user_id'],
                'rating': self.ratings.get(user['discord_user_id'], 5)
            }
            await session.post('/api/discord/ratings/submit/', json=rating_data)
```

---

## 📡 API呼び出しパターン

### フロントエンド → バックエンド

#### **基本パターン**
```tsx
// GET リクエスト
const response = await fetch(`${API_URL}/accounts/api/me/`, {
  credentials: 'include', // Cookie送信
});
const data = await response.json();

// POST リクエスト
const response = await fetch(`${API_URL}/accounts/api/recruitments/create/`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '募集', game: 1 }),
});
```

#### **SSR（サーバーサイド）**
```tsx
async function getInitialData() {
  const res = await fetch(`${API_URL}/accounts/api/discord/recruitments/`, {
    cache: 'no-store', // キャッシュ無効
  });
  return await res.json();
}
```

### Discord Bot → バックエンド

```python
async with aiohttp.ClientSession() as session:
    url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/create/"
    data = {
        'game': game_id,
        'discord_server_id': str(interaction.guild.id),
        'discord_owner_id': str(interaction.user.id),
        'title': title,
        'max_slots': max_slots,
    }
    async with session.post(url, json=data) as response:
        result = await response.json()
        recruitment_id = result['recruitment']['id']
```

---

## 🔄 典型的なユースケースフロー

### 1. Discord募集作成 → Web表示

```mermaid
sequenceDiagram
    participant User
    participant Discord
    participant Bot
    participant Backend
    participant WebSocket
    participant Frontend

    User->>Discord: /recruit コマンド実行
    Discord->>Bot: コマンド受信
    Bot->>Backend: POST /api/discord/recruitments/create/
    Backend->>DB: DiscordRecruitment保存
    Backend->>WebSocket: broadcast 'recruitment_created'
    Backend-->>Bot: 募集データ返却
    Bot->>Discord: Embedメッセージ送信
    WebSocket-->>Frontend: 'recruitment_created'イベント
    Frontend->>Frontend: 募集リストに追加表示
```

### 2. Web SSR初期表示

```mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant Backend

    User->>NextJS: ページアクセス
    NextJS->>Backend: GET /api/discord/recruitments/
    Backend-->>NextJS: 募集一覧データ
    NextJS->>NextJS: HTML生成（SSR）
    NextJS-->>User: HTML配信
    User->>NextJS: JavaScriptロード（ハイドレーション）
    NextJS->>NextJS: WebSocket接続
    NextJS->>Backend: GET /api/me/ (認証)
    Backend-->>NextJS: ユーザー情報
```

### 3. 募集参加フロー

```mermaid
sequenceDiagram
    participant User
    participant Discord
    participant Bot
    participant Backend
    participant WebSocket
    participant Frontend

    User->>Discord: 参加ボタンクリック
    Discord->>Bot: Interaction受信
    Bot->>Backend: POST /api/discord/recruitments/{id}/join/
    Backend->>DB: participants更新
    Backend->>WebSocket: broadcast 'recruitment_update'
    Backend-->>Bot: 更新後データ
    Bot->>Discord: Embedメッセージ更新
    WebSocket-->>Frontend: 'recruitment_update'イベント
    Frontend->>Frontend: 募集情報更新表示
```

---

## 🛠️ 開発環境設定

### 環境変数

#### **フロントエンド** (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

#### **バックエンド** (`.env`)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/dbname
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

#### **Discord Bot** (`discord_bot/.env`)
```env
DISCORD_BOT_TOKEN=your_bot_token
BACKEND_API_URL=http://localhost:8000
```

---

## 📝 まとめ

### データフローの要点

1. **SSR + クライアントサイドのハイブリッド**
   - 初期データはサーバーサイドでフェッチ（高速表示・SEO）
   - ユーザー認証やリアルタイム更新はクライアント側

2. **WebSocketによるリアルタイム通信**
   - Django Channelsで募集の変更を全クライアントにブロードキャスト
   - フロントエンドは状態を自動更新

3. **Discord Bot統合**
   - Botはバックエンドをデータソースとして使用
   - 募集の作成・参加・退出を全てAPI経由で管理
   - WebSocket経由でWeb側にも即座に反映

4. **認証**
   - Discord OAuth2で統一認証
   - セッションベース（Django）
   - Cookie経由でフロントエンドとバックエンドが連携

5. **スケーラビリティ**
   - RedisをChannelsバックエンドとして使用
   - 複数サーバーでのWebSocket共有が可能
   - PostgreSQLで永続化
