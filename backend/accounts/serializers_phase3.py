
# Phase 3: 新規シリアライザ追加
from .models import VoiceChannelParticipation, UserRating


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
