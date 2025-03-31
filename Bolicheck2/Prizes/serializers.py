from rest_framework import serializers
from .models import Prizes

class PrizeSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Prizes
        fields = ('id', 'name', 'description', 'required_points', 'stock', 'image', 'is_available')
    
    def validate_required_points(self, value):
        if value <= 0:
            raise serializers.ValidationError("Los puntos requeridos para el premio no pueden ser menores o iguales a cero.")
        return value

    def validate_stock(self, value):
        if value <= 0:
            raise serializers.ValidationError("El stock del premio no puede ser igual o menor a cero.")
        return value