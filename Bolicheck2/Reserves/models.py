from django.db import models
from User.models import CustomUser
from django.core.exceptions import ValidationError
from Inventory.models import Sale

class Reserve(models.Model):
    customer = models.ForeignKey(CustomUser, verbose_name="Id del Cliente", on_delete=models.CASCADE)
    date_in = models.DateTimeField(verbose_name="Hora de Inicio")
    date_out = models.DateTimeField(verbose_name="Hora de Finalización")
    event_type = models.ForeignKey('Event', on_delete=models.CASCADE, related_name='reservations')
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, verbose_name="Id de la Venta")
    is_available = models.BooleanField(default=True, verbose_name="Disponible")
    num_people = models.IntegerField(verbose_name="Número de Personas", default=1)

    def clean(self):
        if self.date_out < self.date_in:
            raise ValidationError('La fecha de finalización no puede ser anterior a la fecha de inicio.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        db_table = "reserve"
        ordering = ['-date_in']

class Event(models.Model):
    event_type = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True, verbose_name="Disponible")

    def __str__(self):
        return self.event_type

    class Meta:
        verbose_name = "Evento"
        verbose_name_plural = "Eventos"
        db_table = "event"
        ordering = ['event_type']