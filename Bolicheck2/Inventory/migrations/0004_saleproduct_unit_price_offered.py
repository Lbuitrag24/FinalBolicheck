# Generated by Django 5.0.7 on 2025-03-28 03:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Inventory", "0003_product_offered_price"),
    ]

    operations = [
        migrations.AddField(
            model_name="saleproduct",
            name="unit_price_offered",
            field=models.FloatField(default=1, verbose_name="Precio Unitario Ofertado"),
            preserve_default=False,
        ),
    ]
