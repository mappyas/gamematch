# Phase 2: バックエンドAPI実装ガイド

Phase 2では、Discord Botからのリクエストを受け取るためのバックエンドAPIを実装します。

---

## 📋 実装の流れ

1. **DiscordRecruitmentモデルの作成** ← まずここから！
2. マイグレーション実行
3. シリアライザーの作成
4. APIエンドポイントの実装
5. URLルーティングの設定

---

## Step 1: DiscordRecruitmentモデルを作成

### 📁 ファイル: `backend/accounts/models.py`

既存の`models.py`の**最後**に以下のモデルを追加してください。

### 🎯 追加する場所

`Line 322`（ファイルの最後）の後に追加します。

### 💻 コード（自分で打ってみよう！）

```python
class DiscordRecruitment(models.Model):
    """Discord Bot経由のパーティ募集"""
    
    STATUS_CHOICES = [
        ('open', '募集中'),
        ('closed', '締切'),
        ('cancelled', 'キャンセル'),
    ]
    
    # Discord情報
    discord_message_id = models.CharField(max_length=20, blank=True, help_text='DiscordメッセージID')
    discord_channel_id = models.CharField(max_length=20, help_text='チャンネルID')
    discord_guild_id = models.CharField(max_length=20, help_text='サーバーID')
    
    # 募集者（Discordユーザー）
    owner_discord_id = models.CharField(max_length=20, help_text='募集者のDiscord ID')
    owner_discord_username = models.CharField(max_length=100, help_text='募集者のDiscord名')
    
    # 募集内容
    title = models.CharField(max_length=100, help_text='募集タイトル')
    description = models.TextField(max_length=500, blank=True, help_text='詳細説明')
    
    # 人数管理
    max_slots = models.PositiveIntegerField(default=5, help_text='最大人数')
    current_slots = models.PositiveIntegerField(default=0, help_text='現在の参加者数')
    
    # 参加者リスト（JSON形式）
    participants = models.JSONField(default=list, help_text='参加者リスト')
    
    # ステータス
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # タイムスタンプ
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Discord募集'
        verbose_name_plural = 'Discord募集'
    
    def __str__(self):
        return f"{self.title} ({self.current_slots}/{self.max_slots})"
    
    @property
    def is_full(self):
        """定員に達しているか"""
        return self.current_slots >= self.max_slots
    
    def add_participant(self, discord_user_id, discord_username):
        """参加者を追加"""
        # 既に参加しているかチェック
        if any(p['discord_user_id'] == discord_user_id for p in self.participants):
            return False, "既に参加しています"
        
        # 定員チェック
        if self.is_full:
            return False, "募集は満員です"
        
        # 参加者を追加
        self.participants.append({
            'discord_user_id': discord_user_id,
            'discord_username': discord_username
        })
        self.current_slots += 1
        
        # 満員になったら募集終了
        if self.is_full:
            self.status = 'closed'
        
        self.save()
        return True, "参加しました"
    
    def remove_participant(self, discord_user_id):
        """参加者を削除"""
        # 参加者リストから削除
        original_count = len(self.participants)
        self.participants = [
            p for p in self.participants 
            if p['discord_user_id'] != discord_user_id
        ]
        
        # 削除されたかチェック
        if len(self.participants) == original_count:
            return False, "参加していません"
        
        self.current_slots -= 1
        
        # 満員が解除されたら募集再開
        if self.status == 'closed' and not self.is_full:
            self.status = 'open'
        
        self.save()
        return True, "退出しました"
```

---

### 📝 コードの解説

#### フィールドの説明

| フィールド名 | 型 | 説明 |
|------------|---|------|
| `discord_message_id` | CharField | Discordメッセージの一意ID |
| `discord_channel_id` | CharField | どのチャンネルで募集されたか |
| `discord_guild_id` | CharField | どのサーバーで募集されたか |
| `owner_discord_id` | CharField | 募集者のDiscord ID |
| `owner_discord_username` | CharField | 募集者のDiscord名 |
| `title` | CharField | 募集タイトル |
| `description` | TextField | 詳細説明 |
| `max_slots` | PositiveIntegerField | 最大人数 |
| `current_slots` | PositiveIntegerField | 現在の参加者数 |
| `participants` | JSONField | 参加者リスト（配列） |
| `status` | CharField | 募集状態（open/closed/cancelled） |

#### 重要なメソッド

**`add_participant(discord_user_id, discord_username)`**
- 参加者を追加
- 重複チェック、定員チェックを実行
- 満員になったら自動的に`status`を`closed`に変更

**`remove_participant(discord_user_id)`**
- 参加者を削除
- 満員が解除されたら自動的に`status`を`open`に戻す

---

## ✅ 確認ポイント

コードを追加したら：

1. **インデントが正しいか確認**
   - Pythonはインデント（スペース）が重要です
   - クラス内のメソッドは4スペースのインデント

2. **コロン（`:`）を忘れていないか**
   - `class DiscordRecruitment(models.Model):`
   - `def add_participant(...):`

3. **保存する**

---

## 次のステップ

モデルを追加したら教えてください！
次は**マイグレーション**を実行して、データベースに反映します。
