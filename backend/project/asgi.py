"""
ASGI config for project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

# Django ASGIアプリケーション（HTTP用）
django_asgi_app = get_asgi_application()

# WebSocketルーティングを追加
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from accounts.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    # HTTP リクエスト → Django
    'http': django_asgi_app,
    # WebSocket リクエスト → Channels
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
