from django.db import models
from User.models import CustomUser
from Prizes.models import Prizes
from django.utils.timezone import now 

class Category(models.Model):
    name = models.CharField(max_length=50, verbose_name="Nombre")
    description = models.TextField(verbose_name="Descripción")
    image = models.ImageField(upload_to='categories/', verbose_name='Foto', default="categories/default.webp") 
    is_available = models.BooleanField(default=True, verbose_name="Disponible")
    
    def __str__(self):
           return self.name
    
    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        db_table = "category"
        ordering = ['id']

class Product(models.Model):
    name = models.CharField(max_length=50, verbose_name="Nombre")
    stock = models.PositiveIntegerField(verbose_name="Cantidad", default=0)
    min_stock = models.PositiveIntegerField(verbose_name="Cantidad mínima")
    max_stock = models.PositiveIntegerField(verbose_name="Cantidad máxima")
    price = models.FloatField(verbose_name="Precio")
    description = models.TextField(verbose_name="Descripción")
    image = models.ImageField(upload_to='products/', verbose_name='Foto', default="products/default.webp") 
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name="Categoría")
    points = models.IntegerField(default=0, verbose_name="Puntos por compra")
    is_available = models.BooleanField(default=False, verbose_name="Disponible")
    offered_price = models.FloatField(verbose_name="Precio de oferta", null=True, blank=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        db_table = "product"
        ordering = ['id']

class SaleStatus(models.TextChoices):
    PENDIENTE = "pendiente", "Por Verificar"
    COMPLETADO = "completado", "Completado"
    CANCELADO = "cancelado", "Cancelado"
        
class Sale(models.Model):
    date = models.DateTimeField(auto_now_add=True, verbose_name="Fecha")
    customer = models.ForeignKey(CustomUser, verbose_name="Id del Cliente", on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=SaleStatus.choices,
        default=SaleStatus.PENDIENTE,
        verbose_name="Estado de la compra"
    )
    total = models.FloatField(verbose_name="Total")
    is_redemption = models.BooleanField(verbose_name="Es redencion", default=0)
    admin_cancel = models.BooleanField(verbose_name="Cancelado por el administrador", null=True, blank=True)
    by = models.ForeignKey(CustomUser, verbose_name="Encargado", on_delete=models.SET_NULL, null=True, blank=True, related_name="by")
    confirmed_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de acción")

    def __str__(self):
        return f"Venta {self.id} - {self.date}"
    
    def is_completed(self):
        return self.status == SaleStatus.COMPLETED

    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        db_table = "sale"
        ordering = ['-date']

class SaleProduct(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='products')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(verbose_name="Cantidad")
    unit_price = models.FloatField(verbose_name="Precio Unitario", blank=True, null=True)
    is_offer = models.BooleanField(verbose_name="Producto en oferta", default=False)
    subtotal = models.FloatField(verbose_name="Subtotal")

    def __str__(self):
        product_name = self.product.name if self.product else "Producto Eliminado"
        return f"Venta {self.sale.id} - Producto {product_name}"

    class Meta:
        verbose_name = "Producto en Venta"
        verbose_name_plural = "Productos en Ventas"
        db_table = "sale_product"
        
class SalePrizes(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='prizes')
    prize = models.ForeignKey(Prizes, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(verbose_name="Cantidad")
    unit_price = models.FloatField(verbose_name="Precio Unitario")
    subtotal = models.FloatField(verbose_name="Subtotal")

    class Meta:
        verbose_name = "Premio en Redención"
        verbose_name_plural = "Premios en Redención"
        db_table = "sale_prize"

class HistoryKind(models.TextChoices):
    CREACION = "creación", "Se crea el producto"
    ENTRADA = "entrada", "Entrada de producto"
    SALIDA = "salida", "Salida de producto"
    HABILITACION = "habilitación", "Se habilita el producto"
    DESHABILITACION = "deshabilitación", "Se deshabilita el producto"
    EDICION = "edición", "Se ha editado el producto"

class ProductsHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Producto")
    kind = models.CharField(
        max_length=20,
        choices=HistoryKind.choices,
        verbose_name="Tipo de registro"
    )
    by = models.ForeignKey(CustomUser, verbose_name="Encargado", null=True, on_delete=models.SET_NULL)
    date = models.DateTimeField(default=now, verbose_name="Fecha del registro")
    description = models.TextField(null=True, blank=True, verbose_name="Descripción del registro")
    sale = models.ForeignKey(Sale, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Venta Relacionada")
    
    class Meta:
        verbose_name = "Historial de productos"
        verbose_name_plural = "Historial de productos"
        db_table = "products_history"
        ordering = ['-date']