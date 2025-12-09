#!/bin/bash
# サービス全開始スクリプト

echo "🚀 サービスを開始しています..."

sudo systemctl start postgresql
echo "  ✓ postgresql 開始"

sudo systemctl start redis-server
echo "  ✓ redis 開始"

sudo systemctl start nginx
echo "  ✓ nginx 開始"

sudo systemctl start gunicorn
echo "  ✓ gunicorn 開始"

sudo systemctl start discord-bot
echo "  ✓ discord-bot 開始"

echo ""
echo "📊 サービスステータス:"
sudo systemctl is-active postgresql redis-server nginx gunicorn discord-bot
echo ""
echo "✅ 全サービスが開始しました"
