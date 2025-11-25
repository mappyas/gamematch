from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Account

@admin.register
class AccountAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_staff', 'is_superuser', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active')

    