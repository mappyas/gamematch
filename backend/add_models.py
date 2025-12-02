# このスクリプトはmodels.pyに追加する新しいモデルのコードを生成します

new_models = '''

# ====================================================
# Phase 2: 新規モデル追加 (VC参加履歴とユーザ評価)
# ====================================================

class VoiceChannelParticipation(models.Model):
    """ボイスチャンネル参加履歴"""
    
    recruitment = models.ForeignKey(
        DiscordRecruitment, 
        on_delete=models.CASCADE, 
        related_name='vc_participations',
        help_text='関連する募集'
    )
    discord_user_id = models.CharField(max_length=30, help_text='DiscordユーザーID')
    discord_username = models.CharField(max_length=100, help_text='Discordユーザー名')
    voice_channel_id = models.CharField(max_length=30, help_text='VCチャンネルID')
    
    joined_at = models.DateTimeField(auto_now_add=True, help_text='参加日時')
    left_at = models.DateTimeField(null=True, blank=True, help_text='退出日時')
    duration_seconds = models.IntegerField(default=0, help_text='滞在時間(秒)')
    
    class Meta:
        ordering = ['-joined_at']
        verbose_name = 'VC参加履歴'
        verbose_name_plural = 'VC参加履歴'
    
    def __str__(self):
        return f"{self.discord_username} - {self.recruitment.title} ({self.duration_seconds}秒)"
    
    def is_eligible_for_rating(self):
        """評価対象かどうか（30分以上参加）"""
        return self.duration_seconds >= 1800  # 30分 = 1800秒


class UserRating(models.Model):
    """ユーザ評価"""
    
    RATING_CHOICES = [
        (1, '⭐'),
        (2, '⭐⭐'),
        (3, '⭐⭐⭐'),
        (4, '⭐⭐⭐⭐'),
        (5, '⭐⭐⭐⭐⭐'),
    ]
    
    recruitment = models.ForeignKey(
        DiscordRecruitment,
        on_delete=models.CASCADE,
        related_name='ratings',
        help_text='関連する募集'
    )
    rater_discord_id = models.CharField(max_length=30, help_text='評価する人のDiscord ID')
    rater_discord_username = models.CharField(max_length=100, help_text='評価する人の名前')
    rated_discord_id = models.CharField(max_length=30, help_text='評価される人のDiscord ID')
    rated_discord_username = models.CharField(max_length=100, help_text='評価される人の名前')
    
    rating = models.IntegerField(
        choices=RATING_CHOICES,
        default=5,
        help_text='評価(1-5)'
    )
    comment = models.TextField(blank=True, max_length=500, help_text='コメント')
    is_auto_submitted = models.BooleanField(default=False, help_text='自動送信されたか')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'ユーザ評価'
        verbose_name_plural = 'ユーザ評価'
        # 同じ募集で同じ組み合わせの評価は1回のみ
        unique_together = ['recruitment', 'rater_discord_id', 'rated_discord_id']
    
    def __str__(self):
        return f"{self.rater_discord_username} → {self.rated_discord_username}: {self.rating}★"
'''

# models.pyに追加
with open('accounts/models.py', 'a', encoding='utf-8') as f:
    f.write(new_models)

print("✅ 新しいモデルを追加しました")
