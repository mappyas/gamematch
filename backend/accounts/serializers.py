from rest_framework import serializers
from .models import Account

class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)

    class Meta:
        model = Account
        fields = ['id', 'email', 'username', 'password']

    def create(self,validated_data):
        user = Account.objects.create_user(
            email = validated_data.data['email'],
            username = validated_data['username'],
            password = validated_data['password']
        )
        return user