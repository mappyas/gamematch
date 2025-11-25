# accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/create-user/', views.create_user, name='create_user'),
    path('api/login/', views.login_user, name='login'),  # この行が追加されているか確認
]