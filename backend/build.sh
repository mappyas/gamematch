#!/usr/bin/env bash
# Render.com ビルドスクリプト

set -o errexit  # エラーで停止

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Superuser作成（環境変数が設定されている場合のみ）
if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
    python manage.py createsuperuser --noinput || true
fi

