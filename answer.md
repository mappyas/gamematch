Dec 11 15:49:57 ip-172-26-12-111 python[56369]: ⚠ Webhook投稿エラー、通常投稿にフォールバック: Webhook views require an associated state with the webhook
Dec 11 15:49:57 ip-172-26-12-111 python[56369]: Traceback (most recent call last):
Dec 11 15:49:57 ip-172-26-12-111 python[56369]:   File "/var/www/gamematch/backend/discord_bot/bot.py", line 921, in handle_create_embed_notification
Dec 11 15:49:57 ip-172-26-12-111 python[56369]:     webhook_message = await webhook.send(
Dec 11 15:49:57 ip-172-26-12-111 python[56369]:                       ^^^^^^^^^^^^^^^^^^^
Dec 11 15:49:57 ip-172-26-12-111 python[56369]:   File "/var/www/gamematch/backend/venv/lib/python3.12/site-packages/discord/webhook/async_.py", line 1774, >
Dec 11 15:49:57 ip-172-26-12-111 python[56369]:     raise ValueError('Webhook views require an associated state with the webhook')
Dec 11 15:49:57 ip-172-26-12-111 python[56369]: ValueError: Webhook views require an associated state with the webhook
Dec 11 15:49:58 ip-172-26-12-111 python[56369]: ✅ 通常投稿でEmbed+ボタン送信: message_id=1448567470217756723
Dec 11 15:49:58 ip-172-26-12-111 python[56369]: ✅ メッセージID保存完了: 1448567470217756723