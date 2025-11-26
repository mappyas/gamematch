#!/usr/bin/env bash
# Render.com ビルドスクリプト

set -o errexit  # エラーで停止

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

