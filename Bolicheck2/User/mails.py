from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def enviar_reestablecimiento(usuario_email, nombre, link):
    subject = "Reestablece tu contraseña | Bolicheck"
    html_content = render_to_string("emails/reestablecimiento_clave.html", {
        "nombre": nombre,
        "link": link,
    })
    text_content = strip_tags(html_content)
    email = EmailMultiAlternatives(subject, text_content, "bolicheck@outlook.com", [usuario_email])
    email.attach_alternative(html_content, "text/html")
    email.send()
