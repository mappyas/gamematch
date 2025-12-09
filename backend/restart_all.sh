#!/bin/bash
# サービス全再起動スクリプト

echo "🔄 サービスを再起動しています..."

sudo systemctl restart postgresql
echo "  ✓ postgresql 再起動"

sudo systemctl restart redis-server
echo "  ✓ redis 再起動"

sudo systemctl restart nginx
echo "  ✓ nginx 再起動"

sudo systemctl restart gunicorn
echo "  ✓ gunicorn 再起動"

sudo systemctl restart discord-bot
echo "  ✓ discord-bot 再起動"

echo ""
echo "📊 サービスステータス:"
sudo systemctl is-active postgresql redis-server nginx gunicorn discord-bot
echo ""
echo "✅ 全サービスが再起動しました"
