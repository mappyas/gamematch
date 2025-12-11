# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Account, Profile, Game, GameAccount, Recruitment, Participant, 
    GameRank, RiotAccount, LoLRank, DiscordServerSetting,
    VoiceChannelParticipation, UserRating, DiscordRecruitment
)


@admin.register(Account)
class AccountAdmin(BaseUserAdmin):
    list_display = ['discord_username', 'discord_id', 'is_profile_complete', 'created_at']
    list_filter = ['is_active', 'is_staff', 'is_profile_complete']
    search_fields = ['discord_username', 'discord_id', 'email']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('discord_id', 'discord_username')}),
        ('Discord情報', {'fields': ('avatar', 'email')}),
        ('権限', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_profile_complete')}),
        ('日時', {'fields': ('created_at', 'updated_at')}),
    )
    readonly_fields = ['created_at', 'updated_at']
    
    # パスワードフィールドは使わない
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('discord_id', 'discord_username'),
        }),
    )


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'max_players', 'is_active', 'order']
    list_filter = ['is_active']
    search_fields = ['name', 'slug']
    ordering = ['order', 'name']
    list_editable = ['is_active', 'order']  # 一覧画面から直接編集可能

@admin.register(GameRank)
class GameRank(admin.ModelAdmin):
    list_display = ['game', 'rankname', 'rankorder', 'icon']
    list_filter = ['game']
    ordering = ['game', 'rankorder']


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'account', 'main_game', 'platform', 'created_at']
    list_filter = ['platform', 'main_game']
    search_fields = ['display_name', 'account__discord_username']


@admin.register(GameAccount)
class GameAccountAdmin(admin.ModelAdmin):
    list_display = ['profile', 'game', 'player_id', 'rank']
    list_filter = ['game']
    search_fields = ['profile__display_name', 'player_id']


@admin.register(Recruitment)
class RecruitmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'game', 'owner', 'platform', 'status', 'current_players', 'max_players', 'created_at']
    list_filter = ['status', 'game', 'platform', 'voice_chat']
    search_fields = ['title', 'owner__discord_username']
    ordering = ['-created_at']
    
    def current_players(self, obj):
        return obj.current_players
    current_players.short_description = '現在人数'

@admin.register(DiscordRecruitment)
class DiscordRecruitmentAdmin(admin.ModelAdmin):
    list_display = ['game', 'discord_owner_id', 'title']

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'recruitment', 'status', 'joined_at']
    list_filter = ['status']
    search_fields = ['user__discord_username', 'recruitment__title']

@admin.register(RiotAccount)
class RiotAccountAdmin(admin.ModelAdmin):
    list_display = ['account', 'puuid', 'game_name', 'tag_line', 'region', 'created_at']

@admin.register(LoLRank)
class LoLRankAdmin(admin.ModelAdmin):
    list_display = ['riot_account', 'queue_type', 'tier', 'rank', 'league_points', 'wins', 'losses', 'updated_at']
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

@admin.register(DiscordServerSetting)
class DiscordServerSettingAdmin(admin.ModelAdmin):
    list_display = ['discord_server_name', 'game', 'discord_server_id', 'recruitment_channel_id', 'default_max_slots']
    list_filter = ['game']
    search_fields = ['discord_server_name', 'discord_server_id']
    fieldsets = (
        ('サーバー情報', {'fields': ('discord_server_id', 'discord_server_name', 'game')}),
        ('募集設定', {'fields': ('recruitment_channel_id', 'webhook_url', 'default_max_slots')}),
        ('VC設定', {'fields': ('voice_category_id', 'available_voice_channels')}),
    )
