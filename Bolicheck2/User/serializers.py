from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'telephone_number', 'password', 'identification_number']
        extra_kwargs = {
            'username': {'required': True, 'error_messages': {'required': 'El nombre de usuario es obligatorio.'}},
            'email': {'required': True, 'error_messages': {'required': 'El correo electrónico es obligatorio.'}},
            'first_name': {'required': True, 'error_messages': {'required': 'El nombre es obligatorio.'}},
            'last_name': {'required': True, 'error_messages': {'required': 'El apellido es obligatorio.'}},
            'telephone_number': {'required': True, 'error_messages': {'required': 'El número de teléfono es obligatorio.'}},
            'identification_number': {'required': True, 'error_messages': {'required': 'El número de identificación es obligatorio.'}},
        }

    def validate(self, data):
        errors = {}

        if User.objects.filter(username=data['username']).exists():
            errors['username'] = ["Este nombre de usuario ya está en uso."]

        if User.objects.filter(email=data['email']).exists():
            errors['email'] = ["Este correo ya está registrado."]

        if User.objects.filter(identification_number=data['identification_number']).exists():
            errors['identification_number'] = ["Ya existe un usuario registrado con esta cédula."]

        if User.objects.filter(telephone_number=data['telephone_number']).exists():
            errors['telephone_number'] = ["Ya existe un usuario registrado con este teléfono."]

        if not (100000 <= data['identification_number'] <= 9999999999):
            errors['identification_number'] = ["La cédula debe estar entre 100000 y 9999999999."]

        if not (3000000000 <= data['telephone_number'] <= 3999999999):
            errors['telephone_number'] = ["El número de teléfono debe estar entre 3000000000 y 3999999999."]

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def get_tokens_for_user(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
class RegisterAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True, min_length = 6)
    identification_number = serializers.IntegerField(
        min_value=100000, 
        max_value=9999999999
    )
    telephone_number = serializers.IntegerField(
        min_value=3000000000, 
        max_value=3999999999
    )
    first_name = serializers.RegexField(
        regex=r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$',
        error_messages={'invalid': 'El nombre solo puede contener letras y espacios.'}
    )
    last_name = serializers.RegexField(
        regex=r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$',
        error_messages={'invalid': 'El nombre solo puede contener letras y espacios.'}
    )
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'telephone_number', 'password', 'identification_number', 'is_staff']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'is_staff': {'required': True}
        }
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        request = self.context.get('request')
        try:
            user = CustomUser.objects.get(email=data["email"])
        except:
            raise serializers.ValidationError("Credenciales Incorrectas.")
        if not user.is_active:
            raise serializers.ValidationError("Tu cuenta ha sido inhabilitada, ponte en contacto con el administrador.")
        else:
            user = authenticate(request=request, email=data['email'], password=data['password'])
            if not user:
                raise serializers.ValidationError("Credenciales Incorrectas.")
            refresh = RefreshToken.for_user(user)
            return {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    'id': user.id,
                    'identification': user.identification_number,
                    'is_super': user.is_superuser,
                    'is_staff': user.is_staff,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'telephone': user.telephone_number,
                    'email': user.email,
                    'points': user.points,
                    'photo': request.build_absolute_uri(user.photo.url)
                }
        }

class UserSerializer(serializers.ModelSerializer):
    class Meta: 
        model = CustomUser
        fields = ('id', 'first_name', 'last_name', 'username', 'is_active', 'identification_number', 'is_superuser', 'is_staff', 'telephone_number', 'email')