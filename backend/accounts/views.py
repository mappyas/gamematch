# accounts/views.py
import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login
import json
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import VoiceChannelParticipationSerializer, UserRatingSerializer
from django.utils import timezone
from rest_framework.permissions import AllowAny
from .models import Account, Profile, Game, Recruitment, Participant, GameRank, RiotAccount, LoLRank, DiscordRecruitment, DiscordServerSetting,VoiceChannelParticipation, UserRating, DiscordRecruitment

# Discord OAuth2 設定
DISCORD_CLIENT_ID = settings.DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET = settings.DISCORD_CLIENT_SECRET
DISCORD_REDIRECT_URI = settings.DISCORD_REDIRECT_URI
DISCORD_API_ENDPOINT = 'https://discord.com/api/v10'


@csrf_exempt
def create_profile(request):
    """プロフィールを作成・更新"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    try:
        data = json.loads(request.body)
        
        display_name = data.get('display_name', '').strip()
        if not display_name:
            return JsonResponse({'error': '表示名は必須です'}, status=400)
        
        if len(display_name) > 50:
            return JsonResponse({'error': '表示名は50文字以内で入力してください'}, status=400)
        
        bio = data.get('bio', '').strip()
        if len(bio) > 500:
            return JsonResponse({'error': '自己紹介は500文字以内で入力してください'}, status=400)
        
        platform = data.get('platform', 'pc')
        valid_platforms = ['pc', 'ps', 'xbox', 'switch', 'mobile']
        if platform not in valid_platforms:
            return JsonResponse({'error': '無効なプラットフォームです'}, status=400)
        
        # プロフィール作成または更新
        profile, created = Profile.objects.update_or_create(
            account=request.user,
            defaults={
                'display_name': display_name,
                'platform': platform,
                'bio': bio,
            }
        )
        
        # プロフィール完了フラグを更新
        request.user.is_profile_complete = True
        request.user.save()
        
        from .serializers import serialize_profile
        return JsonResponse({
            'success': True,
            'profile': serialize_profile(profile),
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': '無効なJSON形式です'}, status=400)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Profile creation error: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'プロフィールの作成に失敗しました'}, status=500)

@api_view(['GET'])
def get_current_user(request):
    """現在のログインユーザー情報を取得"""
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False})
    try:
        from .serializers import serialize_user, serialize_profile
        
        user = request.user #Djangoが勝手にセット
        profile_data = None
        
        if hasattr(user, 'profile'):
            profile_data = serialize_profile(user.profile)
        
        return JsonResponse({
            'authenticated': True,
            'user': serialize_user(user, include_email=True),
            'profile': profile_data,
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Get current user error: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'ユーザー情報の取得に失敗しました'}, status=500)


@csrf_exempt
def logout_user(request):
    """ログアウト"""
    from django.contrib.auth import logout
    logout(request)
    return JsonResponse({'success': True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_detail(request):
    """マイページ用の詳細プロフィール情報を取得"""
    try:
        from .serializers import serialize_profile_detail
        data = serialize_profile_detail(request.user)
        return JsonResponse(data)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Profile detail error: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'プロフィール情報の取得に失敗しました'}, status=500)

class UserProfileView(APIView):

    def get(self,request, discord_id):
        try:
            from .serializers import serialize_profile_detail
            user = Account.objects.get(discord_id=discord_id)
            data = serialize_profile_detail(user)
            return Response(data)
        except Account.DoesNotExist:
            return Response({'error': 'ユーザーが見つかりません'}, status=404)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"User profile error: {str(e)}", exc_info=True)
            return JsonResponse({'error': 'ユーザー情報の取得に失敗しました'}, status=500)
            

# ============================================
# 募集関連API
# ============================================

@api_view(['GET'])
def get_games(request):
    """ゲーム一覧を取得"""
    from .serializers import serialize_game
    games = Game.objects.filter(is_active=True)
    gamedata = [serialize_game(game) for game in games]
    return Response(gamedata)

@api_view(['GET'])
def get_recruitments(request):
    """募集一覧を取得"""
    try:
        from .serializers import serialize_recruitment
        from django.db.models import Prefetch
        
        recruitments = Recruitment.objects.filter(
            status='open'
        ).select_related('game', 'owner').prefetch_related(
            Prefetch(
                'participants',
                queryset=Participant.objects.filter(status='joined').select_related('user')
            )
        ).order_by('-created_at')
        
        # フィルタリング
        game_slug = request.GET.get('game')
        platform = request.GET.get('platform')
        
        if game_slug:
            recruitments = recruitments.filter(game__slug=game_slug)
        if platform:
            recruitments = recruitments.filter(platform=platform)
        
        # 最大200件まで
        recruitments = recruitments[:200]
        
        return JsonResponse({
            'recruitments': [
                serialize_recruitment(r, include_owner=True, include_participants=True) 
                for r in recruitments
            ]
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Get recruitments error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '募集一覧の取得に失敗しました'}, status=500)

@api_view(['GET'])
def get_recruitment_detail(request, recruitment_id):
    """募集の詳細を取得"""
    try:
        from .serializers import serialize_recruitment
        
        r = Recruitment.objects.select_related('game', 'owner').get(id=recruitment_id)
        
        return JsonResponse({
            'recruitment': serialize_recruitment(
                r, 
                include_owner=True, 
                include_participants=True
            )
        })
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Get recruitment detail error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '募集詳細の取得に失敗しました'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_recruitment(request, recruitment_id):
    """募集に参加"""
    
    try:
        recruitment = Recruitment.objects.select_related('game', 'owner').get(id=recruitment_id)
        
        # チェック
        if recruitment.owner == request.user:
            return JsonResponse({'error': '自分の募集には参加できません'}, status=400)
        
        if recruitment.status != 'open':
            return JsonResponse({'error': 'この募集は締め切られています'}, status=400)
        
        if recruitment.is_full:
            return JsonResponse({'error': '定員に達しています'}, status=400)
        
        # 既に参加していないかチェック（離脱した場合も含む）
        participant, created = Participant.objects.get_or_create(
            recruitment=recruitment,
            user=request.user,
            defaults={'status': 'joined'}
        )
        
        if not created:
            if participant.status == 'joined':
                return JsonResponse({'error': '既に参加しています'}, status=400)
            else:
                # 離脱していた場合は再参加
                participant.status = 'joined'
                participant.save()
        
        # 定員に達したら自動で締め切り
        recruitment.refresh_from_db()
        if recruitment.is_full:
            recruitment.status = 'closed'
            recruitment.save()
        
        return JsonResponse({
            'success': True,
            'current_players': recruitment.current_players,
            'is_full': recruitment.is_full,
        })
        
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Join recruitment error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '参加処理に失敗しました'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_recruitment(request, recruitment_id):
    """募集から離脱"""
    try:
        recruitment = Recruitment.objects.select_related('game').get(id=recruitment_id)
        
        participant = Participant.objects.filter(
            recruitment=recruitment,
            user=request.user,
            status='joined'
        ).first()
        
        if not participant:
            return JsonResponse({'error': '参加していません'}, status=400)
        
        participant.status = 'left'
        participant.save()
        
        # 締め切りだった場合、再度募集中に
        recruitment.refresh_from_db()
        if recruitment.status == 'closed' and not recruitment.is_full:
            recruitment.status = 'open'
            recruitment.save()
        
        return JsonResponse({
            'success': True,
            'current_players': recruitment.current_players,
            'is_full': recruitment.is_full,
        })
        
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Leave recruitment error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '離脱処理に失敗しました'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_recruitment(request, recruitment_id):
    """募集を締め切り（オーナーのみ）"""
    try:
        recruitment = Recruitment.objects.select_related('game').get(id=recruitment_id)
        
        if recruitment.owner != request.user:
            return JsonResponse({'error': '権限がありません'}, status=403)
        
        if recruitment.status == 'closed':
            return JsonResponse({'error': '既に締め切られています'}, status=400)
        
        recruitment.status = 'closed'
        recruitment.save()
        
        return JsonResponse({'success': True})
        
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Close recruitment error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '締切処理に失敗しました'}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_recruitment(request, recruitment_id):
    """募集を削除（オーナーのみ）"""
    try:
        recruitment = Recruitment.objects.select_related('game').get(id=recruitment_id)
        
        if recruitment.owner != request.user:
            return JsonResponse({'error': '権限がありません'}, status=403)
        
        recruitment.delete()
        
        return JsonResponse({'success': True})
        
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Delete recruitment error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '削除処理に失敗しました'}, status=500)


def cleanup_old_recruitments(request):
    """古い募集を自動削除（Cron Job用）"""
    from django.utils import timezone
    from datetime import timedelta
    
    # 2時間以上経過した募集を削除
    hours = int(request.GET.get('hours', 2))
    cutoff_time = timezone.now() - timedelta(hours=hours)
    
    old_recruitments = Recruitment.objects.filter(created_at__lt=cutoff_time)
    count = old_recruitments.count()
    old_recruitments.delete()
    
    return JsonResponse({
        'success': True,
        'deleted_count': count,
        'cutoff_hours': hours,
    })

# ================================================
# 外部API連携
# ================================================

# Discord OAuth2 
def discord_login(request):
    """Discord OAuth2 認証URLを返す"""
    discord_auth_url = (
        f"https://discord.com/api/oauth2/authorize"
        f"?client_id={DISCORD_CLIENT_ID}"
        f"&redirect_uri={DISCORD_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=identify%20email"
    )
    return JsonResponse({'auth_url': discord_auth_url})

# Discord OAutch2コールバック処理
@api_view(['POST'])
def discord_callback(request):
    try:
        data = json.loads(request.body)
        code = data.get('code')
        
        if not code:
            return JsonResponse({'error': '認証コードがありません'}, status=400)
        
        # 1. 認証コードをアクセストークンに交換
        # Discord APIを使ってPost　結果をtoken_responseに格納
        token_response = requests.post(
            f'{DISCORD_API_ENDPOINT}/oauth2/token',
            data={
                'client_id': DISCORD_CLIENT_ID,
                'client_secret': DISCORD_CLIENT_SECRET,
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': DISCORD_REDIRECT_URI,
            },
            headers={
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
        
        if token_response.status_code != 200:
            return JsonResponse({
                'error': 'トークンの取得に失敗しました',
                'details': token_response.json()
            }, status=400)
        
        token_data = token_response.json()
        access_token = token_data['access_token']
        
        # 2. アクセストークンでユーザー情報を取得
        user_response = requests.get(
            f'{DISCORD_API_ENDPOINT}/users/@me',
            headers={
                'Authorization': f'Bearer {access_token}'
            }
        )
        
        if user_response.status_code != 200:
            return JsonResponse({
                'error': 'ユーザー情報の取得に失敗しました'
            }, status=400)
        
        discord_user = user_response.json()
        discord_id = discord_user['id']
        discord_username = discord_user.get('global_name') or discord_user['username']
        email = discord_user.get('email')
        
        # アバターURL生成
        avatar_hash = discord_user.get('avatar')
        if avatar_hash:
            avatar_url = f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.png"
        else:
            avatar_url = None
        
        # 3. get_or_createでユーザーを作成または取得
        account, created = Account.objects.get_or_create(
            discord_id=discord_id,
            defaults={
                'discord_username': discord_username,
                'avatar': avatar_url,
                'email': email,
            }
        )
        
        # 既存ユーザーの場合、情報を更新
        if not created:
            account.discord_username = discord_username
            account.avatar = avatar_url
            if email:
                account.email = email
            account.save()
        
        # 4. Djangoセッションにログイン
        login(request, account)
        
        # 5. レスポンス
        return JsonResponse({
            'success': True,
            'is_new_user': created,
            'is_profile_complete': account.is_profile_complete,
            'user': {
                'id': account.id,
                'discord_id': account.discord_id,
                'discord_username': account.discord_username,
                'avatar': account.avatar,
            }
        })
        
    except Exception as e:
        print(f"Discord callback error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def discord_create_recruitment(request):
    """Discord募集を作成（BotまたはフロントエンドからのAPI）"""
    try:
        data = json.loads(request.body)
        
        # リクエストを送ったユーザーのDiscord IDがDBに登録されているか確認
        discord_owner_id = data.get('discord_owner_id')
        if not discord_owner_id:
            return JsonResponse({'error': 'discord_owner_idは必須です'}, status=400)
        
        # Discord IDがAccountモデルに登録されているか確認
        try:
            owner_account = Account.objects.get(discord_id=discord_owner_id)
        except Account.DoesNotExist:
            return JsonResponse({'error': 'このDiscord IDは登録されていません。先にサイトでDiscordログインしてください。'}, status=404)
        
        existing_recruitment = DiscordRecruitment.objects.filter(
            discord_owner_id = discord_owner_id,
            status = 'open'
        ).first()

        if existing_recruitment:
            return JsonResponse({'error': '既に募集中の募集は存在します。'}, status=400)

        open_recruitment = DiscordRecruitment.objects.filter(status = 'open')
        for recruitment in open_recruitment:
            participants_list = json.loads(recruitment.participants)
            if any(p['discord_user_id'] == discord_owner_id for p in participants_list):
                return JsonResponse({'error': '他の募集に参加中です。'}, status=400)

        # ゲームIDは必須
        game_id = data.get('game')
        if not game_id:
            return JsonResponse({'error': 'gameは必須です'}, status=400)
        
        try:
            game = Game.objects.get(id=game_id, is_active=True)
        except Game.DoesNotExist:
            return JsonResponse({'error': 'ゲームが見つかりません'}, status=400)

        # server_id, channel_idを取得（Botからの場合はリクエストから、フロントからの場合はDBから）
        discord_server_id = data.get('discord_server_id')
        discord_channel_id = data.get('discord_channel_id')
        
        # フロントエンドからの場合（server_idとchannel_idがない場合）
        source = 'bot'  # デフォルトはBot
        server_setting = None
        if not discord_server_id or not discord_channel_id:
            # DiscordServerSettingからゲームに紐づくサーバー設定を取得
            server_setting = DiscordServerSetting.objects.filter(game=game).first()
            if not server_setting:
                return JsonResponse({'error': 'このゲームのサーバー設定がありません。管理者に連絡してください。'}, status=400)
            if not server_setting.recruitment_channel_id:
                return JsonResponse({'error': 'このゲームの募集チャンネルが設定されていません。管理者に連絡してください。'}, status=400)
            
            discord_server_id = server_setting.discord_server_id
            discord_channel_id = server_setting.recruitment_channel_id
            source = 'frontend'  # フロントエンドからのリクエスト
        
        # 必須フィールドのチェック
        discord_owner_username = data.get('discord_owner_username', owner_account.discord_username)
        title = data.get('title')
        rank = data.get('rank', '')
        max_slots = data.get('max_slots', 4)
        
        if not title:
            return JsonResponse({'error': 'titleは必須です'}, status=400)
            
        recruitment = DiscordRecruitment.objects.create(
            game = game,
            discord_channel_id = discord_channel_id,
            discord_server_id = discord_server_id,
            discord_owner_id = discord_owner_id,
            discord_owner_username = discord_owner_username,
            title = title,
            rank = rank,
            max_slots = max_slots,
            current_slots = 1,  # 募集者（自分）を含む
        )
        from .serializers import DiscordRecruitmentSerializer
        serializer = DiscordRecruitmentSerializer(recruitment)

        # WebSocket通知を送信（フロントエンド向け）
        try:
            from .consumers import sync_notify_recruitment_update
            sync_notify_recruitment_update(serializer.data, 'recruitment_created')
        except Exception as ws_error:
            print(f"WebSocket通知エラー: {ws_error}")
        
        # フロントエンドからの場合、Redis経由でBotにEmbed作成を通知
        if source == 'frontend' and server_setting:
            try:
                import redis
                import os
                redis_host = os.environ.get('REDIS_HOST', '127.0.0.1')
                redis_port = int(os.environ.get('REDIS_PORT', 6379))
                r = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
                
                # Botに送信するデータ
                bot_notification = {
                    'type': 'create_embed',
                    'recruitment_id': recruitment.id,
                    'webhook_url': server_setting.webhook_url or '',
                    'channel_id': discord_channel_id,
                    'owner_avatar': owner_account.avatar or '',
                    'owner_username': discord_owner_username,
                }
                print(f"📤 Redis通知データ: game={game.name}, server={discord_server_id}, channel={discord_channel_id}, webhook_url={bool(server_setting.webhook_url)}")
                r.publish('discord_bot_notifications', json.dumps(bot_notification))
                print(f"✅ Redis通知送信: recruitment_id={recruitment.id}")
            except Exception as redis_error:
                print(f"⚠️ Redis通知エラー: {redis_error}")
                # Redisエラーでも募集作成自体は成功とする

        return JsonResponse({
            'success': True,
            'recruitment': serializer.data,
            'source': source,
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': '無効なJSON形式です'}, status=400)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Discord create recruitment error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '募集の作成に失敗しました'}, status=500)
        
def discord_get_recruitments(request):
    try:
        from .serializers import DiscordRecruitmentSerializer

        status_filter = request.GET.get('status')
        if status_filter:
            statuses = status_filter.split(',')
            recruitments = DiscordRecruitment.objects.filter(status__in=statuses)
        else:
            recruitments = DiscordRecruitment.objects.filter(status__in=['open','ongoing'])

        recruitments = recruitments.select_related('game').order_by('-created_at')         

        server_id = request.GET.get('server_id')
        if server_id:
            recruitments = recruitments.filter(discord_server_id=server_id)
        
        recruitments = recruitments[:100]
        serializer = DiscordRecruitmentSerializer(recruitments, many=True)

        return JsonResponse({
            'recruitments': serializer.data
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Discord get recruitments error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '募集の取得に失敗しました'}, status=500)

def discord_get_recruitment_detail(request, recruitment_id):

    try:
        from .serializers import DiscordRecruitmentSerializer

        recruitment = DiscordRecruitment.objects.select_related('game').get(id=recruitment_id)
        serializer = DiscordRecruitmentSerializer(recruitment)

        return JsonResponse({
            'recruitment': serializer.data
        })
    except DiscordRecruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Discord get recruitment detail error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '募集の詳細の取得に失敗しました'}, status=500)

@csrf_exempt
def discord_join_recruitment(request,recruitment_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
        
    try:
        data = json.loads(request.body)

        discord_user_id = data.get('discord_user_id')
        discord_username = data.get('discord_username')

        if not discord_user_id or not discord_username:
            return JsonResponse({'error': 'discord_user_idとdiscord_usernameは必須です'}, status=400)

        recruitment = DiscordRecruitment.objects.select_related('game').get(id=recruitment_id)

        if recruitment.discord_owner_id == discord_user_id:
            return JsonResponse({'error': '募集者は参加できません'}, status=400)
        
        open_or_ongoing_recruitments = DiscordRecruitment.objects.filter(
            status__in=['open', 'ongoing']
        )
        for other_recruitment in open_or_ongoing_recruitments:
            # 自分自身の募集はスキップ
            if other_recruitment.id == recruitment_id:
                continue
            
            participants_list = json.loads(other_recruitment.participants)
            if any(p['discord_user_id'] == discord_user_id for p in participants_list):
                return JsonResponse({
                    'error': '既に他の募集に参加中です。退出してから参加してください。'
                }, status=400)
        
        # 募集中（openまたはongoing）でないかチェック
        user_recruitment = DiscordRecruitment.objects.filter(
            discord_owner_id=discord_user_id, 
            status__in=['open', 'ongoing']
        ).first()
        
        if user_recruitment:
            return JsonResponse({
                'error': '既に募集しています。募集を終了してから参加してください。'
            }, status=400)            


               # 参加者のアバターを取得
        avatar = None
        try:
            account = Account.objects.get(discord_id=discord_user_id)
            avatar = account.avatar
        except Account.DoesNotExist:
            pass

        success, message = recruitment.add_participant(discord_user_id, discord_username, avatar)

        if not success:
            return JsonResponse({'error': message}, status=400)

        try:
            import redis
            import os
            redis_host = os.environ.get('REDIS_HOST', '127.0.0.1')
            redis_port = int(os.environ.get('REDIS_PORT', 6379))
            r = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)

            bot_notification = {
                'type': 'update_embed',
                'recruitment_id': recruitment.id,
                'discord_message_id': recruitment.discord_message_id,
                'discord_channel_id': recruitment.discord_channel_id,
            }

            r.publish('discord_bot_notifications', json.dumps(bot_notification))
            

                
            print(f"Published bot notification: {recruitment_id}")
        except Exception as redis_error:
            print(f"Redisエラー: {redis_error}")
        recruitment.refresh_from_db()
        from .serializers import DiscordRecruitmentSerializer
        serializer = DiscordRecruitmentSerializer(recruitment)

        # 満員になったらVC招待送信イベントを通知
        if recruitment.is_full:
            full_notification = {
                'type': 'recruitment_full',
                'recruitment_id': recruitment.id,
                'discord_channel_id': recruitment.discord_channel_id,
                'data': serializer.data  # データを直接含める
            }
            r.publish('discord_bot_notifications', json.dumps(full_notification))
            print(f"Published bot notification (full): {recruitment.id}")

        # WebSocket通知を送信
        try:
            from .consumers import sync_notify_recruitment_update
            sync_notify_recruitment_update(serializer.data, 'recruitment_update')
        except Exception as ws_error:
            print(f"WebSocket通知エラー: {ws_error}")

        return JsonResponse({
            'success': True,
            'message': message,
            'recruitment': serializer.data,
        })
    except DiscordRecruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': '無効なJSON形式です'}, status=400)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Discord join recruitment error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '参加処理に失敗しました'}, status=500)

@csrf_exempt
def discord_leave_recruitment(request, recruitment_id):
    try:
        data = json.loads(request.body)
        discord_user_id = data.get('discord_user_id')
        print(discord_user_id)

        if not discord_user_id:
            return JsonResponse({'error': 'discord_user_idは必須です'}, status=400)
        
        recruitment = DiscordRecruitment.objects.get(id=recruitment_id)
        if recruitment.discord_owner_id == discord_user_id:
            recruitment.status = 'closed'
            recruitment.save()
            message = '募集を終了しました'
        else:
            success, message = recruitment.remove_participant(discord_user_id)
            if not success:
                return JsonResponse({'error': message}, status=400)

        recruitment.refresh_from_db()
        from .serializers import DiscordRecruitmentSerializer
        serializer = DiscordRecruitmentSerializer(recruitment)

        if recruitment.status == 'closed' and recruitment.vc_channel_id:
            # VC削除リクエストをBotに送信（WebSocket経由）
            # または、vc_channel_idをnullにしてBotに通知
            recruitment.vc_channel_id = None
            recruitment.save()


        # WebSocket通知を送信
        try:
            from .consumers import sync_notify_recruitment_update
            sync_notify_recruitment_update(serializer.data, 'recruitment_update')
        except Exception as ws_error:
            print(f"WebSocket通知エラー: {ws_error}")

        return JsonResponse({
            'success': True,
            'message': message,
            'recruitment': serializer.data,
        })
    except DiscordRecruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': '無効なJSON形式です'}, status=400)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Discord leave recruitment error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '離脱処理に失敗しました'}, status=500)




@csrf_exempt
def discord_update_recruitment(request, recruitment_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)

        recruitment = DiscordRecruitment.objects.select_related('game').get(id=recruitment_id)

        if 'discord_message_id' in data:
            recruitment.discord_message_id = data['discord_message_id']
        if 'status' in data:
            recruitment.status = data['status']
        if 'title' in data:
            recruitment.title = data['title']
        if 'rank' in data:
            recruitment.rank = data['rank']
        if 'vc_channel_id' in data:
            recruitment.vc_channel_id = data['vc_channel_id']

        recruitment.save()

        from .serializers import DiscordRecruitmentSerializer
        serializer = DiscordRecruitmentSerializer(recruitment)

        return JsonResponse({
            'success': True,
            'message': '募集情報を更新しました',
            'recruitment': serializer.data,
        })

    except DiscordRecruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': '無効なJSON形式です'}, status=400)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Discord update recruitment error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '募集情報の更新に失敗しました'}, status=500)

@csrf_exempt
def discord_delete_recruitment(request, recruitment_id):    
    try:
        recruitment = DiscordRecruitment.objects.select_related('game').get(id=recruitment_id)
        deleted_id = recruitment.id
        recruitment.delete()

        # WebSocket通知を送信
        try:
            from .consumers import sync_notify_recruitment_update
            sync_notify_recruitment_update({'id': deleted_id}, 'recruitment_deleted')
        except Exception as ws_error:
            print(f"WebSocket通知エラー: {ws_error}")

        return JsonResponse({
            'success': True,
            'message': '募集を削除しました',
        })

    except DiscordRecruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Discord delete recruitment error: {str(e)}", exc_info=True)
        return JsonResponse({'error': '募集の削除に失敗しました'}, status=500)


# ============================================
# Discord サーバー設定API
# ============================================

def discord_get_server_setting(request, server_id):
    """サーバー設定を取得"""
    try:
        setting = DiscordServerSetting.objects.select_related('game').get(discord_server_id=server_id)
        return JsonResponse({
            'exists': True,
            'setting': {
                'discord_server_id': setting.discord_server_id,
                'discord_server_name': setting.discord_server_name,
                'game_id': setting.game.id,
                'game_name': setting.game.name,
                'default_max_slots': setting.default_max_slots,
                'webhook_url': setting.webhook_url or '',  # webhook_urlを追加
                'recruitment_channel_id': setting.recruitment_channel_id or '',  # recruitment_channel_idも追加
            }
        })
    except DiscordServerSetting.DoesNotExist:
        return JsonResponse({'exists': False})
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Get server setting error: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'サーバー設定の取得に失敗しました'}, status=500)


@csrf_exempt
def discord_set_server_setting(request):
    """サーバー設定を作成/更新"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        server_id = data.get('discord_server_id')
        server_name = data.get('discord_server_name', '')
        game_id = data.get('game_id')
        
        if not server_id or not game_id:
            return JsonResponse({'error': 'discord_server_id と game_id は必須です'}, status=400)
        
        try:
            game = Game.objects.get(id=game_id, is_active=True)
        except Game.DoesNotExist:
            return JsonResponse({'error': 'ゲームが見つかりません'}, status=400)
        
        setting, created = DiscordServerSetting.objects.update_or_create(
            discord_server_id=server_id,
            defaults={
                'discord_server_name': server_name,
                'game': game,
                'default_max_slots': data.get('default_max_slots', 3),
            }
        )
        
        return JsonResponse({
            'success': True,
            'created': created,
            'setting': {
                'discord_server_id': setting.discord_server_id,
                'discord_server_name': setting.discord_server_name,
                'game_id': setting.game.id,
                'game_name': setting.game.name,
                'default_max_slots': setting.default_max_slots,
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': '無効なJSON形式です'}, status=400)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Set server setting error: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'サーバー設定の保存に失敗しました'}, status=500)


# Riot API
RIOT_API_KEY = settings.RIOT_API_KEY

RIOT_REGIONAL_ENDPOINTS = {
    'jp': 'https://asia.api.riotgames.com',
    'kr': 'https://asia.api.riotgames.com',
    'ap': 'https://asia.api.riotgames.com',
    'na': 'https://americas.api.riotgames.com',
    'br': 'https://americas.api.riotgames.com',
    'latam': 'https://americas.api.riotgames.com',
    'eu': 'https://europe.api.riotgames.com',
    'oce': 'https://sea.api.riotgames.com',
    'me': 'https://europe.api.riotgames.com',
}

RIOT_PLATFORM_ENDPOINTS = {
    'jp': 'https://jp1.api.riotgames.com',
    'kr': 'https://kr.api.riotgames.com',
    'na': 'https://na1.api.riotgames.com',
    'br': 'https://br1.api.riotgames.com',
    'eu': 'https://euw1.api.riotgames.com',
    'oce': 'https://oc1.api.riotgames.com',
}

@csrf_exempt
def link_riot_account(request):
    """RIOTアカウントをリンク"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    try:
        data = json.loads(request.body)
        game_name = data.get('game_name')
        tag_line = data.get('tag_line')
        region = data.get('region')

        if not game_name or not tag_line:
            return JsonResponse({'error': 'RIOT IDの取得に失敗しました'}, status=400)

        regional_endpoint = RIOT_REGIONAL_ENDPOINTS.get(region, RIOT_REGIONAL_ENDPOINTS['jp'])
        account_response = requests.get(
            f"{regional_endpoint}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}",
            headers={'X-Riot-Token': RIOT_API_KEY}
        )

        if account_response.status_code == 404:
            return JsonResponse({'error': 'Riot アカウントが見つかりません'}, status=404)
    
        if account_response.status_code != 200:
            return JsonResponse({
                'error': 'RIOT APIエラー',
                'details': account_response.json()}, status=400)

        riot_data = account_response.json()
        puuid = riot_data['puuid']

        platform_endpoint = RIOT_PLATFORM_ENDPOINTS.get(region, RIOT_PLATFORM_ENDPOINTS['jp'])
        summoner_response = requests.get(
            f"{platform_endpoint}/lol/summoner/v4/summoners/by-puuid/{puuid}",
            headers={'X-Riot-Token': RIOT_API_KEY}
        )

        summoner_id = ""
        lol_account_id = ""

        if summoner_response.status_code == 200:
            summoner_data = summoner_response.json()
            summoner_id = summoner_data.get('id', '')
            lol_account_id = summoner_data.get('accountId', '')

        riot_account, created = RiotAccount.objects.get_or_create(
            account=request.user,
            defaults={
                'puuid': puuid,
                'game_name': game_name,
                'tag_line': tag_line,
                'region': region,
                'summoner_id': summoner_id,
                'lol_account_id': lol_account_id,
            }
        )
        fetch_lol_rank(riot_account)
        
        return JsonResponse({
            'success': True,
            'riot_account': {
                'riot_id': riot_account.riot_id,
                'puuid': riot_account.puuid,
                'game_name': riot_account.game_name,
                'tag_line': riot_account.tag_line,
                'region': riot_account.region,
                'is_new': created,
            }
        })


    except Exception as e:
        print(f"Riot link error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

def fetch_lol_rank(riot_account):
    """LoL ランク情報を取得して保存"""
    from .models import LoLRank,RiotAccount
    
    platform_endpoint = RIOT_PLATFORM_ENDPOINTS.get(
        riot_account.region, 
        RIOT_PLATFORM_ENDPOINTS['jp']
    )
    print("aaa")
    print(riot_account)
    response = requests.get(
        f"{platform_endpoint}/lol/league/v4/entries/by-puuid/{riot_account.puuid}",
        headers={'X-Riot-Token': RIOT_API_KEY}
    )
    
    if response.status_code != 200:
        return

    rank_data = response.json()
    print(rank_data)
    
    for entry in rank_data:
        queue_type = entry.get('queueType')
        if queue_type not in ['RANKED_SOLO_5x5', 'RANKED_FLEX_SR']:
            continue
        
        LoLRank.objects.update_or_create(
            riot_account=riot_account,
            queue_type=queue_type,
            defaults={
                'tier': entry.get('tier', 'IRON'),
                'rank': entry.get('rank', 'IV'),
                'league_points': entry.get('leaguePoints', 0),
                'wins': entry.get('wins', 0),
                'losses': entry.get('losses', 0),
            }
        )


def get_riot_account(request):
    """連携中の Riot アカウント情報を取得"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    from .models import RiotAccount
    
    try:
        riot_account = RiotAccount.objects.get(account=request.user)
        ranks = riot_account.ranks.all()
        
        return JsonResponse({
            'linked': True,
            'riot_account': {
                'riot_id': riot_account.riot_id,
                'game_name': riot_account.game_name,
                'tag_line': riot_account.tag_line,
                'region': riot_account.region,
            },
            'lol_ranks': [
                {
                    'queue_type': r.queue_type,
                    'queue_type_display': r.get_queue_type_display(),
                    'tier': r.tier,
                    'rank': r.rank,
                    'league_points': r.league_points,
                    'wins': r.wins,
                    'losses': r.losses,
                    'display_rank': r.display_rank,
                }
                for r in ranks
            ]
        })
    except RiotAccount.DoesNotExist:
        return JsonResponse({'linked': False})


@csrf_exempt
def refresh_riot_rank(request):
    """ランク情報を更新"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    from .models import RiotAccount
    
    try:
        riot_account = RiotAccount.objects.get(account=request.user)
        fetch_lol_rank(riot_account)
        
        ranks = riot_account.ranks.all()
        
        return JsonResponse({
            'success': True,
            'lol_ranks': [
                {
                    'queue_type': r.queue_type,
                    'display_rank': r.display_rank,
                }
                for r in ranks
            ]
        })
    except RiotAccount.DoesNotExist:
        return JsonResponse({'error': 'Riot アカウントが連携されていません'}, status=400)


@csrf_exempt
def unlink_riot_account(request):
    """Riot アカウント連携を解除"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    from .models import RiotAccount
    
    try:
        riot_account = RiotAccount.objects.get(account=request.user)
        riot_account.delete()
        return JsonResponse({'success': True})
    except RiotAccount.DoesNotExist:
        return JsonResponse({'error': '連携されていません'}, status=400)

@api_view(['POST'])
def record_vc_join(request):
    """VC参加記録API"""
    serializer = VoiceChannelParticipationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def record_vc_leave(request, participation_id):
    """VC退出記録API"""
    try:
        participation = VoiceChannelParticipation.objects.get(id=participation_id)
        participation.left_at = timezone.now()
        
        # 滞在時間を計算（秒）
        if participation.joined_at and participation.left_at:
            duration = participation.left_at - participation.joined_at
            participation.duration_seconds = int(duration.total_seconds())
        
        participation.save()
        
        serializer = VoiceChannelParticipationSerializer(participation)
        return Response({
            'participation': serializer.data,
            'is_eligible_for_rating': participation.is_eligible_for_rating()
        })
    except VoiceChannelParticipation.DoesNotExist:
        return Response({'error': '参加記録が見つかりません'}, status=status.HTTP_404_NOT_FOUND)


# @api_view(['POST'])
# def submit_rating(request):
#     """ユーザー評価送信API"""
#     serializer = UserRatingSerializer(data=request.data)
#     if serializer.is_valid():
#         # 既存の評価をチェック
#         existing_rating = UserRating.objects.filter(
#             recruitment_id=request.data.get('recruitment'),
#             rater_discord_id=request.data.get('rater_discord_id'),
#             rated_discord_id=request.data.get('rated_discord_id')
#         ).first()
        
#         if existing_rating:
#             # 既存の評価を更新
#             for key, value in serializer.validated_data.items():
#                 setattr(existing_rating, key, value)
#             existing_rating.save()
#             return Response(UserRatingSerializer(existing_rating).data)
#         else:
#             # 新規評価を作成
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_vc_participants(request, recruitment_id):
    """募集のVC参加者一覧取得API"""
    try:
        recruitment = DiscordRecruitment.objects.get(id=recruitment_id)
        participants = VoiceChannelParticipation.objects.filter(recruitment=recruitment)
        serializer = VoiceChannelParticipationSerializer(participants, many=True)
        return Response(serializer.data)
    except DiscordRecruitment.DoesNotExist:
        return Response({'error': '募集が見つかりません'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_user_ratings(request, recruitment_id):
    """募集の評価一覧取得API"""
    try:
        recruitment = DiscordRecruitment.objects.get(id=recruitment_id)
        ratings = UserRating.objects.filter(recruitment=recruitment)
        serializer = UserRatingSerializer(ratings, many=True)
        return Response(serializer.data)
    except DiscordRecruitment.DoesNotExist:
        return Response({'error': '募集が見つかりません'}, status=status.HTTP_404_NOT_FOUND)