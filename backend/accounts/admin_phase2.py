
# Phase 2で追加したモデルの管理画面設定

@admin.register(VoiceChannelParticipation)
class VoiceChannelParticipationAdmin(admin.ModelAdmin):
    list_display = ['discord_username', 'recruitment', 'voice_channel_id', 'duration_seconds', 'joined_at', 'left_at']
    list_filter = ['joined_at']
    search_fields = ['discord_username', 'discord_user_id']
    ordering = ['-joined_at']
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # 編集時
            return ['joined_at']
        return []

@admin.register(UserRating)
class UserRatingAdmin(admin.ModelAdmin):
    list_display = ['rater_discord_username', 'rated_discord_username', 'rating', 'recruitment', 'is_auto_submitted', 'created_at']
    list_filter = ['rating', 'is_auto_submitted', 'created_at']
    search_fields = ['rater_discord_username', 'rated_discord_username']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
