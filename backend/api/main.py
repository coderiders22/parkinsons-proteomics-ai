"""
FastAPI Main Application
Parkinson's Disease Prediction API
"""
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.config import settings
from api.routes import prediction, auth, feature_importance

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Parkinson's Disease Prediction API
    
    This API provides endpoints for:
    - **User Authentication**: Register and login patients
    - **Prediction**: Upload CSV with proteomics data to get PD risk prediction
    - **Feature Importance**: Get the importance of selected biomarkers
    
    ### Key Features:
    - LightGBM-based prediction model trained on proteomics data
    - Top 50 protein biomarkers for classification
    - Real-time prediction with confidence scores
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_PREFIX}/auth",
    tags=["Authentication"]
)

app.include_router(
    prediction.router,
    prefix=f"{settings.API_PREFIX}/model",
    tags=["Prediction"]
)

app.include_router(
    feature_importance.router,
    prefix=f"{settings.API_PREFIX}/features",
    tags=["Feature Importance"]
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Parkinson's Proteomics AI API",
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "parkinsons-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
