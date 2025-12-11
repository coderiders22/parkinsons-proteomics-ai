"""
Prediction History Models
"""
from django.db import models
from django.conf import settings


class PredictionRecord(models.Model):
    """Store prediction history for users"""
    
    RISK_CHOICES = [
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
        ('very_high', 'Very High'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    
    # Prediction results
    prediction = models.IntegerField()  # 0 or 1
    probability = models.FloatField()
    confidence = models.FloatField()
    risk_level = models.CharField(max_length=20, choices=RISK_CHOICES)
    risk_percentage = models.FloatField()
    
    # Input data (stored as JSON)
    input_filename = models.CharField(max_length=255, blank=True)
    input_features_count = models.IntegerField(default=50)
    
    # Top biomarkers (stored as JSON)
    top_biomarkers = models.JSONField(default=list)
    
    # Recommendation
    recommendation = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Prediction Record'
        verbose_name_plural = 'Prediction Records'
    
    def __str__(self):
        return f"{self.user.email} - {self.risk_level} ({self.created_at.date()})"


class FeatureImportance(models.Model):
    """Store feature importance from the model"""
    
    feature_name = models.CharField(max_length=255, unique=True)
    protein_name = models.CharField(max_length=255, blank=True)
    importance = models.FloatField()
    rank = models.IntegerField()
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    
    # Last updated
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['rank']
        verbose_name = 'Feature Importance'
        verbose_name_plural = 'Feature Importances'
    
    def __str__(self):
        return f"{self.rank}. {self.protein_name or self.feature_name}"
