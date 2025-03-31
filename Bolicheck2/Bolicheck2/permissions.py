from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permite acceso de solo lectura a usuarios normales,
    pero requiere permisos de administrador para modificar.
    """

    def has_permission(self, request, view):
        # Esto permite solicitudes de tipo GET(SAFE_METHODS)
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Sólo usuarios que sean staff o superuser pueden acceder
        return request.user.is_staff or request.user.is_superuser

class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff or request.user.is_superuser
