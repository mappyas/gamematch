# accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Discord OAuth2
    path('api/discord/login/', views.discord_login, name='discord_login'),
    path('api/discord/callback/', views.discord_callback, name='discord_callback'),
    
    # ユーザー関連
    path('api/me/', views.get_current_user, name='get_current_user'),
    path('api/logout/', views.logout_user, name='logout'),
    
    # プロフィール
    path('api/profile/', views.create_profile, name='create_profile'),
    path('api/profile/detail/', views.get_profile_detail, name='get_profile_detail'),
    
    # ゲーム
    path('api/games/', views.get_games, name='get_games'),
    
    # 募集
    path('api/recruitments/', views.get_recruitments, name='get_recruitments'),
    path('api/recruitments/create/', views.create_recruitment, name='create_recruitment'),
    path('api/recruitments/cleanup/', views.cleanup_old_recruitments, name='cleanup_old_recruitments'),
    path('api/recruitments/<int:recruitment_id>/', views.get_recruitment_detail, name='get_recruitment_detail'),
    path('api/recruitments/<int:recruitment_id>/join/', views.join_recruitment, name='join_recruitment'),
    path('api/recruitments/<int:recruitment_id>/leave/', views.leave_recruitment, name='leave_recruitment'),
    path('api/recruitments/<int:recruitment_id>/close/', views.close_recruitment, name='close_recruitment'),
    path('api/recruitments/<int:recruitment_id>/delete/', views.delete_recruitment, name='delete_recruitment'),
    
    # Riot API 連携
    path('api/riot/link/', views.link_riot_account, name='link_riot_account'),
    path('api/riot/account/', views.get_riot_account, name='get_riot_account'),
    path('api/riot/refresh/', views.refresh_riot_rank, name='refresh_riot_rank'),
    path('api/riot/unlink/', views.unlink_riot_account, name='unlink_riot_account'),
]
