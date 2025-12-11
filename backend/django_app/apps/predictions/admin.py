"""
Prediction Admin Configuration
"""
from django.contrib import admin
from .models import PredictionRecord, FeatureImportance


@admin.register(PredictionRecord)
class PredictionRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'risk_level', 'probability', 'prediction', 'created_at']
    list_filter = ['risk_level', 'prediction', 'created_at']
    search_fields = ['user__email', 'user__name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(FeatureImportance)
class FeatureImportanceAdmin(admin.ModelAdmin):
    list_display = ['rank', 'feature_name', 'protein_name', 'importance', 'category']
    list_filter = ['category']
    search_fields = ['feature_name', 'protein_name']
    ordering = ['rank']
