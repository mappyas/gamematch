#!/bin/bash
# サービス全停止スクリプト

echo "🛑 サービスを停止しています..."

sudo systemctl stop discord-bot
echo "  ✓ discord-bot 停止"

sudo systemctl stop gunicorn
echo "  ✓ gunicorn 停止"

sudo systemctl stop nginx
echo "  ✓ nginx 停止"

sudo systemctl stop redis-server
echo "  ✓ redis 停止"

sudo systemctl stop postgresql
echo "  ✓ postgresql 停止"

echo "✅ 全サービスが停止しました"
