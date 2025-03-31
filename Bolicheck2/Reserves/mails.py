from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import json

def enviar_confirmacion_reserva(usuario_email, nombre, fecha_reserva, productos, total):
    productos = json.loads(json.dumps(productos))

    subject = "Confirmación de tu reserva en Bolicheck"
    html_content = render_to_string("emails/confirmacion_reserva.html", {
        "nombre": nombre,
        "fecha_reserva": fecha_reserva,
        "productos": productos,
        "total": total
    })
    text_content = strip_tags(html_content)
    email = EmailMultiAlternatives(subject, text_content, "bolicheck@outlook.com", [usuario_email])
    email.attach_alternative(html_content, "text/html")
    email.send()
