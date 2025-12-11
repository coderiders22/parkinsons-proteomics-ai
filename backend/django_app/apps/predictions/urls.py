"""
Prediction URL patterns
"""
from django.urls import path
from .views import PredictionHistoryView, PredictionDetailView

urlpatterns = [
    path('history/', PredictionHistoryView.as_view(), name='prediction-history'),
    path('history/<int:pk>/', PredictionDetailView.as_view(), name='prediction-detail'),
]
