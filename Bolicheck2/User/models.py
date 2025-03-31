from django.contrib.auth.models import AbstractUser
from .custom_mgr import CustomUserManager
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True, verbose_name="correo electrónico")
    telephone_number = models.PositiveBigIntegerField(
        unique=True, verbose_name="número telefónico")
    identification_number = models.PositiveBigIntegerField(unique=True, verbose_name="cédula")
    points = models.PositiveIntegerField(default=0, verbose_name="puntos")
    photo = models.ImageField(
        upload_to='users/', verbose_name='Foto', default="users/default.webp")

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'telephone_number', 'identification_number']

    class Meta:
        db_table = 'users'
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        
