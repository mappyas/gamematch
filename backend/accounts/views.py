# accounts/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
import json
from .models import Account

@csrf_exempt
def create_user(request):
        
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    try:
        data = json.loads(request.body)
        print(f"Parsed data: {data}")
        
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        
        if not email or not username or not password:
            return JsonResponse({
                'success': False,
                'error': '全ての項目を入力してください'
            }, status=400)
        
        user = Account.objects.create_user(
            email=email,
            username=username,
            password=password
        )
        
        return JsonResponse({
            'success': True,
            'message': 'ユーザーが作成されました',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            }
        }, status=201)
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
    
@csrf_exempt
def login_user(request):  # この関数が追加されているか確認
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({
                'success': False,
                'error': 'メールアドレスとパスワードを入力してください'
            }, status=400)
        
        # ユーザー認証
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'message': 'ログインしました',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'メールアドレスまたはパスワードが正しくありません'
            }, status=401)
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
