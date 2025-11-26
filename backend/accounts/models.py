# accounts/models.py
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
