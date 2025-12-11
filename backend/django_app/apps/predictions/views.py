"""
Prediction Views
"""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PredictionRecord
from .serializers import PredictionRecordSerializer


class PredictionHistoryView(generics.ListAPIView):
    """List user's prediction history"""
    
    serializer_class = PredictionRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PredictionRecord.objects.filter(user=self.request.user)


class PredictionDetailView(generics.RetrieveAPIView):
    """Get single prediction detail"""
    
    serializer_class = PredictionRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PredictionRecord.objects.filter(user=self.request.user)
