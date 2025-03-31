from rest_framework import serializers
from .models import Event, Reserve
from Inventory.models import Sale
from User.serializers import UserSerializer

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'event_type', 'description', 'is_available')

class ReserveSerializer(serializers.ModelSerializer):
    event_type_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(), source="event_type", write_only=True
    )
    sale = serializers.PrimaryKeyRelatedField(
        queryset=Sale.objects.all(), required=False, allow_null=True
    )
    event_type = EventSerializer(read_only=True)
    customer = UserSerializer(read_only=True)

    class Meta:
        model = Reserve
        fields = ('id', 'customer', 'date_in', 'date_out', 'event_type', 'sale', 'event_type_id', 'num_people')

class ReserveClientSerializer(serializers.ModelSerializer):
    date_in = read_only = True
    date_out = read_only=True
    event_type = EventSerializer(read_only = True)
    sale = serializers.SerializerMethodField()

    def get_sale(self, obj):
       from Inventory.serializers import SaleClientSerializer
       sale = obj.sale 
       if sale:
           return SaleClientSerializer(sale).data
       return None

    class Meta:
        model = Reserve
        fields = ('id', 'customer', 'date_in', 'date_out', 'event_type', 'sale', 'event_type_id', 'num_people')