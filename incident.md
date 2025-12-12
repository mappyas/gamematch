
embedメッセージ更新はされた

### deploy後の問題点
- max_slot時DMが送信されない
>フロントで参加時、バックエンドでmax_slot時はbotに人数がそろったことと、VCリンクのDM送信させる。

Dec 12 09:58:22 ip-172-26-12-111 python[65783]:  Embed作成: current_slots=2, max_slots=2, is_full=True, participants=1
Dec 12 09:58:23 ip-172-26-12-111 python[65783]: ✅ Webhook経由でEmbed更新完了: recruitment_id=43
Dec 12 09:58:23 ip-172-26-12-111 python[65783]:  Redis通知受信: recruitment_full
Dec 12 09:58:23 ip-172-26-12-111 python[65783]: ✅ 満員通知受信 (データあり): recruitment_id=43
Dec 12 09:58:23 ip-172-26-12-111 python[65783]: DEBUG: is_full=True
Dec 12 09:58:23 ip-172-26-12-111 python[65783]: DEBUG: participants_count=1
Dec 12 09:58:23 ip-172-26-12-111 python[65783]: ❌ 空いているVCが見つかりません