from django.db import models
class Prizes(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    required_points = models.IntegerField()
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='prizes/', blank=True, null=True, default="prizes/default.webp")
    is_available = models.BooleanField(default=True, verbose_name="Disponible")

    class Meta:
        db_table = 'prizes'

    def __str__(self):
        return self.name