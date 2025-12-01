# Step 2: シリアライザーの作成

シリアライザーは、**モデルのデータをJSON形式に変換**する役割を持ちます。

---

## 📁 ファイル: `backend/accounts/serializers.py`

このファイルに`DiscordRecruitmentSerializer`を追加します。

---

## 💻 コード（自分で打ってみよう！）

ファイルの**最後**に以下を追加してください：

```python
class DiscordRecruitmentSerializer(serializers.ModelSerializer):
    """Discord募集のシリアライザー"""
    
    # participantsをリストとして返すカスタムフィールド
    participants_list = serializers.SerializerMethodField()
    # ゲーム名も一緒に返す
    game_name = serializers.CharField(source='game.name', read_only=True)
    
    class Meta:
        model = DiscordRecruitment
        fields = [
            'id',
            'game',
            'game_name',
            'discord_message_id',
            'discord_channel_id',
            'discord_server_id',
            'discord_owner_id',
            'discord_owner_username',
            'title',
            'description',
            'max_slots',
            'current_slots',
            'participants',
            'participants_list',
            'status',
            'is_full',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_full', 'created_at', 'updated_at']
    
    def get_participants_list(self, obj):
        """participantsフィールド（JSON文字列）をリストに変換"""
        import json
        try:
            return json.loads(obj.participants)
        except:
            return []
```

---

## 📝 コードの解説

### 1. `SerializerMethodField`

```python
participants_list = serializers.SerializerMethodField()
```

- カスタムフィールドを追加
- `get_participants_list`メソッドで値を返す

### 2. `source`

```python
game_name = serializers.CharField(source='game.name', read_only=True)
```

- `game.name`（関連モデルのフィールド）を取得
- APIレスポンスに`game_name`を含める

### 3. `Meta`クラス

```python
class Meta:
    model = DiscordRecruitment
    fields = [...]  # APIに含めるフィールド一覧
    read_only_fields = [...]  # 読み取り専用フィールド
```

### 4. `get_participants_list`メソッド

```python
def get_participants_list(self, obj):
    import json
    return json.loads(obj.participants)
```

- `participants`（JSON文字列）をPythonのリストに変換
- APIレスポンスで使いやすくする

---

## 📊 APIレスポンスの例

このシリアライザーを使うと、以下のようなJSONが返されます：

```json
{
    "id": 1,
    "game": 2,
    "game_name": "Apex Legends",
    "title": "カジュアル募集",
    "max_slots": 3,
    "current_slots": 2,
    "participants": "[{\"discord_user_id\": \"123\", \"discord_username\": \"太郎\"}, ...]",
    "participants_list": [
        {"discord_user_id": "123", "discord_username": "太郎"},
        {"discord_user_id": "456", "discord_username": "花子"}
    ],
    "status": "open",
    "is_full": false
}
```

---

## ✅ 確認ポイント

1. `import` が追加されているか確認
2. インデントが正しいか確認
3. メソッド名のスペルミス（`get_participants_list`）

---

## 次のステップ

シリアライザーを追加したら教えてください！
次は**APIエンドポイント（views.py）**を実装します。
