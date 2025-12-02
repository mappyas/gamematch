# accounts/models.py
import json
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class AccountManager(BaseUserManager):
    def create_user(self, discord_id, discord_username, password=None, **extra_fields):
        if not discord_id:
            raise ValueError('Discord IDは必須です')
        
        user = self.model(
            discord_id=discord_id,
            discord_username=discord_username,
            **extra_fields
        )
        
        # パスワードが指定されていれば設定、なければ無効化
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        
        user.save(using=self._db)
        return user
    
    def create_superuser(self, discord_id, discord_username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(discord_id, discord_username, password, **extra_fields)


class Account(AbstractBaseUser, PermissionsMixin):
    """Discord OAuth2用のユーザーモデル"""
    
    # Discord から取得する情報
    discord_id = models.CharField(max_length=20, unique=True)  # DiscordのユーザーID
    discord_username = models.CharField(max_length=100)  # Discord表示名
    avatar = models.URLField(max_length=500, blank=True, null=True)  # アバター画像URL
    email = models.EmailField(blank=True, null=True)  # Discordから取得（オプション）
    
    # Django用
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # プロフィール登録済みかどうか
    is_profile_complete = models.BooleanField(default=False)
    
    # タイムスタンプ
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = AccountManager()
    
    USERNAME_FIELD = 'discord_id'
    REQUIRED_FIELDS = ['discord_username']
    
    def __str__(self):
        return f"{self.discord_username} ({self.discord_id})"


class Game(models.Model):
    """対応ゲーム一覧（管理画面から追加可能）"""
    
    slug = models.CharField(max_length=50, unique=True, help_text='URL用の識別子（例: apex, valorant）')
    name = models.CharField(max_length=100, help_text='ゲーム名')
    icon = models.URLField(max_length=500, blank=True, help_text='ゲームアイコンURL')
    color = models.CharField(max_length=7, default='#6366f1', help_text='テーマカラー（例: #DA292A）')
    max_players = models.PositiveIntegerField(default=4, help_text='最大パーティ人数')
    platforms = models.CharField(
        max_length=100, 
        default='pc,ps,xbox,switch,mobile,crossplay',
        help_text='対応プラットフォーム（カンマ区切り: pc,ps,xbox,switch,mobile,crossplay）'
    )

    is_active = models.BooleanField(default=True, help_text='サイトに表示するか')
    
    # 並び順
    order = models.PositiveIntegerField(default=0, help_text='表示順（小さいほど上）')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    @property
    def platforms_list(self):
        """プラットフォームをリストで返す"""
        return [p.strip() for p in self.platforms.split(',') if p.strip()]

class GameRank(models.Model):
    """ゲームごとのランク"""
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='ranks')
    rankname = models.CharField(max_length=100, help_text='ランク名')
    rankorder = models.PositiveIntegerField()
    icon = models.URLField(max_length=500, blank=True, help_text='ランクアイコンURL')

    class Meta:
        ordering = ['rankorder']
        unique_together = ['game', 'rankname']
    
    def __str__(self):
        return f"{self.game.name} - {self.rankname}"

class Profile(models.Model):
    """ユーザーの追加情報（ゲーム関連）"""
    
    PLATFORM_CHOICES = [
        ('pc', 'PC'),
        ('ps', 'PlayStation'),
        ('xbox', 'Xbox'),
        ('switch', 'Switch'),
        ('mobile', 'Mobile'),
    ]
    
    account = models.OneToOneField(Account, on_delete=models.CASCADE, related_name='profile')
    
    # 基本情報
    display_name = models.CharField(max_length=50, help_text='サイト上での表示名')
    main_game = models.ForeignKey(Game, on_delete=models.SET_NULL, null=True, blank=True, help_text='メインでプレイするゲーム')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='pc')
    
    # 自己紹介
    bio = models.TextField(max_length=500, blank=True, help_text='自己紹介')
    
    # タイムスタンプ
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.display_name}のプロフィール"


class GameAccount(models.Model):
    """ゲームごとのID（複数登録可能）"""
    
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='game_accounts')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='game_accounts')
    player_id = models.CharField(max_length=100, help_text='ゲーム内のプレイヤーID')
    rank = models.CharField(max_length=50, blank=True, help_text='ランク（任意）')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        # 同じゲームを2回登録できないようにする
        unique_together = ['profile', 'game']
    
    def __str__(self):
        return f"{self.profile.display_name} - {self.game.name}: {self.player_id}"


class Recruitment(models.Model):
    """パーティ募集"""
    
    STATUS_CHOICES = [
        ('open', '募集中'),
        ('closed', '締切'),
        ('cancelled', 'キャンセル'),
    ]
    
    PLATFORM_CHOICES = [
        ('pc', 'PC'),
        ('ps', 'PlayStation'),
        ('xbox', 'Xbox'),
        ('switch', 'Switch'),
        ('mobile', 'Mobile'),
        ('crossplay', 'クロスプレイ'),
    ]
    
    # 募集者
    owner = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='recruitments')
    
    # 募集内容
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='recruitments')
    title = models.CharField(max_length=100, help_text='募集タイトル')
    description = models.TextField(max_length=500, blank=True, help_text='詳細説明')
    
    # 条件
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='pc')
    max_players = models.PositiveIntegerField(default=4, help_text='募集人数（自分含む）')
    rank = models.CharField(max_length=50, blank=True, help_text='ランク条件')
    voice_chat = models.BooleanField(default=False, help_text='ボイスチャット必須か')
    
    # ステータス
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # タイムスタンプ
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.game.name})"
    
    @property
    def current_players(self):
        """現在の参加者数（募集者含む）"""
        return self.participants.filter(status='joined').count() + 1
    
    @property
    def is_full(self):
        """定員に達しているか"""
        return self.current_players >= self.max_players


class Participant(models.Model):
    """募集への参加者"""
    
    STATUS_CHOICES = [
        ('joined', '参加中'),
        ('left', '離脱'),
    ]
    
    recruitment = models.ForeignKey(Recruitment, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='participations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='joined')
    
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # 同じ募集に2回参加できないようにする
        unique_together = ['recruitment', 'user']
    
    def __str__(self):
        return f"{self.user.discord_username} → {self.recruitment.title}"

# ================================================
# API連携アカウントモデル
# ================================================
class RiotAccount(models.Model):
    """Riot Gamesアカウント"""

    REGION_CHOICES = [
        ('ap', 'Asia Pacific'),
        ('eu', 'Europe'),
        ('na', 'North America'),
        ('kr', 'Korea'),
        ('jp', 'Japan'),
        ('br', 'Brazil'),
        ('latam', 'Latin America'),
        ('oce', 'Oceania'),
        ('me', 'Middle East'),
    ]


    account = models.OneToOneField(Account, on_delete=models.CASCADE, related_name='riot_account')

    puuid = models.CharField(max_length=100, unique=True, help_text='統一識別子')
    game_name = models.CharField(max_length=100, help_text='RIOT ID')
    tag_line = models.CharField(max_length=100, help_text='タグライン')

    # LoL用
    summoner_id = models.CharField(max_length=100, blank=True,  help_text='サモナーID')
    lol_account_id = models.CharField(max_length=100, blank=True, help_text='アカウントID')

    region = models.CharField(max_length=10, choices=REGION_CHOICES, help_text='リージョン')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.game_name}#{self.tag_line}"
    
    @property
    def riot_id(self):
        """RIOT IDを返す(Player#Tag)"""
        return f"{self.game_name}#{self.tag_line}"

class LoLRank(models.Model):
    """LoLのランク"""

    QUEUE_TYPES = [
        ('RANKED_SOLO_5x5', 'ソロ/デュオ'),
        ('RANKED_FLEX_SR', 'フレックス'),
    ]
    
    TIER_CHOICES = [
        ('IRON', 'Iron'),
        ('BRONZE', 'Bronze'),
        ('SILVER', 'Silver'),
        ('GOLD', 'Gold'),
        ('PLATINUM', 'Platinum'),
        ('EMERALD', 'Emerald'),
        ('DIAMOND', 'Diamond'),
        ('MASTER', 'Master'),
        ('GRANDMASTER', 'Grandmaster'),
        ('CHALLENGER', 'Challenger'),
    ]

    riot_account = models.ForeignKey(RiotAccount, on_delete=models.CASCADE, related_name='ranks')

    queue_type = models.CharField(max_length=20, choices=QUEUE_TYPES, help_text='キュー種別')
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, help_text='ランク')
    rank = models.CharField(max_length=5, help_text='I, II, III, IV')
    league_points = models.IntegerField(default=0, help_text='LP')
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['riot_account', 'queue_type']
    
    def __str__(self):
        return f"{self.riot_account.riot_id} - {self.get_queue_type_display()}: {self.tier} {self.rank}"

    @property
    def display_rank(self):
        if self.tier in ['MASTER', 'GRANDMASTER', 'CHALLENGER']:
            return f"{self.tier.capitalize()} {self.league_points}"
        return f"{self.tier.capitalize()} {self.rank}"

class DiscordRecruitment(models.Model):
    
    STATUS_CHOICES = [
        ('open', '募集中'),
        ('closed', '締め切り'),
        ('cancelled', 'キャンセル')
    ]

    game = models.ForeignKey(Game, on_delete=models.CASCADE,)

    discord_message_id = models.CharField(max_length=30, blank=True, help_text='DiscordメッセージID')
    discord_channel_id = models.CharField(max_length=30, help_text='DiscordチャンネルID')
    discord_server_id = models.CharField(max_length=30, help_text='DiscordサーバーID')

    discord_owner_id = models.CharField(max_length=30, help_text='募集者のID')
    discord_owner_username = models.CharField(max_length=30, help_text='募集者の名前')

    title = models.CharField(max_length=100, help_text='募集タイトル')
    rank = models.CharField(max_length=50, blank=True, help_text='ランク条件')

    max_slots = models.PositiveIntegerField(default=4, help_text='最大募集人数（自分含む）')
    current_slots = models.PositiveIntegerField(default=0, help_text='現在の参加者数')
    
    # 参加者リスト（JSON形式）
    participants = models.TextField(default='[]', help_text='参加者リスト')
    
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
        return self.current_slots >= self.max_slots
    
    def add_participant(self, discord_user_id, discord_username):
        """参加者を追加"""
        # JSON文字列をリストに変換
        participants_list = json.loads(self.participants)
        
        # 既に参加しているかチェック
        if any(p['discord_user_id'] == discord_user_id for p in participants_list):
            return False, "既に参加しています"
        
        # 定員チェック
        if self.is_full:
            return False, "募集は満員です"
        
        # 参加者を追加
        participants_list.append({
            'discord_user_id': discord_user_id,
            'discord_username': discord_username
        })
        self.current_slots += 1
        
        # リストをJSON文字列に変換して保存
        self.participants = json.dumps(participants_list, ensure_ascii=False)
        
        # 満員になったら募集終了
        if self.is_full:
            self.status = 'closed'
        
        self.save()
        return True, "参加しました"
    
    def remove_participant(self, discord_user_id):
        """参加者を削除"""
        # JSON文字列をリストに変換
        participants_list = json.loads(self.participants)
        
        # 参加者リストから削除
        original_count = len(participants_list)
        participants_list = [
            p for p in participants_list 
            if p['discord_user_id'] != discord_user_id
        ]
        
        # 削除されたかチェック
        if len(participants_list) == original_count:
            return False, "参加していません"
        
        self.current_slots -= 1
        
        # リストをJSON文字列に変換して保存
        self.participants = json.dumps(participants_list, ensure_ascii=False)
        
        # 満員が解除されたら募集再開
        if self.status == 'closed' and not self.is_full:
            self.status = 'open'
        
        self.save()
        return True, "退出しました"


class DiscordServerSetting(models.Model):
    """Discordサーバーごとの設定"""
    
    discord_server_id = models.CharField(max_length=30, unique=True, help_text='DiscordサーバーID')
    discord_server_name = models.CharField(max_length=100, blank=True, help_text='サーバー名')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, help_text='このサーバーのゲーム')
    default_max_slots = models.PositiveIntegerField(default=3, help_text='デフォルト募集人数')
    
    voice_category_id = models.CharField(max_length=30, blank=True)
    available_voice_channels = models.TextField(default='[]')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Discordサーバー設定'
        verbose_name_plural = 'Discordサーバー設定'
    
    def __str__(self):
        return f"{self.discord_server_name} - {self.game.name}"

class VoiceChannelParticipation(models.Model):
    """ボイスチャンネル参加履歴"""
    recruitment = models.ForeignKey(DiscordRecruitment, on_delete=models.CASCADE, related_name='vc_participations')
    discord_user_id = models.CharField(max_length=30)
    discord_username = models.CharField(max_length=100)
    voice_channel_id = models.CharField(max_length=30)
    
    joined_at =  models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    
    def is_eligible_for_rating(self):
        return self.duration_seconds >= 1800
class UserRating(models.Model):
    """ユーザ評価"""
    recruitment = models.ForeignKey(DiscordRecruitment, on_delete=models.CASCADE, related_name='ratings')
    rater_discord_id = models.CharField(max_length=30)
    rater_discord_username = models.CharField(max_length=100)
    rated_discord_id = models.CharField(max_length=30)
    rated_discord_username = models.CharField(max_length=100)
    
    rating = models.IntegerField(default=5, choices=[(1,'⭐'),(2,'⭐⭐'),(3,'⭐⭐⭐'),(4,'⭐⭐⭐⭐'),(5,'⭐⭐⭐⭐⭐')])
    comment = models.TextField(blank=True, max_length=500)
    is_auto_submitted = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['recruitment', 'rater_discord_id', 'rated_discord_id']