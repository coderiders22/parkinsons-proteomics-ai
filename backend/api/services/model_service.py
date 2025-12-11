"""
Model Service - Simple prediction using saved LightGBM model + saved StandardScaler
Based on working Flask approach
"""
import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

from api.config import settings


class ModelService:
    """Service for making patient-level predictions using saved model + scaler"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.protein_mapping = {}
        self.feature_names = []  # Store the actual feature names (seq_*)
        self._load_model_and_scaler()
        self._load_protein_mapping()
        self._initialize_feature_names()
    
    def _load_model_and_scaler(self):
        """Load the trained LightGBM model AND the saved StandardScaler"""
        try:
            # Load model
            if os.path.exists(settings.MODEL_PATH):
                self.model = joblib.load(settings.MODEL_PATH)
                print(f"✓ Model loaded from: {settings.MODEL_PATH}")
            else:
                raise FileNotFoundError(f"Model not found at: {settings.MODEL_PATH}")
            
            # Load scaler
            if os.path.exists(settings.SCALER_PATH):
                self.scaler = joblib.load(settings.SCALER_PATH)
                print(f"✓ Scaler loaded from: {settings.SCALER_PATH}")
            else:
                raise FileNotFoundError(f"Scaler not found at: {settings.SCALER_PATH}")
                
        except Exception as e:
            print(f"✗ Error loading model/scaler: {e}")
            raise
    
    def _load_protein_mapping(self):
        """Load feature -> protein name mapping"""
        try:
            mapping_path = os.path.join(os.path.dirname(__file__), "../data/feature_protein_mapping.csv")
            if os.path.exists(mapping_path):
                df = pd.read_csv(mapping_path)
                self.protein_mapping = dict(zip(df['seq_column'], df['protein_name']))
                print(f"✓ Loaded {len(self.protein_mapping)} protein mappings")
            else:
                print(f"⚠ Protein mapping file not found at {mapping_path}, using seq names only")
                self.protein_mapping = {}
        except Exception as e:
            print(f"⚠ Could not load protein mapping: {e}")
            self.protein_mapping = {}
    
    def _initialize_feature_names(self):
        """Initialize feature names from the mapping file (these are the 50 selected seq_* features)"""
        try:
            mapping_path = os.path.join(os.path.dirname(__file__), "../data/feature_protein_mapping.csv")
            if os.path.exists(mapping_path):
                df = pd.read_csv(mapping_path)
                self.feature_names = df['seq_column'].tolist()
                print(f"✓ Initialized {len(self.feature_names)} feature names")
            else:
                print(f"⚠ Could not initialize feature names, file not found")
                self.feature_names = []
        except Exception as e:
            print(f"⚠ Could not initialize feature names: {e}")
            self.feature_names = []
    
    def predict(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Make predictions for patients using SAVED scaler (transform only, no fit!)
        
        Input: CSV with rows=patients, columns=50 biomarkers (seq_* columns)
        Output: For EACH patient → prediction (0/1) + probability (0-100%)
        """
        if self.model is None or self.scaler is None:
            raise ValueError("Model or Scaler not loaded")
        
        n_patients = len(data)
        print(f"📊 Received {n_patients} patients")
        
        # Get numeric columns (seq_* biomarker columns)
        seq_cols = [c for c in data.columns if str(c).startswith("seq_")]
        if len(seq_cols) == 0:
            # Fallback to all numeric columns
            seq_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(seq_cols) < 50:
            raise ValueError(f"Expected 50 biomarkers, got {len(seq_cols)}")
        
        # Use first 50 columns
        X_df = data[seq_cols[:50]].copy()
        
        # Validate against scaler expectation
        if hasattr(self.scaler, "n_features_in_"):
            expected_n = int(self.scaler.n_features_in_)
            if X_df.shape[1] != expected_n:
                raise ValueError(f"Number of features ({X_df.shape[1]}) doesn't match scaler's expected ({expected_n})")
        
        # Convert to numpy
        X_np = X_df.to_numpy()
        
        # Apply SAVED scaler (transform only - do NOT fit!)
        X_scaled = self.scaler.transform(X_np)
        
        # Get predictions from model
        probabilities = self.model.predict_proba(X_scaled)[:, 1]  # P(PD)
        predictions = (probabilities >= 0.5).astype(int)  # 0 or 1
        
        # Get global feature importances once
        feature_importances = self.model.feature_importances_
        feature_names = seq_cols[:50]
        
        # Build per-patient results
        patients = []
        for i in range(n_patients):
            prob = float(probabilities[i])
            pred = int(predictions[i])
            conf_delta = abs(prob - 0.5)
            confidence = 'High' if conf_delta > 0.3 else 'Medium' if conf_delta > 0.15 else 'Low'
            
            # Get patient's original feature values
            patient_features = {}
            for j, feat_name in enumerate(feature_names):
                patient_features[feat_name] = float(X_np[i, j])
            
            # Calculate per-patient feature contributions (simple: value * importance)
            contributions = []
            for j, feat_name in enumerate(feature_names):
                contribution = float(X_scaled[i, j] * feature_importances[j])
                protein_name = self.protein_mapping.get(feat_name, feat_name)
                contributions.append({
                    "feature": feat_name,
                    "protein_name": protein_name,
                    "display_name": f"{protein_name} ({feat_name})",
                    "value": float(X_np[i, j]),
                    "scaled_value": float(X_scaled[i, j]),
                    "contribution": contribution,
                    "importance": float(feature_importances[j])
                })
            
            # Sort by absolute contribution and get top 5
            contributions_sorted = sorted(contributions, key=lambda x: abs(x["contribution"]), reverse=True)
            top_contributors = contributions_sorted[:5]
            
            patients.append({
                "patient_id": i + 1,
                "prediction": pred,  # 0 = Healthy, 1 = PD
                "probability": round(prob * 100, 2),  # as percentage 0-100
                "risk_level": self._get_risk_level(prob),
                "confidence": confidence,
                "interpretation": "Parkinson's Disease" if pred == 1 else "Healthy",
                "features": patient_features,  # Original feature values
                "top_contributors": top_contributors  # Top 5 features for this patient
            })
        
        # Summary counts
        total = n_patients
        pd_positive = int(predictions.sum())
        pd_negative = total - pd_positive
        avg_prob = round(float(np.mean(probabilities)) * 100, 2)
        
        print(f"✓ Predictions: {pd_positive} PD positive, {pd_negative} healthy out of {total}")
        
        return {
            "success": True,
            "message": f"Analyzed {total} patients",
            "summary": {
                "total_patients": total,
                "pd_positive": pd_positive,
                "pd_negative": pd_negative,
                "positive_rate": round(pd_positive / total * 100, 2),
                "average_probability": avg_prob
            },
            "patients": patients,
            "top_biomarkers": self._get_feature_importance(seq_cols[:50]),
            "used_features": seq_cols[:50],
            "feature_protein_map": {seq: self.protein_mapping.get(seq, seq) for seq in seq_cols[:50]}
        }
    
    def _get_risk_level(self, probability: float) -> str:
        """Convert probability to human-readable risk level"""
        if probability < 0.3:
            return "Low"
        elif probability < 0.5:
            return "Moderate"
        elif probability < 0.7:
            return "High"
        else:
            return "Very High"
    
    def _get_feature_importance(self, feature_names: List[str] = None, top_n: int = 10) -> List[Dict]:
        """Get top biomarkers by model importance"""
        if self.model is None:
            return []
        
        try:
            importances = self.model.feature_importances_
            total_importance = importances.sum()
            indices = np.argsort(importances)[::-1][:top_n]
            
            # Use provided feature names, or use stored feature names, or fallback to generic names
            if feature_names is None:
                if self.feature_names:
                    feature_names = self.feature_names
                elif hasattr(self.model, 'feature_name_'):
                    feature_names = self.model.feature_name_
                elif hasattr(self.model, 'booster_') and hasattr(self.model.booster_, 'feature_name'):
                    feature_names = self.model.booster_.feature_name()
                else:
                    feature_names = [f"Feature_{i}" for i in range(len(importances))]
            
            return [
                {
                    "rank": i + 1,
                    "feature": feature_names[idx] if idx < len(feature_names) else f"Feature_{idx}",
                    "protein_name": self.protein_mapping.get(feature_names[idx], feature_names[idx]) if idx < len(feature_names) else f"Feature_{idx}",
                    "name": self.protein_mapping.get(feature_names[idx], feature_names[idx]) if idx < len(feature_names) else f"Feature_{idx}",
                    "display_name": f"{self.protein_mapping.get(feature_names[idx], feature_names[idx])} ({feature_names[idx]})" if idx < len(feature_names) else f"Feature_{idx}",
                    "importance": round(float(importances[idx]), 4),
                    "importance_pct": round(float(importances[idx]) / total_importance * 100, 2) if total_importance > 0 else 0
                }
                for i, idx in enumerate(indices)
            ]
        except Exception as e:
            print(f"Could not get feature importance: {e}")
            return []
    
    def get_feature_importance(self, top_n: int = 50) -> List[Dict]:
        """Public method for feature importance endpoint"""
        return self._get_feature_importance(feature_names=None, top_n=top_n)


# Singleton
_model_service: Optional[ModelService] = None

def get_model_service() -> ModelService:
    global _model_service
    if _model_service is None:
        _model_service = ModelService()
    return _model_service
