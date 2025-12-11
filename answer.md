Dec 11 17:26:42 ip-172-26-12-111 python[58558]: ⚠ Webhook投稿エラー、通常投稿にフォールバック: 403 Forbidden (error code: 50013): Missing Permissions
Dec 11 17:26:42 ip-172-26-12-111 python[58558]: Traceback (most recent call last):
Dec 11 17:26:42 ip-172-26-12-111 python[58558]:   File "/var/www/gamematch/backend/discord_bot/bot.py", line 984, in handle_create_embed_notification
Dec 11 17:26:42 ip-172-26-12-111 python[58558]:     webhooks = await channel.webhooks()
Dec 11 17:26:42 ip-172-26-12-111 python[58558]:                ^^^^^^^^^^^^^^^^^^^^^^^^
Dec 11 17:26:42 ip-172-26-12-111 python[58558]:   File "/var/www/gamematch/backend/venv/lib/python3.12/site-packages/discord/channel.py", line 563, in webhooks
Dec 11 17:26:42 ip-172-26-12-111 python[58558]:     data = await self._state.http.channel_webhooks(self.id)
Dec 11 17:26:42 ip-172-26-12-111 python[58558]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Dec 11 17:26:42 ip-172-26-12-111 python[58558]:   File "/var/www/gamematch/backend/venv/lib/python3.12/site-packages/discord/http.py", line 739, in request
Dec 11 17:26:42 ip-172-26-12-111 python[58558]:     raise Forbidden(response, data)
Dec 11 17:26:42 ip-172-26-12-111 python[58558]: discord.errors.Forbidden: 403 Forbidden (error code: 50013): Missing Permissions
Dec 11 17:26:43 ip-172-26-12-111 python[58558]: ✅ 通常投稿でEmbed+ボタン送信: message_id=1448591818047492096
Dec 11 17:26:43 ip-172-26-12-111 python[58558]: ✅ メッセージID保存完了: 1448591818047492096