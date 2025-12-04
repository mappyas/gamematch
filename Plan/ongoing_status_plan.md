# 実装プラン: ongoingステータス追加によるチャットルーム化

# 修正
- Phase3, Phase4のbot.pyの変更は不要
- チャットルーム的なシステムはWEBサイトのみにもたす。
- ongoing中、万が一ユーザが抜けた場合に備え下記機能を用意
    - ongoing中は、WEBサイトのCurrentgamesectionに表示しつづける
    - 参加していたVCを抜けている可能性があるため、VC招待リンク再発行ボタンを作成
    - または、Discordの募集embedにVCのリンクを表示する

# 概要

満員になった募集を「進行中（ongoing）」ステータスに移行し、出入り自由なチャットルーム的な仕組みを実現します。

---

## Phase 1: バックエンド - モデル変更

### DiscordRecruitmentモデル

**ファイル**: `backend/accounts/models.py`

**変更箇所**: 327行目付近の `STATUS_CHOICES`

```python
STATUS_CHOICES = [
    ('open', '募集中'),        # 定員未達、参加受付中
    ('ongoing', '進行中'),      # 満員になった、出入り自由
    ('closed', '終了'),         # 募集者が手動で終了
    ('cancelled', 'キャンセル'),
]
```

**マイグレーション**:
```bash
cd backend
python manage.py makemigrations accounts -n add_ongoing_status
python manage.py migrate
```

---

## Phase 2: バックエンド - ロジック変更

### 2-1. 満員時に ongoing に変更

**ファイル**: `backend/accounts/models.py` (370-398行目)

`add_participant` メソッドを修正:

```python
def add_participant(self, discord_user_id, discord_username):
    """参加者を追加"""
    participants_list = json.loads(self.participants)
    
    if any(p['discord_user_id'] == discord_user_id for p in participants_list):
        return False, "既に参加しています"
    
    # ★★★ 変更: ongoing 状態でも参加可能 ★★★
    if self.status == 'open' and self.is_full:
        return False, "募集は満員です"
    elif self.status == 'ongoing' and self.is_full:
        return False, "部屋は満員です"
    elif self.status not in ['open', 'ongoing']:
        return False, "この募集は参加できません"
    
    participants_list.append({
        'discord_user_id': discord_user_id,
        'discord_username': discord_username
    })
    self.current_slots += 1
    self.participants = json.dumps(participants_list, ensure_ascii=False)
    
    # ★★★ 変更: 満員になったら ongoing に ★★★
    if self.is_full and self.status == 'open':
        self.status = 'ongoing'
    
    self.save()
    return True, "参加しました"
```

### 2-2. ongoing 時の退出を許可

**ファイル**: `backend/accounts/models.py` (400-426行目)

`remove_participant` メソッドを修正:

```python
def remove_participant(self, discord_user_id):
    """参加者を削除"""
    participants_list = json.loads(self.participants)
    
    original_count = len(participants_list)
    participants_list = [
        p for p in participants_list 
        if p['discord_user_id'] != discord_user_id
    ]
    
    if len(participants_list) == original_count:
        return False, "参加していません"
    
    self.current_slots -= 1
    self.participants = json.dumps(participants_list, ensure_ascii=False)
    
    # ★★★ 変更: ongoing はそのまま、全員退出なら closed ★★★
    if self.current_slots == 0:
        self.status = 'closed'
    # open状態で空きができたら再度募集可能に
    elif self.status == 'closed' and not self.is_full:
        self.status = 'open'
    
    self.save()
    return True, "退出しました"
```

### 2-3. 募集中ユーザーの参加制限を緩和

**ファイル**: `backend/accounts/views.py` (615-625行目)

ongoing 状態の募集には他の ongoing に参加できないように:

```python
# 既に他の ongoing に参加中でないかチェック
ongoing_recruitments = DiscordRecruitment.objects.filter(status='ongoing')
for other_recruitment in ongoing_recruitments:
    participants_list = json.loads(other_recruitment.participants)
    if any(p['discord_user_id'] == discord_user_id for p in participants_list):
        return JsonResponse({
            'error': '既に進行中の部屋に参加しています。退出してから参加してください。'
        }, status=400)
```

---



## Phase 3: Discord Bot - Embed表示

**ファイル**: `backend/discord_bot/bot.py` (305-360行目)

`create_recruitment_embed` 関数を修正:

```python
def create_recruitment_embed(recruitment_data: dict, game_name: str = '') -> discord.Embed:
    status = recruitment_data.get('status', 'open')
    is_full = recruitment_data.get('is_full', False)
    
    # ★★★ 変更: ongoing 時の表示 ★★★
    if status == 'ongoing':
        embed_title = f"🎮 {title}"
        color = discord.Color.blue()  # ongoing は青色
    elif is_full:
        embed_title = f"~~{title}~~"
        color = discord.Color.greyple()
    else:
        embed_title = f"{title}"
        color = discord.Color.green()
    
    # ... (省略)
    
    # ★★★ フッター変更 ★★★
    if status == 'ongoing':
        embed.set_footer(text="🔓 進行中 - 出入り自由です")
    elif is_full:
        embed.set_footer(text="この募集は満員です")
    else:
        embed.set_footer(text="下のボタンから参加できます")
```

---

## Phase 4: Discord Bot - ボタン制御

**ファイル**: `backend/discord_bot/bot.py` (218-242行目)

`RecruitmentView.__init__` を修正:

```python
def __init__(self, recruitment_id: int, max_slots: int, is_full: bool = False, status: str = 'open'):
    super().__init__(timeout=None)
    self.recruitment_id = recruitment_id
    self.max_slots = max_slots
    
    # ★★★ 参加ボタン: open または ongoing で空きがある場合 ★★★
    if (status == 'open' and not is_full) or (status == 'ongoing' and not is_full):
        join_btn = discord.ui.Button(...)
        self.add_item(join_btn)
    
    # ★★★ 退出ボタン: ongoing の時のみ ★★★
    if status == 'ongoing':
        leave_btn = discord.ui.Button(
            label='退出する',
            style=discord.ButtonStyle.red,
            emoji='❌',
            custom_id='leave_button'
        )
        leave_btn.callback = self.leave_button
        self.add_item(leave_btn)
    
    # WEBで開くボタン（常に表示）
    web_btn = discord.ui.Button(...)
    self.add_item(web_btn)
```

`leave_button` メソッドを追加（以前削除したものを復活）

---

## Phase 5: フロントエンド

**ファイル**: `frontend/src/components/CurrentGameSection.tsx`

ongoing の募集も表示し、ステータスを明示:

```tsx
export function CurrentGameSection({ myRecruitment }: CurrentGameSectionProps) {
    // ステータス表示
    const statusText = myRecruitment.status === 'ongoing' 
        ? '🎮 進行中 - 出入り自由' 
        : '📢 募集中';
    
    const statusColor = myRecruitment.status === 'ongoing'
        ? 'text-blue-400'
        : 'text-cyan-400';
    
    return (
        <div className="mb-8 animate-slideUp">
            <div className="glass-card-strong rounded-2xl p-8 border-l-4 border-cyan-400">
                <div className="flex items-center gap-4 mb-4">
                    <span className={`${statusColor} font-bold text-xl`}>
                        {statusText}
                    </span>
                </div>
                {/* 既存の表示内容 */}
            </div>
        </div>
    );
}
```

---

## マイグレーションと動作確認

1. バックエンドでマイグレーション実行
2. Discord Bot再起動
3. テストシナリオ:
   - 募集を作成（status='open'）
   - 満員になる（status='ongoing'に自動変更）
   - 退出ボタンで退出
   - 再度参加可能
   - 全員退出（status='closed'に自動変更）
