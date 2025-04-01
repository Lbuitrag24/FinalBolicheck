from rest_framework import serializers
from .models import Product, Category, Sale, SaleProduct, ProductsHistory
from User.serializers import UserSerializer
from User.models import CustomUser
from Prizes.serializers import PrizeSerializer
from Reserves.serializers import ReserveSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'image', 'is_available')

class ProductSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    category = CategorySerializer(read_only=True)
    history = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'stock', 'price', 'description', 'image', 'points', 'is_available', 'category', 'category_id', 'history', 'min_stock', 'max_stock', 'offered_price')

    def get_history(self, obj):
        history_entries = ProductsHistory.objects.filter(product=obj).order_by('-date')
        return ProductsHistorySerializer(history_entries, many=True).data
    
    def validate_min_stock(self, value):
        stock = self.initial_data.get("stock")
        max_stock = self.initial_data.get("max_stock")
        if stock is not None and max_stock is not None:
            stock = int(stock)
            max_stock = int(max_stock)
            if value > stock or value > max_stock:
                raise serializers.ValidationError(
                    f"El stock mínimo no puede ser mayor al stock actual ({stock}) o mayor al stock máximo ({max_stock})."
                )
        if value < 0:
            raise serializers.ValidationError("El stock mínimo no puede ser menor a cero.")
        return value

    def validate_max_stock(self, value):
        stock = self.initial_data.get("stock")
        min_stock = self.initial_data.get("min_stock")
        if stock is not None and min_stock is not None:
            stock = int(stock)
            min_stock = int(min_stock)
            if value < stock or value < min_stock:
                raise serializers.ValidationError(
                    f"El stock máximo no puede ser menor al stock actual ({stock}) o menor al stock mínimo ({min_stock})."
                )
        return value
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio del producto no puede ser menor o igual a cero.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock del producto no puede ser menor a cero.")
        return value
    
    def validate_points(self, value):
        if value < 0:
            raise serializers.ValidationError("Los puntos ganados al comprar el producto no pueden ser menores a cero.")
        return value

    def create(self, validated_data):
        if validated_data.get("stock", 0) == 0:
            validated_data["is_available"] = False
        return super().create(validated_data)

class ProductEmployeeSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'stock', 'price', 'description', 'image', 'points', 'is_available', 'category', 'category_id', 'min_stock', 'max_stock', 'offered_price')

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio del producto no puede ser menor o igual a cero.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock del producto no puede ser menor a cero.")
        return value
    
    def validate_points(self, value):
        if value < 0:
            raise serializers.ValidationError("Los puntos ganados al comprar el producto no pueden ser menores a cero.")
        return value

    def create(self, validated_data):
        if validated_data.get("stock", 0) == 0:
            validated_data["is_available"] = False
        return super().create(validated_data)

class ProductClientSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    # Si algo falla, añadir category_id
    class Meta:
        model = Product
        fields = ('id', 'name', 'stock', 'price', 'description', 'image', 'points', 'is_available', 'category', 'offered_price')
        read_only_fields = fields
        
class SaleProductsSerializer(serializers.ModelSerializer):
    product = ProductEmployeeSerializer()
    class Meta:
        model = SaleProduct
        fields = ('id', 'quantity', 'product', 'unit_price', 'sale', 'subtotal', 'is_offer')

class SalePrizeSerializer(serializers.ModelSerializer):
    prize = PrizeSerializer()
    class Meta:
        model = SaleProduct
        fields = ('id', 'quantity', 'prize', 'sale', 'subtotal')

class SaleClientSerializer(serializers.ModelSerializer):
    reserve = ReserveSerializer(source='reserve_set', many=True, read_only=True)
    customer = UserSerializer(read_only=True)
    total = serializers.SerializerMethodField()
    products = SaleProductsSerializer(many=True, read_only=True)
    prizes = SalePrizeSerializer(many=True, read_only=True)
    class Meta:
        model = Sale
        fields = ('id', 'date', 'customer', 'status', 'total', 'prizes', 'products', 'is_redemption', 'reserve', 'admin_cancel')
    def get_total(self, obj):
        return sum(sp.unit_price * sp.quantity for sp in obj.products.all())
    
class SaleSerializer(serializers.ModelSerializer):
    reserve = ReserveSerializer(source='reserve_set', many=True, read_only=True)
    customer = UserSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), source='customer', write_only=True, required=False, allow_null=True
    )
    total = serializers.SerializerMethodField()
    products = SaleProductsSerializer(many=True, read_only=True)
    prizes = SalePrizeSerializer(many=True, read_only=True)
    by = UserSerializer(read_only=True)
    class Meta:
        model = Sale
        fields = ('id', 'date', 'customer', 'status', 'total', 'prizes', 'products', 'customer_id', 'is_redemption', 'admin_cancel', 'reserve', 'by', 'confirmed_at')
    def get_total(self, obj):
        return sum(sp.unit_price * sp.quantity for sp in obj.products.all())

class ProductsHistorySerializer(serializers.ModelSerializer):
    by = UserSerializer(read_only = True)
    sale = SaleSerializer
    class Meta:
        model = ProductsHistory
        fields = ("id", "product", "kind", "by", "date", "description", "sale")

class RedemptionSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), source='customer', write_only=True
    )
    total = serializers.SerializerMethodField()
    class Meta:
        model = Sale
        fields = ('id', "date", "customer", "status", "total", "customer_id")
    def create(self, validated_data):
        validated_data["is_redemption"] = True
        return super().create(validated_data)
    def get_total(self, obj):
        return sum(sp.unit_price * sp.quantity for sp in obj.prizes.all())
