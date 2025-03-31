import datetime
from rest_framework import viewsets, permissions, status
from django.contrib.auth.tokens import default_token_generator
from .mails import enviar_reestablecimiento
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, RegisterAdminSerializer
from .models import CustomUser
from django.core.files.storage import default_storage
from Bolicheck2.permissions import IsStaff
from rest_framework.decorators import action
from django.db.models import Count, Sum, Value, FloatField, Q
from django.db.models.functions import Coalesce
import matplotlib.pyplot as plt
from django.http import HttpResponse
import io
import base64
from django.template.loader import render_to_string
from weasyprint import HTML, CSS
from django.templatetags.static import static

def generar_reporte_empleados(request):
    fecha = datetime.datetime.now().date()
    empleados = (
        CustomUser.objects.filter(is_staff=True, is_superuser=False, is_active=True)
        .values("username")
        .annotate(total_ventas=Count("by", filter=Q(by__status="completada") & Q(by__is_redemption=False)),
                  total_vendido=Sum("by__total", filter=Q(by__status="completada") & Q(by__is_redemption=False)) or 0)
        .order_by("-total_ventas")
    )
    if not empleados.exists():
        return Response({"message": "No hay empleados."}, status=400)
    empleadosTable = (
    CustomUser.objects.filter(is_staff=True, is_superuser=False, is_active=True)
    .values("username")
    .annotate(
        total_ventas=Count("by", filter=Q(by__status="completada") & Q(by__is_redemption=False)), 
        total_vendido=Coalesce(Sum("by__total", filter=Q(by__status="completada") & Q(by__is_redemption=False)), Value(0), output_field=FloatField())
    ).order_by("-total_vendido")
    )
    empleados_nombres = [e["username"] for e in empleados]
    ventas_totales = [e["total_ventas"] for e in empleados]
    fig, ax = plt.subplots(figsize=(15, 5))
    special_colors = ["#FFD700", "#C0C0C0", "#CD7F32"]  
    default_color = "#04251e"
    colors = [special_colors[i] if i < 3 else default_color for i in range(len(empleados_nombres))]
    bars = ax.barh(
        empleados_nombres, ventas_totales, 
        color=colors,
        edgecolor="white",
        hatch="//",
        linewidth=1.5
    )
    ax.set_xlabel("Ventas Realizadas")
    ax.set_title("Top Empleados según sus ventas")
    for bar, cantidad in zip(bars, ventas_totales):
        ax.text(cantidad, bar.get_y() + bar.get_height()/2, str(cantidad), 
                va="center", ha="left", fontsize=10, color="black")
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
        "reports/empleados.html",
        {
            "imagen_grafico": imagen_grafico,
            "empleados": empleados_nombres,
            "image_url": image_url,
            "logo": logo,
            "titulo": "Reporte de Empleados",
            "fecha": fecha,
            "empleadosTable": empleadosTable
        },
    )

    pdf_file = HTML(string=html_string).write_pdf(
        stylesheets=[CSS(string="@page { size: A4 landscape; }")]
    )

    response = HttpResponse(pdf_file, content_type="application/pdf")
    response["Content-Disposition"] = 'inline; filename="reporte_empleados.pdf"'
    return response

def generar_reporte_clientes(request):
    fecha = datetime.datetime.now().date()
    clientes = (
        CustomUser.objects.filter(is_staff=False, is_superuser=False, is_active=True)
        .values("username")
        .annotate(total_compras=Count("sale", filter=Q(sale__status="completada") & Q(sale__is_redemption=False)))
        .order_by("-total_compras")
    )
    if not clientes.exists():
        return Response({"message": "No hay clientes."}, status=400)
    clientesTable = (
    CustomUser.objects.filter(is_staff=False, is_superuser=False, is_active=True)
    .values("username")
    .annotate(
        total_compras=Count("sale", filter=Q(sale__status="completada") & Q(sale__is_redemption=False)),
        total_comprado=Coalesce(Sum("sale__total", filter=Q(sale__status="completada") & Q(sale__is_redemption=False)), Value(0), output_field=FloatField()))
    ).order_by("-total_comprado")
    clientes_nombres = [c["username"] for c in clientes]
    compras_totales = [c["total_compras"] for c in clientes]
    fig, ax = plt.subplots(figsize=(15, 5))
    special_colors = ["#FFD700", "#C0C0C0", "#CD7F32"]  
    default_color = "#04251e"
    colors = [special_colors[i] if i < 3 else default_color for i in range(len(clientes_nombres))]
    bars = ax.barh(
        clientes_nombres, compras_totales, 
        color=colors,
        edgecolor="white",
        hatch="//",
        linewidth=1.5
    )
    ax.set_xlabel("Compras Realizadas")
    ax.set_title("Top Clientes según sus compras")
    for bar, cantidad in zip(bars, compras_totales):
        ax.text(cantidad, bar.get_y() + bar.get_height()/2, str(cantidad), 
                va="center", ha="left", fontsize=10, color="black")
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
        "reports/clientes.html",
        {
            "imagen_grafico": imagen_grafico,
            "clientes": clientes_nombres,
            "image_url": image_url,
            "logo": logo,
            "titulo": "Reporte de Clientes",
            "fecha": fecha,
            "clientesTable": clientesTable
        },
    )
    pdf_file = HTML(string=html_string).write_pdf(
        stylesheets=[CSS(string="@page { size: A4 landscape; }")]
    )
    response = HttpResponse(pdf_file, content_type="application/pdf")
    response["Content-Disposition"] = 'inline; filename="reporte_clientes.pdf"'
    return response

class RegisterView(APIView):
    serializer_class = RegisterSerializer
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = serializer.get_tokens_for_user(user)
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': {
                    'id' : user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'username': user.username,
                    'telephone': user.telephone_number,
                    'identification': user.identification_number,
                    'email': user.email,
                    'points': user.points,
                    'photo': request.build_absolute_uri(user.photo.url)
                },
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    permission_classes = [permissions.AllowAny]
    
class RegisterAdminView(APIView):
    serializer_class = RegisterAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        serializer = RegisterAdminSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Usuario registrado exitosamente'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)
    
class UsersViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        return CustomUser.objects.exclude(id=user.id)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def points(self, request):
        return Response({'points': request.user.points}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["POST"], permission_classes=[permissions.IsAdminUser])
    def changestate(self, request, pk=None):
        try:
            user = self.get_object()
            user.is_active = not user.is_active
            user.save()
            return Response(
                {"message": f"La cuenta del usuario ha sido {"habilitada, ahora podrà iniciar sesiòn." if user.is_active else "inhabilitada, no podrà iniciar sesiòn."}"},
                status=status.HTTP_200_OK
            )
        except CustomUser.DoesNotExist:
            return Response({"message": "El usuario no ha sido encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=["POST"], permission_classes=[permissions.IsAdminUser])
    def employees_report(self, request):
        return generar_reporte_empleados(request)
    
    @action(detail=False, methods=["POST"], permission_classes=[permissions.IsAdminUser])
    def clients_report(self, request):
        return generar_reporte_clientes(request)
    
class UsersStaffViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        users = CustomUser.objects.exclude(id=user.id)
        users = CustomUser.objects.exclude(is_staff=True)
        return users
    serializer_class = UserSerializer
    permission_classes = [IsStaff]

class PasswordResetRequestView(APIView):
    def post(self, request):
        email = self.request.data.get("email")
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"message": "No hemos encontrado un usuario relacionado a este email."}, status=status.HTTP_404_NOT_FOUND)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"
        enviar_reestablecimiento(user.email, user.first_name, reset_link)
        return Response({"message": "Revisa tu bandeja de entrada, pues hemos enviado el link para el reestablecimiento de tu contraseña."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = CustomUser.objects.get(pk=uid)
        except (CustomUser.DoesNotExist, ValueError, TypeError):
            return Response({"message":"Token inválido."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({"message":"Token expirado o inválido."}, status=status.HTTP_400_BAD_REQUEST)
        new_password = request.data.get("password")
        if not new_password or len(new_password) < 6:
            return Response({"message":"La contraseña que has usado no cumple con nuestros requisitos, mínimo debe tener 6 carácteres."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"message":"Tu contraseña ha sido actualizada."})

class UpdateProfilePhoto(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            user = request.user
            if 'photo' not in request.FILES:
                return Response({'error': 'No se envió ninguna imagen.'}, status=status.HTTP_400_BAD_REQUEST)
            new_photo = request.FILES['photo']
            if not new_photo.content_type.startswith("image/"):
                return Response({'error': 'El archivo debe ser una imagen.'}, status=status.HTTP_400_BAD_REQUEST)
            if user.photo and user.photo.name != 'users/default.webp':
                photo_path = user.photo.path
                if default_storage.exists(photo_path):
                    default_storage.delete(photo_path)
            user.photo = new_photo
            user.save()
            return Response({'message': 'Foto de perfil actualizada correctamente.', 'photo_url':request.build_absolute_uri(user.photo.url)}, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetUserPoints(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(sel, request):
        try:
            user = request.user
            return Response({'message': user.points}, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)