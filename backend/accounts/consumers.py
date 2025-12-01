# accounts/consumers.py
"""
WebSocket コンシューマー
Discord募集のリアルタイム更新を配信
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async


class DiscordRecruitmentConsumer(AsyncWebsocketConsumer):
    """
    Discord募集のリアルタイム更新を配信するWebSocketコンシューマー
    """
    
    async def connect(self):
        """WebSocket接続時"""
        # グループ名を設定（全員が同じグループに参加）
        self.room_group_name = 'discord_recruitments'
        
        # URLパラメータから募集IDを取得（特定の募集のみ購読する場合）
        self.recruitment_id = self.scope['url_route']['kwargs'].get('recruitment_id')
        
        if self.recruitment_id:
            # 特定の募集のグループに参加
            self.room_group_name = f'discord_recruitment_{self.recruitment_id}'
        
        # グループに参加
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # WebSocket接続を受け入れ
        await self.accept()
        
        print(f"✅ WebSocket接続: {self.room_group_name}")
    
    async def disconnect(self, close_code):
        """WebSocket切断時"""
        # グループから離脱
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"❌ WebSocket切断: {self.room_group_name}")
    
    async def receive(self, text_data):
        """クライアントからメッセージを受信"""
        # 今回はクライアントからのメッセージは処理しない
        # サーバーからの一方通行の通知のみ
        pass
    
    async def recruitment_update(self, event):
        """
        募集更新イベントをクライアントに送信
        views.py から channel_layer.group_send() で呼ばれる
        """
        # クライアントにメッセージを送信
        await self.send(text_data=json.dumps({
            'type': 'recruitment_update',
            'recruitment': event['recruitment'],
        }))
    
    async def recruitment_created(self, event):
        """新規募集作成イベント"""
        await self.send(text_data=json.dumps({
            'type': 'recruitment_created',
            'recruitment': event['recruitment'],
        }))
    
    async def recruitment_deleted(self, event):
        """募集削除イベント"""
        await self.send(text_data=json.dumps({
            'type': 'recruitment_deleted',
            'recruitment_id': event['recruitment_id'],
        }))


# ヘルパー関数: views.py から WebSocket に通知を送信
async def notify_recruitment_update(recruitment_data, event_type='recruitment_update'):
    """
    募集の更新をWebSocketで通知
    
    使い方:
        from accounts.consumers import notify_recruitment_update
        import asyncio
        asyncio.run(notify_recruitment_update(serializer.data))
    """
    from channels.layers import get_channel_layer
    
    channel_layer = get_channel_layer()
    
    if channel_layer:
        # 全体グループに通知
        await channel_layer.group_send(
            'discord_recruitments',
            {
                'type': event_type,
                'recruitment': recruitment_data,
            }
        )
        
        # 特定の募集グループにも通知
        recruitment_id = recruitment_data.get('id')
        if recruitment_id:
            await channel_layer.group_send(
                f'discord_recruitment_{recruitment_id}',
                {
                    'type': event_type,
                    'recruitment': recruitment_data,
                }
            )


def sync_notify_recruitment_update(recruitment_data, event_type='recruitment_update'):
    """
    同期版: views.py から呼び出せるヘルパー関数
    """
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    
    channel_layer = get_channel_layer()
    
    if channel_layer:
        # 全体グループに通知
        async_to_sync(channel_layer.group_send)(
            'discord_recruitments',
            {
                'type': event_type,
                'recruitment': recruitment_data,
            }
        )
        
        # 特定の募集グループにも通知
        recruitment_id = recruitment_data.get('id')
        if recruitment_id:
            async_to_sync(channel_layer.group_send)(
                f'discord_recruitment_{recruitment_id}',
                {
                    'type': event_type,
                    'recruitment': recruitment_data,
                }
            )

