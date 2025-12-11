# Backend Connection Guide

## ✅ Setup Complete!

Your React Native app is now configured to connect to the FastAPI backend.

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
# From project root
cd backend
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the startup script:
```bash
./start-backend.sh
```

### 2. Verify Backend is Running

- **API Health Check**: http://localhost:8000/health
- **API Documentation**: http://localhost:8000/docs
- **Root Endpoint**: http://localhost:8000/

### 3. Start the React Native App

```bash
npm start
```

## 📱 Mobile Connection

The app automatically detects the platform:
- **Web**: Uses `http://localhost:8000`
- **Mobile/Expo**: Uses `http://192.168.1.6:8000` (your local IP)

### Update IP Address

If your network IP changes, update it in:
- `src/services/apiClient.js` - Change the IP in `getBaseURL()` function

To find your IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Predictions
- `POST /api/v1/model/infer` - Single patient prediction
- `POST /api/v1/model/predict-csv` - Batch prediction from CSV
- `GET /api/v1/model/required-features` - Get required features
- `GET /api/v1/model/sample-data` - Get sample data format

### Features
- `GET /api/v1/features/importance` - Get feature importance
- `GET /api/v1/features/biomarkers` - Get biomarker details

## 🛠️ Troubleshooting

### Connection Issues

1. **Check Backend is Running**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check CORS Settings**
   - Backend CORS is configured in `backend/api/config.py`
   - Make sure your IP is in the `CORS_ORIGINS` list

3. **Check Firewall**
   - Make sure port 8000 is not blocked
   - On macOS: System Preferences → Security → Firewall

4. **Mobile Device on Same Network**
   - Both your computer and mobile device must be on the same WiFi network

### Common Errors

- **Network request failed**: Backend not running or wrong IP address
- **CORS error**: IP not in CORS_ORIGINS list
- **Connection refused**: Backend not listening on 0.0.0.0

## 📝 Notes

- Backend runs on port **8000** by default
- Backend must be accessible from your network (use `0.0.0.0` not `127.0.0.1`)
- For production, use environment variables for API URLs

