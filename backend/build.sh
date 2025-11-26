#!/usr/bin/env bash
# Render.com ビルドスクリプト

set -o errexit  # エラーで停止

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Superuser作成（環境変数が設定されている場合のみ）
if [ -n "$DJANGO_SUPERUSER_DISCORD_ID" ]; then
    python manage.py createsuperuser \
        --noinput \
        --discord_id "$DJANGO_SUPERUSER_DISCORD_ID" \
        --discord_username "$DJANGO_SUPERUSER_DISCORD_USERNAME" \
        || true
fi

