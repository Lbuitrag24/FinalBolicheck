import datetime
from django.utils.timezone import timedelta
from rest_framework import status, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.templatetags.static import static
from django.http import HttpResponse
from Bolicheck2.permissions import IsAdminOrReadOnly, IsStaff
from .models import Product, Category, Sale, SaleProduct, SalePrizes, ProductsHistory
from Reserves.models import Reserve
from Prizes.models import Prizes
from .serializers import ProductSerializer, CategorySerializer, SaleSerializer, SaleClientSerializer, SaleProductsSerializer, SalePrizeSerializer, RedemptionSerializer, ProductClientSerializer, ProductEmployeeSerializer
from django.db import transaction
from django.db.models import Q, F, Sum
from django.template.loader import render_to_string
import matplotlib.pyplot as plt
from weasyprint import HTML, CSS
import base64
import io
from rest_framework.exceptions import ValidationError
from User.models import CustomUser
from django.core.files.storage import default_storage
from django.utils.timezone import make_aware

def generar_reporte_ventas(request, ventas, titulo):
    if not ventas.exists():
        return Response({"message": "No hay ventas registradas dentro del rango seleccionado."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        fecha = datetime.datetime.now().date()
        total_completadas = ventas.filter(status="completada").count()
        total_canceladas = ventas.filter(status="cancelada").count()
        total_pendientes = ventas.filter(status="pendiente").count()
        fig, ax = plt.subplots()
        valores = [total_completadas, total_canceladas, total_pendientes]
        colores = ["#33a28e", "#04251e", "#feae33"]
        ax.pie(valores, autopct="%1.1f%%", colors=colores,
           textprops={'color': 'white'})
        ax.set_title("Ventas por Estado")
        buffer = io.BytesIO()
        plt.savefig(buffer, format="png", transparent=True)
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        grafico_base64 = base64.b64encode(image_png).decode("utf-8")
        imagen_grafico = f"data:image/png;base64,{grafico_base64}"
        image_url = request.build_absolute_uri(static("images/bolicheck_Logo.png"))
        logo = request.build_absolute_uri(static("images/bolicheck_Logo2.png"))
        html_string = render_to_string(
            "reports/ventas.html",
            {"imagen_grafico": imagen_grafico, "ventas": ventas,
            "image_url": image_url, "logo": logo, "titulo": titulo, "fecha": fecha},
        )
        pdf_file = HTML(string=html_string).write_pdf()
        response = HttpResponse(pdf_file, content_type="application/pdf")
        response["Content-Disposition"] = f'inline; filename="reporte_{titulo}.pdf"'
        return response

def generar_reporte_productos(request, products, titulo):
    if not products.exists():
        return Response({"message": "No hay productos registrados."}, status=status.HTTP_400_BAD_REQUEST)
    
    fecha = datetime.datetime.now().date()
    
    bajo_stock = products.filter(stock__lte=F('min_stock')).count()
    normal_stock = products.filter(stock__gt=F('min_stock'), stock__lt=F('max_stock')).count()
    inhabilitados = products.filter(is_available=False).count()
    categorias = ["Bajo", "Normal", "Inhabilitados"]
    valores = [bajo_stock, normal_stock, inhabilitados]
    
    fig, ax = plt.subplots(figsize=(8, 4))  
    bars = ax.barh(categorias, valores, color=["#feae33", "#33a28e", "#04251e"])
    
    ax.set_xlabel("Cantidad de Productos")
    ax.set_title("Estado del Stock de Productos")
    
    ax.set_xticks(range(0, max(valores) + 1, max(1, max(valores) // 10)))
    
    for bar, valor in zip(bars, valores):
        ax.text(valor, bar.get_y() + bar.get_height()/2, str(valor), va="center", ha="left", fontsize=10, color="black")
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", transparent=True)
    buffer.seek(0)
    
    image_png = buffer.getvalue()
    buffer.close()
    
    grafico_base64 = base64.b64encode(image_png).decode("utf-8")
    imagen_grafico = f"data:image/png;base64,{grafico_base64}"
    
    image_url = request.build_absolute_uri(static("images/bolicheck_Logo.png"))
    logo = request.build_absolute_uri(static("images/bolicheck_Logo2.png"))
    
    html_string = render_to_string(
        "reports/productos.html",
        {
            "imagen_grafico": imagen_grafico,
            "productos": products.order_by("is_available"),
            "image_url": image_url,
            "logo": logo,
            "titulo": titulo,
            "fecha": fecha
        },
    )
    
    pdf_file = HTML(string=html_string).write_pdf()
    response = HttpResponse(pdf_file, content_type="application/pdf")
    response["Content-Disposition"] = f'inline; filename="reporte_{titulo}.pdf"'
    return response

def generar_reporte_mas_vendidos(request):
    fecha = datetime.datetime.now().date()
    productos_vendidos = (
        SaleProduct.objects.filter(sale__status="completada")
        .values("product__name")
        .annotate(total_vendido=Sum("quantity"))
        .order_by("-total_vendido")[:10]
    )
    if not productos_vendidos:
        return Response({"message": "No hay ventas registradas."}, status=400)
    productos = [p["product__name"] for p in productos_vendidos]
    cantidades = [p["total_vendido"] for p in productos_vendidos]
    fig, ax = plt.subplots(figsize=(15, 5))
    bars = ax.barh(productos[::-1], cantidades[::-1], color = ["#04251e", "#06372C", "#08493B", "#0A5C4A", "#0C6E59", "#0E8168", "#109377", "#12A585", "#14B894", "#16CBA3"])
    ax.set_xlabel("Cantidad Vendida")
    ax.set_title("Top 10 Productos Más Vendidos")
    for bar, cantidad in zip(bars, cantidades[::-1]):
        ax.text(cantidad, bar.get_y() + bar.get_height()/2, str(cantidad), va="center", ha="left", fontsize=10, color="black")
    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", transparent=True)
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()
    grafico_base64 = base64.b64encode(image_png).decode("utf-8")
    imagen_grafico = f"data:image/png;base64,{grafico_base64}"
    image_url = request.build_absolute_uri(static("images/bolicheck_Logo.png"))
    logo = request.build_absolute_uri(static("images/bolicheck_Logo2.png"))
    html_string = render_to_string(
        "reports/mas_vendidos.html",
        {
            "imagen_grafico": imagen_grafico,
            "productos": productos_vendidos,
            "image_url": image_url,
            "logo": logo,
            "titulo": "Reporte de Productos Más Vendidos",
            "fecha": fecha
        },
    )
    pdf_file = HTML(string=html_string).write_pdf(stylesheets=[CSS(string="@page { size: A4 landscape; }")])
    response = HttpResponse(pdf_file, content_type="application/pdf")
    response["Content-Disposition"] = 'inline; filename="reporte_mas_vendidos.pdf"'
    return response

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()

    def get_serializer_class(self):
        if self.request.user.is_superuser:
            return ProductSerializer
        elif self.request.user.is_staff:
            return ProductEmployeeSerializer
        else:
            return ProductClientSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "offered_products"]:
            return [IsAuthenticated()]
        elif self.action in ["changestate", "create", "partial_update", "update", "offer", "endoffer", "inventory_report", "best_sellers_report"]:
            return [IsAdminUser()]
        elif self.action in ["add"]:
            return [IsStaff()]
        elif self.action in ["destroy"]:
            return []

    def perform_create(self, serializer):
        request_data = self.request.data
        request_files = self.request.FILES
        image = request_files.get("image", None)
        try:
            category = int(request_data.get("category_id"))
            categoryExists = Category.objects.get(id=category)
        except (TypeError, ValueError, Category.DoesNotExist):
            raise serializers.ValidationError({
                "message": "La categoría ingresada es inválida."
            })
        product = serializer.save(category=categoryExists)
        if image:
            product.image = image
            product.save(update_fields=["image"])
        ProductsHistory.objects.create(
            product=product,
            kind="CREACION",
            by=self.request.user,
            description=f"Se crea el producto {product.name}, asociado a la categoría {categoryExists.name}."
        )

    def partial_update(self, request, *args, **kwargs):
        try:
            product = self.get_object()
            serializer = ProductSerializer(product, data=request.data, partial=True)

            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            changes = []
            new_photo = request.FILES.get("image", None)

            if new_photo:
                if not new_photo.content_type.startswith("image/"):
                    return Response({"message": "El archivo debe ser una imagen."}, status=status.HTTP_400_BAD_REQUEST)
                changes.append("Se actualiza la imagen")
                if product.image and product.image.name != "products/default.webp":
                    old_photo_path = product.image.path
                    if default_storage.exists(old_photo_path):
                        default_storage.delete(old_photo_path)
                product.image = new_photo

            category = Category.objects.get(id=request.data.get("category_id"))

            if product.name != request.data.get("name", product.name):
                changes.append(f"Nombre cambiado de '{product.name}' a '{request.data.get('name')}'")
                product.name = request.data.get("name", product.name)

            if product.price != serializer.validated_data.get("price", product.price):
                changes.append(f"Precio cambiado de {product.price} a {serializer.validated_data.get('price')}")
                product.price = serializer.validated_data.get("price", product.price)

            if product.description != request.data.get("description", product.description):
                changes.append("Descripción actualizada")
                product.description = request.data.get("description", product.description)

            if product.points != serializer.validated_data.get("points", product.points):
                changes.append(f"Puntos cambiados de {product.points} a {serializer.validated_data.get('points')}")
                product.points = serializer.validated_data.get("points", product.points)

            if product.min_stock != serializer.validated_data.get("min_stock", product.min_stock):
                changes.append(f"Stock mínimo cambiado de {product.min_stock} a {serializer.validated_data.get('min_stock')}")
                product.min_stock = serializer.validated_data.get("min_stock", product.min_stock)

            if product.max_stock != serializer.validated_data.get("max_stock", product.max_stock):
                changes.append(f"Stock máximo cambiado de {product.max_stock} a {serializer.validated_data.get('max_stock')}")
                product.max_stock = serializer.validated_data.get("max_stock", product.max_stock)

            if product.category != category:
                changes.append(f"Categoría cambiada de '{product.category.name}' a '{category.name}'")
                product.category = category

            if changes:
                ProductsHistory.objects.create(
                    product=product,
                    kind="EDICION",
                    by=self.request.user,
                    description=", ".join(changes)
                )

            product.save()
            return Response({"message": "Producto actualizado correctamente."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["POST"])
    def changestate(self, request, pk=None):
        try:
            product = self.get_object()
            if product.stock < product.min_stock and product.is_available == False:
                return Response({"message": "No se puede habilitar el producto, pues no hay suficiente stock del mismo."}, status=status.HTTP_400_BAD_REQUEST)
            elif product.category.is_available == False:
                return Response({"message": f"No se puede habilitar el producto, pues la categoría a la que pertenece \"{product.category.name}\" está deshabilitada."}, status=status.HTTP_400_BAD_REQUEST)
            product.is_available = not product.is_available
            if product.is_available == True:
                ProductsHistory.objects.create(
                    product_id=product.id,
                    kind="HABILITACION",
                    by=self.request.user,
                    description=f"Se habilita el producto {product.name}."
                )
            else:
                ProductsHistory.objects.create(
                    product_id=product.id,
                    kind="INHABILITACION",
                    by=self.request.user,
                    description=f"Se inhhabilita el producto {product.name}."
                )
            product.save()
            estado = "disponible" if product.is_available else "no disponible"
            return Response({"message": f"El producto ahora tiene el estado de {estado}."}, status=status.HTTP_200_OK)      
        except Product.DoesNotExist:
            return Response({"message": "El producto no ha sido encontrado."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["POST"])
    def add(self, request, pk=None):
        product = self.get_object()
        quantity = request.data.get("quantity")
        if quantity is None:
            return Response({"message": "La cantidad es requerida."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            quantity = int(quantity)
        except ValueError:
            return Response({"message": "La cantidad debe ser un número válido."}, status=status.HTTP_400_BAD_REQUEST)
        if quantity <= 0:
            return Response({"message": f"Sólo puedes ingresar valores mayores a 0."}, status=status.HTTP_400_BAD_REQUEST)
        elif product.stock + quantity > product.max_stock:
            return Response({"message": f"El producto {product.name} no puede tener un stock mayor a {product.max_stock}."}, status=status.HTTP_400_BAD_REQUEST)
        product.stock += quantity
        product.save()
        ProductsHistory.objects.create(
            product_id=product.id,
            kind="ENTRADA",
            by=self.request.user,
            description=f"Se registra el ingreso de {quantity} unidades de {product.name}, {product.stock} disponibles."
        )
        return Response({"message": f"Se han agregado {quantity} unidades al producto {product.name}."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["POST"])
    def offer(self, request, pk=None):
        product = self.get_object()
        offeredPrice = request.data.get("offeredPrice")
        if offeredPrice is None:
            return Response({"message": "El precio es requerido."}, status=status.HTTP_400_BAD_REQUEST)
        elif offeredPrice < 0:
            return Response({"message": "El precio no puede ser negativo."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            offeredPrice = int(offeredPrice)
        except ValueError:
            return Response({"message": "El precio debe ser un número válido."}, status=status.HTTP_400_BAD_REQUEST)
        product.offered_price = offeredPrice
        product.save()
        ProductsHistory.objects.create(
            product_id=product.id,
            kind="OFERTA",
            by=self.request.user,
            description=f"Se oferta el producto {product.name}, pasa de {product.price} a {product.offered_price}."
        )
        return Response({"message": f"El producto {product.name} ahora está en oferta (${product.offered_price})."}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["POST"])
    def endoffer(self, request, pk=None):
        product = self.get_object()
        product.offered_price = None
        product.save()
        ProductsHistory.objects.create(
            product_id=product.id,
            kind="FIN OFERTA",
            by=self.request.user,
            description=f"Se termina la oferta del producto {product.name}, pasa a precio regular de {product.price}."
        )
        return Response({"message": f"Se termina la oferta del producto {product.name}, pasa de a precio regular de {product.price}."}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["GET"])
    def offered_products(self, request, pk=None):
        products = Product.objects.filter(offered_price__isnull=False, is_available = True)
        return Response(products.values(), status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["POST"])
    def inventory_report(self, request):
        products = Product.objects.all()
        return generar_reporte_productos(request, products, "Reporte de inventario")
    
    @action(detail=False, methods=["POST"])
    def best_sellers_report(self, request):
        return generar_reporte_mas_vendidos(request)
        
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        elif self.action in ["changestate", "create", "partial_update", "update"]:
            return [IsAdminUser()]
        elif self.action in ["destroy"]:
            return []

    def partial_update(self, request, *args, **kwargs):
        try:
            category = self.get_object()
            new_photo = request.FILES.get('image', None)
            if new_photo:
                if not new_photo.content_type.startswith("image/"):
                    return Response({'error': 'El archivo debe ser una imagen.'}, status=status.HTTP_400_BAD_REQUEST)
                if category.image and category.image.name != 'categories/default.webp':
                    old_photo_path = category.image.path
                    if default_storage.exists(old_photo_path):
                        default_storage.delete(old_photo_path)
                category.image = new_photo
            category.name = request.data.get("name", category.name)
            category.description = request.data.get(
                "description", category.description)
            category.is_available = request.data.get(
                "is_available", category.is_available)
            category.save()
            return Response({'message': 'Categoría actualizada correctamente.'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["POST"])
    def changestate(self, request, pk=None):
        try:
            category = self.get_object()
            new_state = not category.is_available
            with transaction.atomic():
                products = Product.objects.filter(category=category)
                for product in products:
                    if new_state:
                        if product.stock > product.min_stock:
                            product.is_available = True
                            ProductsHistory.objects.create(
                                product_id=product.id,
                                kind="HABILITACION",
                                by=self.request.user,
                                description=f"Se habilita el producto {product.name} desde la categoría."
                            )
                    else:
                        if product.is_available == True:
                            ProductsHistory.objects.create(
                                product_id=product.id,
                                kind="INHABILITACION",
                                by=self.request.user,
                                description=f"Se deshabilita el producto {product.name} desde la categoría."
                        )
                        product.is_available = False
                    product.save()
                category.is_available = new_state
                category.save()
            return Response(
                {"message": f"La categoría ahora tiene el estado de {'disponible' if new_state else 'no disponible'}."},
                status=status.HTTP_200_OK
            )
        except Category.DoesNotExist:
            return Response({"message": "La categoría no ha sido encontrada."}, status=status.HTTP_404_NOT_FOUND)

class SaleClientViewSet(viewsets.ModelViewSet):
    serializer_class = SaleClientSerializer

    def get_queryset(self):
        user = self.request.user
        return Sale.objects.filter(customer_id=user)

    def get_permissions(self):
        if self.action in ["list", "retrieve", "create", "redeem", "cancel"]:
            return [IsAuthenticated()]
        else:
            return [IsAdminUser()]

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        products_data = self.request.data.get("products", [])
        if not products_data:
            raise ValidationError(
                {"message": "Debe haber por lo menos un producto en el carrito para realizar una compra."})
        usersales = Sale.objects.filter(
            customer_id=user, status="pendiente").count()
        if usersales >= 3:
            raise ValidationError(
                {"message": "Tienes 3 compras con estado pendiente, complétalas o cancélalas antes de seguir comprando."})
        total = 0
        product_instances = []
        for product_data in products_data:
            product = Product.objects.get(id=product_data["id"])
            if not product:
                raise ValidationError(
                    {"message": f"El producto con id: {product.id} no existe."})
            elif product_data["quantity"] == 0:
                raise ValidationError(
                    {"message": f"Debes comprar más de 0 unidades de cualquier producto."})
            elif product.stock < product_data["quantity"]:
                raise ValidationError(
                    {"message": f"Lo sentimos, no hay suficiente stock para {product.name}. Stock disponible: {product.stock}."})
            elif product.is_available == False:
                raise ValidationError(
                    {"message": f"Lo sentimos, el producto {product.name} no se encuentra disponible."})
            elif product.offered_price != None:
                subtotal = product.offered_price * product_data["quantity"]
            elif product.offered_price == None:
                subtotal = product.price * product_data["quantity"]
            total += subtotal
            product_instances.append((product, product_data["quantity"]))
        sale = serializer.save(customer_id=user.id, total=total)
        for product, quantity in product_instances:
            product.stock -= quantity
            ProductsHistory.objects.create(
                product_id=product.id,
                kind="SALIDA",
                description=f"Se {"agendan" if quantity > 1 else "agenda"} {quantity} {"unidades" if quantity > 1 else "unidad"} del producto {product.name}, stock restante: {product.stock}.",
                sale_id=sale.id
            )
            if product.stock <= product.min_stock:
                ProductsHistory.objects.create(
                    product_id=product.id,
                    kind="INHABILITACION",
                    description=f"Se inhabilita el producto {product.name} debido a que se ha llegado al stock mínimo."
                )
                product.is_available = False
            product.save()
            unit_price = product.offered_price if product.offered_price is not None else product.price
            is_offered = True if product.offered_price != None else False
            SaleProduct.objects.create(
                sale=sale,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                is_offer=is_offered,
                subtotal=unit_price * quantity
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["POST"])
    def cancel(self, request, pk=None):
        user = self.request.user
        try:
            sale = self.get_object()
            try:
                reserve = Reserve.objects.get(sale_id=sale.id)
                reserve.is_available = False
                reserve.save()
            except Reserve.DoesNotExist:
                reserve = None
            if sale.status == "completada":
                return Response({"message": "La compra ha sido marcada como completada, no se puede cancelar."}, status=status.HTTP_400_BAD_REQUEST)
            elif sale.status == "cancelada":
                return Response({"message": "La compra ya fue cancelada."}, status=status.HTTP_400_BAD_REQUEST)
            elif sale.customer_id != user.id:
                return Response({"message": "No puedes cancelar la compra de otra persona."}, status=status.HTTP_400_BAD_REQUEST)
            for prize in sale.prizes.all():
                recoverStock = (prize.quantity)
                prize.prize.stock += recoverStock
                if prize.prize.stock > 0 and prize.prize.is_available == False:
                    prize.prize.is_available = True
                prize.prize.save()
            for product in sale.products.all():
                recoverStock = (product.quantity)
                product.product.stock += recoverStock
                ProductsHistory.objects.create(
                    product_id=product.product.id,
                    kind="ENTRADA",
                    description=f"Se {"devuelven" if recoverStock > 1 else "devuelve"} {recoverStock} {"unidades" if recoverStock > 1 else "unidad"} del producto {product.product.name} debido a que una venta ha sido cancelada por el cliente.",
                    sale_id = sale.id
                )
                if product.product.stock > product.product.min_stock and product.product.is_available == False:
                    product.product.is_available = True
                    ProductsHistory.objects.create(
                        product_id=product.product.id,
                        kind="HABILITACION",
                        description=f"Se habilita el producto {product.product.name} debido a que una venta ha sido cancelada por el cliente.",
                        sale_id = sale.id
                    )
                product.product.save()
            sale.status = "cancelada"
            sale.confirmed_at = datetime.datetime.now()
            sale.admin_cancel = False
            sale.save()
            return Response({"message": "Tu compra ha sido cancelada."}, status=status.HTTP_200_OK)
        except Sale.DoesNotExist:
            return Response({"message": "La compra no ha sido encontrada."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["POST"])
    @transaction.atomic
    def redeem(self, request):
        prizes_data = request.data.get("prizes", [])
        user = request.user
        if not prizes_data:
            raise ValidationError(
                {"message": "Debe haber al menos un premio dentro de la redención."})
        prize_ids = [p["id"] for p in prizes_data]
        prizes = {p.id: p for p in Prizes.objects.filter(id__in=prize_ids)}
        total = 0
        for prize_data in prizes_data:
            prize = prizes.get(prize_data["id"])
            if not prize:
                raise ValidationError(
                    {"message": f"Premio con ID {prize_data['id']} no encontrado."})
            if prize.stock < prize_data["quantity"]:
                raise ValidationError(
                    {"message": f"No hay suficiente stock para {prize.name}. Stock disponible: {prize.stock}."})
            elif prize.is_available == False:
                raise ValidationError(
                    {"message": f"Lo sentimos, el premio {prize.name} no se encuentra disponible."})
            subtotal = prize.required_points * prize_data["quantity"]
            total += subtotal
        if total > user.points:
            raise ValidationError(
                {"message": "No tienes suficientes puntos para realizar la redención."})
        for prize_data in prizes_data:
            prize = prizes[prize_data["id"]]
            prize.stock -= prize_data["quantity"]
            if prize.stock == 0:
                prize.is_available = False
            prize.save()
        Prizes.objects.bulk_update(prizes.values(), ["stock"])
        user.points -= total
        user.save()
        serializer = RedemptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sale = serializer.save(total=0)
        sale_prizes = [
            SalePrizes(
                sale_id=sale.id,
                prize_id=prizes[prize_data["id"]].id,
                quantity=prize_data["quantity"],
                unit_price=prizes[prize_data["id"]].required_points,
                subtotal=prizes[prize_data["id"]
                                ].required_points * prize_data["quantity"]
            )
            for prize_data in prizes_data
        ]
        SalePrizes.objects.bulk_create(sale_prizes)
        sale.total = total
        sale.save()
        return Response(RedemptionSerializer(sale).data, status=status.HTTP_201_CREATED)

class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    queryset = Sale.objects.all()

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        estado = self.request.query_params.get('estado')
        fecha = self.request.query_params.get('fecha')
        if estado and estado != "todos":
            queryset = queryset.filter(status=estado)
        if fecha:
            today = datetime.datetime.now().date()
            if fecha == "hoy":
                queryset = queryset.filter(
                    date__gte=today, date__lt=today + timedelta(days=1))
            elif fecha == "semana":
                start_week = today - timedelta(days=today.weekday())
                end_week = start_week + timedelta(days=7)
                queryset = queryset.filter(
                    date__gte=start_week, date__lt=end_week)
            elif fecha == "mes":
                first_day = today.replace(day=1)
                first_day_next_month = (
                    first_day + timedelta(days=32)).replace(day=1)
                queryset = queryset.filter(
                    date__gte=first_day, date__lt=first_day_next_month)
            elif fecha == "año":
                queryset = queryset.filter(date__year=today.year)
            elif fecha == "todas":
                queryset = queryset
        if user.is_superuser:
            return queryset
        elif user.is_staff:
            queryset = queryset.filter(
                 Q(status="pendiente") | Q(by=user.id)
            )
            return queryset

    def get_permissions(self):
        if self.action in ["daily_report", "weekly_report", "monthly_report", "yearly_report", "total_report"]:
            return [IsAdminUser()]
        elif self.action in ["create", "list", "retrieve", "confirm", "cancel"]:
            return [IsStaff()]
        elif self.action in ["destroy", "update", "partial_update"]:
            return []

    @transaction.atomic
    def perform_create(self, serializer):
        user = None
        user_id = self.request.data.get("customer_id") or None
        if user_id:
            try:
                user = CustomUser.objects.get(id=user_id)
                usersales = Sale.objects.filter(
                    customer_id=user, status="pendiente").count()
                if usersales >= 3:
                    raise ValidationError({"message": f"El usuario \"{user.username}\" tiene 3 compras con estado pendiente, debe completarlas o cancelarlas."})
            except CustomUser.DoesNotExist:
                raise ValidationError({"message": "El usuario no ha sido encontrado."})
        products_data = self.request.data.get("products", [])
        if not products_data:
            raise ValidationError({"message": "Debe haber por lo menos un producto asociado para realizar una venta."})
        sale = serializer.save(customer=user, total=0)
        total = 0
        for product_data in products_data:
            product = Product.objects.get(id=product_data["id"])
            if product.stock < product_data["quantity"]:
                raise ValidationError({"message": f"No hay suficiente stock para ${product.name}"})
            elif product_data["quantity"] <= 0:
                raise ValidationError({"message": "La cantidad de productos vendidos debe ser mayor a 0."})
            elif product.is_available == False:
                raise ValidationError(
                    {"message": f"Lo sentimos, el producto {product.name} no se encuentra disponible."})
            product.stock -= product_data["quantity"]
            ProductsHistory.objects.create(
                product_id=product.id,
                kind="SALIDA",
                by=self.request.user,
                description=f"Se {"venden" if product_data["quantity"] > 1 else "vende"} {product_data["quantity"]} {"unidades" if product_data["quantity"] > 1 else "unidad"} del producto {product.name}, stock restante: {product.stock}.",
                sale_id=sale.id
            )
            if product.stock < product.min_stock:
                ProductsHistory.objects.create(
                    product_id=product.id,
                    kind="INHABILITACION",
                    description=f"Se inhabilita el producto {product.name} debido a que se ha llegado al stock mínimo."
                )
                product.is_available = False
            product.save()
            subtotal = product.price * product_data["quantity"]
            total += subtotal
            SaleProduct.objects.create(
                sale_id=sale.id,
                product_id=product.id,
                quantity=product_data["quantity"],
                unit_price=product.price,
                subtotal=product.price * product_data["quantity"]
            )
        sale.by = self.request.user
        sale.total = total
        if not user:
            sale.confirmed_at = datetime.datetime.now()
            sale.status = "completada"
        sale.save()

    @action(detail=True, methods=["POST"])
    def confirm(self, request, pk=None):
        try:
            sale = self.get_object()
            try:
                reserve = Reserve.objects.get(sale_id=sale.id)
                reserve.is_available = False
                reserve.save()
            except Reserve.DoesNotExist:
                reserve = None
            if sale.status == "completada":
                return Response({"message": "La venta ya fue completada."}, status=status.HTTP_400_BAD_REQUEST)
            elif sale.status == "cancelada":
                return Response({"message": "La venta ha sido marcada como cancelada, no se puede confirmar."}, status=status.HTTP_400_BAD_REQUEST)
            sale.status = "completada"
            if sale.customer:
                cliente = sale.customer
                pointsToAdd = 0
                for product in sale.products.all():
                    pointsToAdd += (product.product.points * product.quantity)
                cliente.points += pointsToAdd
                cliente.save()
            sale.by = self.request.user
            sale.confirmed_at = datetime.datetime.now()
            sale.save()
            return Response({"message": "La venta ha sido completada."}, status=status.HTTP_200_OK)
        except Sale.DoesNotExist:
            return Response({"message": "La venta no ha sido encontrada."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["POST"])
    def cancel(self, request, pk=None):
        try:
            sale = self.get_object()
            try:
                reserve = Reserve.objects.get(sale_id=sale.id)
                reserve.is_available = False
                reserve.save()
            except Reserve.DoesNotExist:
                reserve = None
            if reserve:
                reserve.is_available = False
                reserve.save()
            if sale.status == "completada":
                return Response({"message": "La venta ha sido marcada como completada, no se puede cancelar."}, status=status.HTTP_400_BAD_REQUEST)
            elif sale.status == "cancelada":
                return Response({"message": "La venta ya fue cancelada."}, status=status.HTTP_400_BAD_REQUEST)

            for product in sale.products.all():
                recoverStock = (product.quantity)
                product.product.stock += recoverStock
                ProductsHistory.objects.create(
                    product_id=product.product.id,
                    kind="ENTRADA",
                    description=f"Se {"devuelven" if recoverStock > 1 else "devuelve"} {recoverStock} {"unidades" if recoverStock > 1 else "unidad"} del producto {product.product.name} debido a que una venta ha sido cancelada.",
                    sale_id = sale.id
                )
                if product.product.stock > 0 and product.product.is_available == False:
                    product.product.is_available = True
                    ProductsHistory.objects.create(
                        product_id=product.product.id,
                        kind="HABILITACION",
                        description=f"Se habilita el producto {product.product.name} debido a que una venta ha sido cancelada.",
                        sale_id = sale.id
                    )
                product.product.save()
            sale.status = "cancelada"
            sale.admin_cancel = True
            sale.by = self.request.user
            sale.confirmed_at = datetime.datetime.now()
            sale.save()
            return Response({"message": "La venta ha sido cancelada, todos los productos han sido devueltos al stock."}, status=status.HTTP_200_OK)
        except Sale.DoesNotExist:
            return Response({"message": "La venta no ha sido encontrada."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["POST"])
    def daily_report(self, request):
        fecha = datetime.date.today()
        inicio_dia = make_aware(datetime.datetime.combine(fecha, datetime.time.min))
        fin_dia = make_aware(datetime.datetime.combine(fecha, datetime.time.max))
        ventas = Sale.objects.filter(date__range=[inicio_dia, fin_dia])
        return generar_reporte_ventas(request, ventas, "Reporte diario de ventas")

    @action(detail=False, methods=["POST"])
    def weekly_report(self, request):
        fecha = datetime.datetime.now().date()
        start_week = fecha - timedelta(days=fecha.weekday())
        ventas = Sale.objects.filter(date__gte=start_week)
        return generar_reporte_ventas(request, ventas, "Reporte semanal de ventas")

    @action(detail=False, methods=["POST"])
    def monthly_report(self, request):
        fecha = datetime.datetime.now().date()
        ventas = Sale.objects.filter(
            date__month=fecha.month, date__year=fecha.year)
        return generar_reporte_ventas(request, ventas, "Reporte mensual de ventas")

    @action(detail=False, methods=["POST"])
    def yearly_report(self, request):
        fecha = datetime.datetime.now().date()
        ventas = Sale.objects.filter(date__year=fecha.year)
        return generar_reporte_ventas(request, ventas, "Reporte anual de ventas")

    @action(detail=False, methods=["POST"])
    def total_report(self, request):
        ventas = Sale.objects.all()
        return generar_reporte_ventas(request, ventas, "Reporte completo de ventas")

class SaleProductViewSet(viewsets.ModelViewSet):
    serializer_class = SaleProductsSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SaleProduct.objects.all()
        return SaleProduct.objects.filter(sale__customer_id=user)

    def get_permissions(self):
        if self.action in ["list", "retrieve", "create"]:
            return [IsAuthenticated()]
        return [IsAdminOrReadOnly()]

class SalePrizeViewSet(viewsets.ModelViewSet):
    serializer_class = SalePrizeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SaleProduct.objects.all()
        return SaleProduct.objects.filter(sale__customer_id=user)

    def get_permissions(self):
        if self.action in ["list", "retrieve", "create"]:
            return [IsAuthenticated()]
        return [IsAdminOrReadOnly()]