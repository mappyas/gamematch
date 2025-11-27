# accounts/views.py
import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login
import json


from .models import Account, Profile, Game, Recruitment, Participant, GameRank, RiotAccount, LoLRank

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
        
        display_name = data.get('display_name')
        if not display_name:
            return JsonResponse({'error': '表示名は必須です'}, status=400)
        
        # プロフィール作成または更新
        profile, created = Profile.objects.update_or_create(
            account=request.user,
            defaults={
                'display_name': display_name,
                'platform': data.get('platform', 'pc'),
                'bio': data.get('bio', ''),
            }
        )
        
        # プロフィール完了フラグを更新
        request.user.is_profile_complete = True
        request.user.save()
        
        return JsonResponse({
            'success': True,
            'profile': {
                'display_name': profile.display_name,
                'main_game': profile.main_game.name if profile.main_game else None,
                'platform': profile.platform,
                'bio': profile.bio,
            }
        })
        
    except Exception as e:
        print(f"Profile creation error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


def get_current_user(request):
    """現在のログインユーザー情報を取得"""
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False})
    
    user = request.user
    profile_data = None
    
    if hasattr(user, 'profile'):
        profile = user.profile
        profile_data = {
            'display_name': profile.display_name,
            'main_game': profile.main_game.name if profile.main_game else None,
            'platform': profile.platform,
            'bio': profile.bio,
        }
    
    return JsonResponse({
        'authenticated': True,
        'user': {
            'id': user.id,
            'discord_id': user.discord_id,
            'discord_username': user.discord_username,
            'avatar': user.avatar,
            'is_profile_complete': user.is_profile_complete,
        },
        'profile': profile_data,
    })


@csrf_exempt
def logout_user(request):
    """ログアウト"""
    from django.contrib.auth import logout
    logout(request)
    return JsonResponse({'success': True})


# ============================================
# 募集関連API
# ============================================

def get_games(request):
    """ゲーム一覧を取得"""
    games = Game.objects.filter(is_active=True)
    return JsonResponse({
        'games': [
            {
                'id': game.id,
                'slug': game.slug,
                'name': game.name,
                'icon': game.icon,
                'color': game.color,
                'max_players': game.max_players,
                'platforms': game.platforms_list,
                'ranks':[{
                    'id': r.id,
                    'rankname': r.rankname,
                    'rankorder': r.rankorder,
                    'icon': r.icon,
                } for r in game.ranks.all()
                ]
            }
            for game in games
        ]
    })


def get_recruitments(request):
    """募集一覧を取得"""
    recruitments = Recruitment.objects.filter(status='open').select_related('game', 'owner')
    
    # フィルタリング
    game_slug = request.GET.get('game')
    platform = request.GET.get('platform')
    
    if game_slug:
        recruitments = recruitments.filter(game__slug=game_slug)
    if platform:
        recruitments = recruitments.filter(platform=platform)
    
    return JsonResponse({
        'recruitments': [
            {
                'id': r.id,
                'title': r.title,
                'description': r.description,
                'game': {
                    'slug': r.game.slug,
                    'name': r.game.name,
                    'color': r.game.color,
                },
                'platform': r.platform,
                'max_players': r.max_players,
                'current_players': r.current_players,
                'rank': r.rank,
                'voice_chat': r.voice_chat,
                'owner': {
                    'id': r.owner.id,
                    'discord_username': r.owner.discord_username,
                    'avatar': r.owner.avatar,
                },
                'created_at': r.created_at.isoformat(),
                'is_full': r.is_full,
            }
            for r in recruitments
        ]
    })


def get_recruitment_detail(request, recruitment_id):
    """募集の詳細を取得"""
    try:
        r = Recruitment.objects.select_related('game', 'owner').get(id=recruitment_id)
        participants = r.participants.filter(status='joined').select_related('user')
        
        return JsonResponse({
            'recruitment': {
                'id': r.id,
                'title': r.title,
                'description': r.description,
                'game': {
                    'slug': r.game.slug,
                    'name': r.game.name,
                    'color': r.game.color,
                },
                'platform': r.platform,
                'max_players': r.max_players,
                'current_players': r.current_players,
                'rank': r.rank,
                'voice_chat': r.voice_chat,
                'status': r.status,
                'owner': {
                    'id': r.owner.id,
                    'discord_username': r.owner.discord_username,
                    'avatar': r.owner.avatar,
                },
                'participants': [
                    {
                        'id': p.user.id,
                        'discord_username': p.user.discord_username,
                        'avatar': p.user.avatar,
                        'joined_at': p.joined_at.isoformat(),
                    }
                    for p in participants
                ],
                'created_at': r.created_at.isoformat(),
                'is_full': r.is_full,
            }
        })
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)


@csrf_exempt
def create_recruitment(request):
    """募集を作成"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    try:
        data = json.loads(request.body)
        
        # バリデーション
        game_id = data.get('game_id')
        title = data.get('title')
        
        if not game_id or not title:
            return JsonResponse({'error': 'ゲームとタイトルは必須です'}, status=400)
        
        try:
            game = Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return JsonResponse({'error': 'ゲームが見つかりません'}, status=400)
        
        # 募集作成
        recruitment = Recruitment.objects.create(
            owner=request.user,
            game=game,
            title=title,
            description=data.get('description', ''),
            platform=data.get('platform', 'pc'),
            max_players=data.get('max_players', game.max_players),
            rank=data.get('rank', ''),
            voice_chat=data.get('voice_chat', False),
        )
        
        return JsonResponse({
            'success': True,
            'recruitment': {
                'id': recruitment.id,
                'title': recruitment.title,
            }
        }, status=201)
        
    except Exception as e:
        print(f"Recruitment creation error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def join_recruitment(request, recruitment_id):
    """募集に参加"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    try:
        recruitment = Recruitment.objects.get(id=recruitment_id)
        
        # チェック
        if recruitment.owner == request.user:
            return JsonResponse({'error': '自分の募集には参加できません'}, status=400)
        
        if recruitment.status != 'open':
            return JsonResponse({'error': 'この募集は締め切られています'}, status=400)
        
        if recruitment.is_full:
            return JsonResponse({'error': '定員に達しています'}, status=400)
        
        # 既に参加していないかチェック
        existing = Participant.objects.filter(
            recruitment=recruitment,
            user=request.user,
            status='joined'
        ).exists()
        
        if existing:
            return JsonResponse({'error': '既に参加しています'}, status=400)
        
        # 参加
        Participant.objects.create(
            recruitment=recruitment,
            user=request.user,
        )
        
        # 定員に達したら自動で締め切り
        if recruitment.is_full:
            recruitment.status = 'closed'
            recruitment.save()
        
        return JsonResponse({
            'success': True,
            'current_players': recruitment.current_players,
        })
        
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except Exception as e:
        print(f"Join recruitment error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def leave_recruitment(request, recruitment_id):
    """募集から離脱"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    try:
        recruitment = Recruitment.objects.get(id=recruitment_id)
        
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
        if recruitment.status == 'closed' and not recruitment.is_full:
            recruitment.status = 'open'
            recruitment.save()
        
        return JsonResponse({
            'success': True,
            'current_players': recruitment.current_players,
        })
        
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)
    except Exception as e:
        print(f"Leave recruitment error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def close_recruitment(request, recruitment_id):
    """募集を締め切り（オーナーのみ）"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    try:
        recruitment = Recruitment.objects.get(id=recruitment_id)
        
        if recruitment.owner != request.user:
            return JsonResponse({'error': '権限がありません'}, status=403)
        
        recruitment.status = 'closed'
        recruitment.save()
        
        return JsonResponse({'success': True})
        
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)


@csrf_exempt
def delete_recruitment(request, recruitment_id):
    """募集を削除（オーナーのみ）"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'ログインが必要です'}, status=401)
    
    try:
        recruitment = Recruitment.objects.get(id=recruitment_id)
        
        if recruitment.owner != request.user:
            return JsonResponse({'error': '権限がありません'}, status=403)
        
        recruitment.delete()
        
        return JsonResponse({'success': True})
        
    except Recruitment.DoesNotExist:
        return JsonResponse({'error': '募集が見つかりません'}, status=404)


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
@csrf_exempt
def discord_callback(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
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

        if summoner_id:
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
    from .models import LoLRank
    
    if not riot_account.summoner_id:
        return
    
    platform_endpoint = RIOT_PLATFORM_ENDPOINTS.get(
        riot_account.region, 
        RIOT_PLATFORM_ENDPOINTS['jp']
    )
    
    response = requests.get(
        f"{platform_endpoint}/lol/league/v4/entries/by-summoner/{riot_account.summoner_id}",
        headers={'X-Riot-Token': RIOT_API_KEY}
    )
    
    if response.status_code != 200:
        return
    
    rank_data = response.json()
    
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