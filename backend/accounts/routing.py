# accounts/routing.py
"""
WebSocket URLルーティング
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Discord募集のリアルタイム更新
    re_path(r'ws/discord-recruitments/$', consumers.DiscordRecruitmentConsumer.as_asgi()),
    # 特定の募集のリアルタイム更新
    re_path(r'ws/discord-recruitments/(?P<recruitment_id>\d+)/$', consumers.DiscordRecruitmentConsumer.as_asgi()),
]

