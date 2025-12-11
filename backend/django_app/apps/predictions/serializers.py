"""
Prediction Serializers
"""
from rest_framework import serializers
from .models import PredictionRecord, FeatureImportance


class PredictionRecordSerializer(serializers.ModelSerializer):
    """Serializer for prediction records"""
    
    class Meta:
        model = PredictionRecord
        fields = [
            'id', 'prediction', 'probability', 'confidence',
            'risk_level', 'risk_percentage', 'input_filename',
            'input_features_count', 'top_biomarkers', 
            'recommendation', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class FeatureImportanceSerializer(serializers.ModelSerializer):
    """Serializer for feature importance"""
    
    class Meta:
        model = FeatureImportance
        fields = [
            'id', 'feature_name', 'protein_name', 'importance',
            'rank', 'category', 'description', 'updated_at'
        ]
