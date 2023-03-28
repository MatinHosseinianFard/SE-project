from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer


class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()

    def get_cleaned_data(self):
        super(CustomRegisterSerializer, self).get_cleaned_data()
        return {
            'username': self.validated_data.get('username', ''),
            'password1': self.validated_data.get('password1', ''),
            'password2': self.validated_data.get('password2', ''),
            'email': self.validated_data.get('email', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', '')
        }


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Customizes JWT default Serializer to add more information about user"""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        print(user.first_name)
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        # token['email'] = user.email
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff

        return token
    
