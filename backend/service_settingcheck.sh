#メモリ容量
free -h

#discord env設定
cat /var/www/gamematch/backend/discord_bot/.env.discord

#nginx 設定
cat /etc/nginx/sites-available/matcha-gg.com

# Gunicornのワーカー数を確認
cat /etc/systemd/system/gunicorn.service

#各サービス確認
systemctl status gunicorn
systemctl status discord-bot
systemctl status nginx
systemctl status redis-server
systemctl status postgresql