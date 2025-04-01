from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from Bolicheck2.permissions import IsAdminOrReadOnly, IsStaff
from rest_framework.response import Response
from .models import Event, Reserve
from Inventory.models import SaleProduct, Sale
from .serializers import EventSerializer, ReserveSerializer, ReserveClientSerializer
from .mails import enviar_confirmacion_reserva
from rest_framework.decorators import action
from datetime import datetime, timedelta
from django.db import transaction
from rest_framework.exceptions import ValidationError
from Inventory.models import Product
from django.db.models import Sum

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        elif self.action in ["changestate", "create", "partial_update", "update"]:
            return [IsStaff()]
        elif self.action in ["destroy"]:
            return []
    
    @action(detail=True, methods=["POST"])
    def changestate(self, request, pk=None):
        try:
            event = self.get_object()
            event.is_available = not event.is_available
            event.save()
            estado = 'disponible' if event.is_available else 'no disponible'
            return Response({"message": f"El evento ahora tiene el estado de {estado}."}, status=status.HTTP_200_OK)
        except Event.DoesNotExist:
            return Response({"message": "El evento no ha sido encontrado."}, status=status.HTTP_404_NOT_FOUND)

class ReserveViewSet(viewsets.ModelViewSet):
    serializer_class = ReserveSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Reserve.objects.all()
        return Reserve.objects.filter(customer_id = user)

    def get_permissions(self):
        if self.action in ["list", "retrieve", "create", "available_slots"]:
            return [IsAuthenticated()]
        return [IsAdminOrReadOnly()]

    @transaction.atomic
    def perform_create(self, serializer):
        event = Event.objects.get(id=self.request.data.get("event_type_id"))
        if not event.is_available:
            raise ValidationError({"message": f"El evento \"{event.event_type}\" ya no está disponible."})
        user = self.request.user
        now = datetime.now()
        date_in = self.request.data.get("date_in")
        date_out = self.request.data.get("date_out")
        num_people = int(self.request.data.get("num_people", 1))
        date_in_dt = datetime.strptime(date_in, "%Y-%m-%dT%H:%M")
        date_out_dt = datetime.strptime(date_out, "%Y-%m-%dT%H:%M")
        if not date_in or not date_out:
            raise ValidationError({"message": "Se requieren fecha de entrada y salida."})
        if not num_people:
            raise ValidationError({"message": "Se requiere el número de personas."})
        if date_in_dt > date_out_dt:
            raise ValidationError({"message": "La hora de entrada no puede ser después que la hora de salida."})
        if date_out_dt - date_in_dt > timedelta(days=1):
            raise ValidationError({"message": "Las reservas no pueden durar más de un día."})
        if date_in_dt < now or date_out_dt < now:
            raise ValidationError({"message": f"Las reservas no pueden tener una fecha anterior al {now}."})
        max_capacity = 20 
        current_capacity = Reserve.objects.filter(
            is_available=True,
            date_in__lt=date_out_dt,
            date_out__gt=date_in_dt
        ).aggregate(total_people=Sum('num_people'))["total_people"] or 0 
        if current_capacity + num_people == max_capacity:
            raise ValidationError({"message": f"El aforo máximo de 20 personas ya ha sido alcanzado en ese horario."})
        if current_capacity + num_people > max_capacity:
            raise ValidationError({"message": f"No hay cupos para {num_people} personas, quedan {max_capacity - current_capacity} cupos."})
        products_data = self.request.data.get("products", [])
        if not products_data:
            raise ValidationError({"message": "Debe haber al menos un producto en el carrito para realizar una compra."})
        total = 0
        product_instances = []
        for product_data in products_data:
            try:
                product = Product.objects.get(id=product_data["id"])
            except Product.DoesNotExist:
                raise ValidationError({"message": f"El producto con id {product_data['id']} no existe."})
            if product.stock < product_data["quantity"]:
                raise ValidationError({"message": f"Lo sentimos, no hay suficiente stock para {product.name}. Stock disponible: {product.stock}."})
            subtotal = product.offered_price if product.offered_price is not None else product.price * product_data["quantity"]
            total += subtotal
            product_instances.append((product, product_data["quantity"]))
        usersales = Sale.objects.filter(customer_id=user, status="pendiente").count()
        if usersales >= 3:
            raise ValidationError({"message": "Tienes 3 compras con estado pendiente, complétalas o cancélalas antes de seguir reservando."})
        sale = Sale.objects.create(customer_id=user.id, total=total)
        reserve = serializer.save(customer=user, sale=sale, num_people=num_people)
        for product, quantity in product_instances:
            product.stock -= quantity
            if product.stock == 0:
                product.is_available = False
            product.save()
            SaleProduct.objects.create(
                sale=sale,
                product=product,
                quantity=quantity,
                unit_price=product.offered_price if product.offered_price is not None else product.price,
                subtotal=product.offered_price if product.offered_price is not None else product.price * quantity
            )
        productos_data = [
            {
                "name": producto.product.name,
                "description": producto.product.description,
                "quantity": producto.quantity,
                "subtotal": producto.subtotal
            }
            for producto in SaleProduct.objects.filter(sale=sale)
        ]
        enviar_confirmacion_reserva(
            reserve.customer.email, reserve.customer.first_name, reserve.date_in, productos_data, total
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=["GET"])
    def available_slots(self, request):
        date_in = request.GET.get("date_in")
        date_out = request.GET.get("date_out")
        if not date_in or not date_out:
            return Response({"error": "Se requieren fecha de entrada y salida."}, status=status.HTTP_400_BAD_REQUEST)
        date_in_dt = datetime.strptime(date_in, "%Y-%m-%dT%H:%M")
        date_out_dt = datetime.strptime(date_out, "%Y-%m-%dT%H:%M")
        if date_in_dt > date_out_dt:
            raise ValidationError({"message": "La hora de entrada no puede ser después que la hora de salida."})
        if date_out_dt - date_in_dt > timedelta(days=1):
            raise ValidationError({"message": "Las reservas no pueden durar más de un día."})
        if date_in_dt < datetime.now() or date_out_dt < datetime.now():
            raise ValidationError({"message": f"Las reservas no pueden tener una fecha anterior al {datetime.now()}."})
        active_reserves = Reserve.objects.filter(is_available=True, date_in__lt=date_out_dt, date_out__gt=date_in_dt).aggregate(total_people=Sum('num_people'))["total_people"] or 0
        max_capacity = 20
        available_slots = max_capacity - active_reserves
        return Response({"available_slots": available_slots})


    @action(detail=False, methods=["GET"])
    def reservesauth(self, request):
        user = request.user
        reserves = Reserve.objects.filter(is_available = True)
        data = [
            ReserveClientSerializer(reserva).data if reserva.customer_id == user.id else {
                "date_in": reserva.date_in,
                "date_out": reserva.date_out
            }
            for reserva in reserves
        ]
        return Response(data)
    
