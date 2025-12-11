"""
Prediction Routes
Handles CSV upload and Parkinson's Disease prediction
"""
import io
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from pydantic import BaseModel
import pandas as pd
import numpy as np

from api.services.model_service import ModelService, get_model_service
from api.routes.auth import get_current_user

router = APIRouter()


# Pydantic Models for Patient-Level Predictions
class PatientPrediction(BaseModel):
    """Single patient prediction result"""
    patient_id: int
    prediction: int  # 0 = Healthy, 1 = Parkinson's Risk
    probability: float  # 0-100%
    risk_level: str  # Low, Moderate, High, Very High
    interpretation: str


class SummaryStats(BaseModel):
    """Summary statistics for batch predictions"""
    total_patients: int
    pd_positive: int
    pd_negative: int
    positive_rate: float


class BiomarkerInfo(BaseModel):
    """Biomarker importance info"""
    rank: int
    name: str
    importance: float
    importance_pct: float


class ProteomicsData(BaseModel):
    """Proteomics data for a single patient"""
    name: str
    value: float


class InferenceRequest(BaseModel):
    """Request for single patient inference"""
    patient: Optional[dict] = None  # Patient metadata (optional)
    proteomics: List[ProteomicsData]  # List of protein measurements


class SinglePredictionResponse(BaseModel):
    """Response for single patient prediction"""
    success: bool
    prediction: int  # 0 = Healthy, 1 = Parkinson's Risk
    probability: float  # 0-100%
    risk_level: str  # Low, Moderate, High, Very High
    interpretation: str
    confidence: float  # 0-1


class PredictionResponse(BaseModel):
    """Full prediction response"""
    success: bool
    message: str
    summary: SummaryStats
    patients: List[PatientPrediction]
    top_biomarkers: List[BiomarkerInfo]
    
    class Config:
        extra = "allow"


@router.post("/predict-csv", response_model=PredictionResponse)
async def predict_from_csv(
    file: UploadFile = File(...),
    model_service: ModelService = Depends(get_model_service),
):
    """
    Upload CSV file with patient biomarker data and get Parkinson's predictions.
    
    **Input Format:**
    - CSV with 50 biomarker columns (seq_* format)
    - Each row represents one patient
    - No target/label column required
    
    **Returns for each patient:**
    - prediction: 0 (Healthy) or 1 (Parkinson's Risk)
    - probability: Confidence score (0-100%)
    - risk_level: Low, Moderate, High, or Very High
    - interpretation: Human-readable result
    
    **Note:** This is patient-level prediction. Metrics like accuracy, F1, AUC 
    are NOT provided as they require labeled test data.
    """
    # Validate file type
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Please upload a CSV or Excel file."
        )
    
    try:
        # Read file content
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        
        # Make predictions
        result = model_service.predict(df)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Prediction failed"))
        
        return PredictionResponse(**result)
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="The CSV file is empty or malformed.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.get("/required-features")
async def get_required_features(
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get the list of required protein features for prediction
    
    Returns the 50 protein column names expected by the model.
    Use this to prepare your CSV file with the correct column headers.
    """
    # Use feature_names if available, otherwise return empty list
    expected_features = model_service.feature_names if model_service.feature_names else []
    
    return {
        "feature_count": len(expected_features),
        "features": expected_features,
        "feature_importance": model_service.get_feature_importance()
    }


@router.post("/infer", response_model=SinglePredictionResponse)
async def infer_single_patient(
    request: InferenceRequest,
    model_service: ModelService = Depends(get_model_service),
):
    """
    Run inference for a single patient with proteomics data.
    
    **Input:**
    - patient: Optional patient metadata (age, sex, etc.)
    - proteomics: List of protein measurements with name and value
    
    **Returns:**
    - prediction: 0 (Healthy) or 1 (Parkinson's Risk)
    - probability: Confidence score (0-100%)
    - risk_level: Low, Moderate, High, or Very High
    - interpretation: Human-readable result
    - confidence: Model confidence (0-1)
    """
    try:
        # Convert proteomics list to dictionary format expected by model
        proteomics_dict = {item.name: item.value for item in request.proteomics}
        
        # Create a DataFrame with a single row
        df = pd.DataFrame([proteomics_dict])
        
        # Make prediction
        result = model_service.predict(df)
        
        if not result["success"]:
            raise HTTPException(
                status_code=400, 
                detail=result.get("error", "Prediction failed")
            )
        
        # Extract single patient result
        if result.get("patients") and len(result["patients"]) > 0:
            patient_result = result["patients"][0]
            return SinglePredictionResponse(
                success=True,
                prediction=patient_result["prediction"],
                probability=patient_result["probability"],
                risk_level=patient_result["risk_level"],
                interpretation=patient_result["interpretation"],
                confidence=patient_result.get("probability", 0) / 100.0
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="No prediction result returned"
            )
            
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required protein feature: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during inference: {str(e)}"
        )


@router.get("/sample-data")
async def get_sample_data(
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get sample data format for prediction
    
    Returns a sample row with random values for testing the API.
    """
    # Use feature_names if available
    features = model_service.feature_names if model_service.feature_names else []
    
    # If no features available, generate sample seq_* names
    if not features:
        features = [f"seq_{i+1}" for i in range(50)]
    
    sample = {}
    for feature in features:
        sample[feature] = round(np.random.uniform(0.5, 2.5), 4)
    
    return {
        "description": "Sample proteomics data format",
        "note": "Replace values with actual protein measurements",
        "sample_row": sample
    }
