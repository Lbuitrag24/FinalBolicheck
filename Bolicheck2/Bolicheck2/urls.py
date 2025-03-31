from django.urls import path, include
from User.views import RegisterView, LoginView, UsersViewSet, UsersStaffViewSet, PasswordResetRequestView, PasswordResetConfirmView, RegisterAdminView, UpdateProfilePhoto
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
"""
Digamos que las vistas conectan con los serializers, que son los encargados de traducir el JSON tanto recibido como enviado a objetos de tipo
Python, es como un traductor entre ambas partes.
"""
from rest_framework_simplejwt.views import TokenRefreshView
from Inventory.views import ProductViewSet, CategoryViewSet, SaleClientViewSet, SaleViewSet, SaleProductViewSet, SalePrizeViewSet
from Prizes.views import PrizeViewSet
from Reserves.views import EventViewSet, ReserveViewSet

router = DefaultRouter()
router.register(r"products", ProductViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"sales", SaleClientViewSet, basename="sales")
router.register(r"staff/sales", SaleViewSet, basename="sales_staff")
router.register(r"staff/users", UsersStaffViewSet, basename="users_staff")
router.register(r"salesproduct", SaleProductViewSet, basename="saleProduct")
router.register(r"prizes", PrizeViewSet, basename="prizes")
router.register(r"events", EventViewSet, basename="events")
router.register(r"reserves", ReserveViewSet, basename="reserves")
router.register(r"users", UsersViewSet, basename="users")
router.register(r"salesprize", SalePrizeViewSet, basename="salePrize")

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register', RegisterView.as_view(), name='register'),
    path('api/admin/register', RegisterAdminView.as_view(), name='register_admin'),
    path('api/login', LoginView.as_view(), name="login"),
    path('api/token/refresh', TokenRefreshView.as_view(), name='token_refresh'), #Necesario para la autenticación mediante tokens, NO LO TOKEN! JAJAJA
    path('api/password_reset', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('api/password_reset_confirm/<uidb64>/<token>', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/users/updatephoto', UpdateProfilePhoto.as_view(), name='update_profile_photo'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)