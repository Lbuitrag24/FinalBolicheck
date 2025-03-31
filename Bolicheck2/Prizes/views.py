from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from Bolicheck2.permissions import IsAdminOrReadOnly, IsStaff
from .models import Prizes
from .serializers import PrizeSerializer
from rest_framework.response import Response
from rest_framework.decorators import action

class PrizeViewSet(viewsets.ModelViewSet):
    queryset = Prizes.objects.all()
    serializer_class = PrizeSerializer
    
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        elif self.action in ["changestate", "create", "partial_update", "update"]:
            return [IsStaff()]
        elif self.action in ["destroy"]:
            return []
    
    @action(detail=True, methods=["POST"])
    def changestate(self, request, pk=None):
        try:
            prize = self.get_object()
            if prize.stock <= 0 and prize.is_available == False:
                return Response({"message": "No se puede habilitar el premio, pues no hay stock del mismo."}, status=status.HTTP_400_BAD_REQUEST)
            prize.is_available = not prize.is_available
            prize.save()
            return Response({"message": f"El premio ahora tiene el estado de {"disponible" if prize.is_available else "no disponible"}."}, status=status.HTTP_200_OK)
        except Prizes.DoesNotExist:
            return Response({"message": "El premio no ha sido encontrado."}, status=status.HTTP_404_NOT_FOUND)