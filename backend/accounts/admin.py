# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Account, Profile, Game, GameAccount, Recruitment, Participant


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


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'recruitment', 'status', 'joined_at']
    list_filter = ['status']
    search_fields = ['user__discord_username', 'recruitment__title']
