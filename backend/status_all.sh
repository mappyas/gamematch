#!/bin/bash
# サービスステータス確認スクリプト

echo "📊 サービスステータス確認"
echo "========================="
echo ""

echo "🐘 PostgreSQL:"
sudo systemctl status postgresql --no-pager | head -3

echo ""
echo "🔴 Redis:"
sudo systemctl status redis-server --no-pager | head -3

echo ""
echo "🌐 Nginx:"
sudo systemctl status nginx --no-pager | head -3

echo ""
echo "🐍 Gunicorn:"
sudo systemctl status gunicorn --no-pager | head -3

echo ""
echo "🤖 Discord Bot:"
sudo systemctl status discord-bot --no-pager | head -3

echo ""
echo "========================="
echo "Summary:"
echo "  postgresql:  $(sudo systemctl is-active postgresql)"
echo "  redis:       $(sudo systemctl is-active redis-server)"
echo "  nginx:       $(sudo systemctl is-active nginx)"
echo "  gunicorn:    $(sudo systemctl is-active gunicorn)"
echo "  discord-bot: $(sudo systemctl is-active discord-bot)"
