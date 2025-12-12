# Render Deployment Fix

## Issues Fixed:

1. ✅ **Python Version**: Added `runtime.txt` to force Python 3.11.9 (not 3.13)
2. ✅ **Setuptools**: Added setuptools and wheel to requirements.txt
3. ✅ **Build Command**: Updated to install setuptools first
4. ✅ **Start Command**: Fixed path (if root directory is `backend`)

## Render Dashboard Settings:

When creating/updating service in Render:

1. **Root Directory**: `backend`
2. **Build Command**: `pip install --upgrade pip setuptools wheel && pip install -r requirements.txt`
3. **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
4. **Python Version**: 3.11.9 (set in Environment Variables or use runtime.txt)

## Environment Variables to Add:

```
PYTHON_VERSION=3.11.9
PORT=8000
ENVIRONMENT=production
```

## Model Files:

Make sure model files are in the repo:
- `lgb_model_20251211_093754.pkl` (should be in root, not backend/)
- `scaler_20251211_093754.pkl` (should be in root, not backend/)

If model files are in root, update `backend/api/config.py` MODEL_PATH to:
```python
MODEL_PATH: str = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "lgb_model_20251211_093754.pkl"
)
```

## After Deployment:

1. Get your Render URL (e.g., `https://parkinsons-api.onrender.com`)
2. Update `src/services/apiClient.js` with this URL
3. Test the API: `https://parkinsons-api.onrender.com/health`

