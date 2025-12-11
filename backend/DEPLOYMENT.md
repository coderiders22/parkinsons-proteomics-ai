# Backend Deployment Guide

## Quick Deploy to Render

### 1. Prerequisites
- GitHub repository pushed
- Render account (free): https://render.com

### 2. Deploy Steps

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect GitHub account
   - Select: `parkinsons-proteomics-ai`
   - Click "Connect"

3. **Configure Service**
   ```
   Name: parkinsons-api
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn api.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Environment Variables** (Optional)
   ```
   ENVIRONMENT=production
   DEBUG=False
   SECRET_KEY=<generate-random-key>
   ```

5. **Select Plan**
   - Choose "Free" plan
   - Click "Create Web Service"

6. **Wait for Deployment**
   - Build takes ~5-10 minutes
   - You'll get URL: `https://parkinsons-api.onrender.com`

### 3. Test Deployment

```bash
# Test health endpoint
curl https://parkinsons-api.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "model_loaded": true,
  "scaler_loaded": true,
  "protein_mappings": 50
}
```

### 4. Update Frontend

Update your frontend API URL to:
```
https://parkinsons-api.onrender.com
```

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn api.main:app --reload --port 8000
```

## Troubleshooting

**Issue:** Model files not found
- **Solution:** Ensure model files are in project root, not in .gitignore

**Issue:** CORS errors
- **Solution:** Add your frontend URL to CORS_ORIGINS in config.py

**Issue:** Build fails
- **Solution:** Check requirements.txt has all dependencies
