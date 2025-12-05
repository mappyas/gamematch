# accounts/serializers.py
"""
シリアライザー
モデルインスタンスをJSON形式に変換するための関数群
"""
from typing import Optional, Dict, Any, List
from .models import (
    Account, Profile, Game, GameAccount, Recruitment, 
    Participant, RiotAccount, LoLRank, DiscordRecruitment,
    VoiceChannelParticipation, UserRating
)
from rest_framework import serializers


def serialize_game(game: Game) -> Dict[str, Any]:
    """ゲーム情報をシリアライズ"""
    return {
        'id': game.id,
        'name': game.name,
        'slug': game.slug,
        'icon': game.icon,
        'color': game.color,
        'bannerUrl': game.bannerUrl,
    }


def serialize_user(user: Account, include_email: bool = False) -> Dict[str, Any]:
    """ユーザー情報をシリアライズ"""
    data = {
        'id': user.id,
        'discord_id': user.discord_id,
        'discord_username': user.discord_username,
        'avatar': user.avatar,
    }
    if include_email:
        data['email'] = user.email
        data['is_profile_complete'] = user.is_profile_complete
        data['created_at'] = user.created_at.isoformat()
    return data


def serialize_game_account(game_account: GameAccount) -> Dict[str, Any]:
    """ゲームアカウント情報をシリアライズ"""
    return {
        'id': game_account.id,
        'game': serialize_game(game_account.game),
        'player_id': game_account.player_id,
        'rank': game_account.rank,
    }


def serialize_profile(profile: Profile) -> Dict[str, Any]:
    """プロフィール情報をシリアライズ"""
    game_accounts = profile.game_accounts.select_related('game').all()
    
    return {
        'display_name': profile.display_name,
        'main_game': serialize_game(profile.main_game) if profile.main_game else None,
        'platform': profile.platform,
        'bio': profile.bio,
        'created_at': profile.created_at.isoformat(),
        'updated_at': profile.updated_at.isoformat(),
        'game_accounts': [serialize_game_account(ga) for ga in game_accounts],
    }


def serialize_recruitment(
    recruitment: Recruitment, 
    include_owner: bool = True,
    include_participants: bool = False
) -> Dict[str, Any]:
    """募集情報をシリアライズ"""
    data = {
        'id': recruitment.id,
        'title': recruitment.title,
        'description': recruitment.description,
        'game': serialize_game(recruitment.game),
        'platform': recruitment.platform,
        'max_players': recruitment.max_players,
        'current_players': recruitment.current_players,
        'rank': recruitment.rank,
        'voice_chat': recruitment.voice_chat,
        'status': recruitment.status,
        'created_at': recruitment.created_at.isoformat(),
        'updated_at': recruitment.updated_at.isoformat(),
        'is_full': recruitment.is_full,
    }
    
    if include_owner:
        data['owner'] = serialize_user(recruitment.owner)
    
    if include_participants:
        participants = recruitment.participants.filter(
            status='joined'
        ).select_related('user')
        data['participants'] = [
            {
                'id': p.user.id,
                'discord_username': p.user.discord_username,
                'avatar': p.user.avatar,
                'joined_at': p.joined_at.isoformat(),
            }
            for p in participants
        ]
    
    return data


def serialize_participation(participation: Participant) -> Dict[str, Any]:
    """参加情報をシリアライズ（参加した募集用）"""
    recruitment = participation.recruitment
    data = serialize_recruitment(recruitment, include_owner=True)
    data['joined_at'] = participation.joined_at.isoformat()
    return data


def serialize_lol_rank(rank: LoLRank) -> Dict[str, Any]:
    """LoLランク情報をシリアライズ"""
    return {
        'queue_type': rank.queue_type,
        'queue_type_display': rank.get_queue_type_display(),
        'tier': rank.tier,
        'rank': rank.rank,
        'league_points': rank.league_points,
        'wins': rank.wins,
        'losses': rank.losses,
        'display_rank': rank.display_rank,
    }


def serialize_riot_account(riot_account: RiotAccount) -> Dict[str, Any]:
    """Riotアカウント情報をシリアライズ"""
    ranks = riot_account.ranks.all()
    
    return {
        'riot_id': riot_account.riot_id,
        'game_name': riot_account.game_name,
        'tag_line': riot_account.tag_line,
        'region': riot_account.region,
        'lol_ranks': [serialize_lol_rank(rank) for rank in ranks],
    }


def serialize_profile_detail(user: Account) -> Dict[str, Any]:
    """マイページ用の詳細プロフィール情報をシリアライズ"""
    # 基本情報
    user_data = serialize_user(user, include_email=True)
    
    # プロフィール情報
    profile_data = None
    if hasattr(user, 'profile'):
        profile_data = serialize_profile(user.profile)
    
    # 作成した募集一覧（最新20件）
    created_recruitments = user.recruitments.select_related('game').order_by('-created_at')[:20]
    created_recruitments_data = [
        serialize_recruitment(r, include_owner=False) 
        for r in created_recruitments
    ]
    
    # 参加した募集一覧（最新20件）
    participations = user.participations.filter(
        status='joined'
    ).select_related(
        'recruitment', 
        'recruitment__game', 
        'recruitment__owner'
    ).order_by('-joined_at')[:20]
    participated_recruitments_data = [
        serialize_participation(p) 
        for p in participations
    ]
    
    # Riotアカウント情報
    riot_data = None
    if hasattr(user, 'riot_account'):
        riot_data = serialize_riot_account(user.riot_account)
    
    return {
        'user': user_data,
        'profile': profile_data,
        'created_recruitments': created_recruitments_data,
        'participated_recruitments': participated_recruitments_data,
        'riot_account': riot_data,
    }

class DiscordRecruitmentSerializer(serializers.ModelSerializer):
    """Discord募集のシリアライザー"""
    participants_list = serializers.SerializerMethodField()
    game_name = serializers.CharField(source='game.name', read_only=True)
    icon = serializers.CharField(source='game.icon', read_only=True)
    discord_owner_avatar = serializers.SerializerMethodField()

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
            'discord_owner_avatar',
            'title',
            'rank',
            'icon',
            'max_slots',
            'current_slots',
            'participants',
            'participants_list',
            'status',
            'is_full',
            'vc_channel_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_full', 'created_at', 'updated_at']
    
    def get_discord_owner_avatar(self, obj):
        """募集者のアバターURLを取得"""
        try:
            account = Account.objects.get(discord_id=obj.discord_owner_id)
            return account.avatar
        except Account.DoesNotExist:
            return None
    
    def get_participants_list(self, obj):
        """participantsフィールド（JSON文字列）をリストに変換し、アバターを動的に取得"""
        import json
        try:
            participants = json.loads(obj.participants)
            # 各参加者のアバターをAccountから取得
            for p in participants:
                if not p.get('avatar'):
                    try:
                        account = Account.objects.get(discord_id=p['discord_user_id'])
                        p['avatar'] = account.avatar
                    except Account.DoesNotExist:
                        p['avatar'] = None
            return participants
        except:
            return []

class VoiceChannelParticipationSerializer(serializers.ModelSerializer):
    """VC参加履歴シリアライザ"""
    
    class Meta:
        model = VoiceChannelParticipation
        fields = [
            'id', 'recruitment', 'discord_user_id', 'discord_username',
            'voice_channel_id', 'joined_at', 'left_at', 'duration_seconds'
        ]
        read_only_fields = ['id', 'joined_at']


class UserRatingSerializer(serializers.ModelSerializer):
    """ユーザー評価シリアライザ"""
    
    class Meta:
        model = UserRating
        fields = [
            'id', 'recruitment', 'rater_discord_id', 'rater_discord_username',
            'rated_discord_id', 'rated_discord_username', 'rating',
            'comment', 'is_auto_submitted', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, attrs):
        """評価の検証"""
        # 自分自身を評価できないようにする
        if attrs.get('rater_discord_id') == attrs.get('rated_discord_id'):
            raise serializers.ValidationError("自分自身を評価することはできません")
        
        return attrs
