# Testing Guide - Parkinson's Proteomics AI

## 🚀 Quick Start Testing

### Step 1: Start Backend Server
```bash
cd backend
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Server will be available at:
- **Web**: http://localhost:8000
- **Mobile**: http://192.168.1.6:8000

### Step 2: Start React Native App
```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

---

## 📱 Testing Flow

### Option 1: Demo Mode (Fastest)
1. **Splash Screen** → Tap "Skip to Demo" button (top-right)
2. **Home Screen** → You'll see all visualizations
3. Navigate to different screens to test

### Option 2: Full Flow with Backend

#### 1. **Login/Register**
- **Register**: Create a new account
  - Name: Test User
  - Email: test@example.com
  - Password: test123
- **Login**: Use the credentials you just created
- **Demo Mode**: Tap "Demo Mode" button to skip login

#### 2. **Upload Screen**
- Tap "Upload Excel/CSV" button
- Select a CSV file with 50 protein features (seq_* columns)
- File will be uploaded to backend
- You'll see "50 features detected" message
- Tap "Proceed to Patient Intake"

#### 3. **Input Screen**
- Fill patient information (optional - proteomics is main)
- Or tap "Quick Fill (Demo Data)" for sample data
- Tap "Analyze" button

#### 4. **Analysis Screen**
- Watch the analysis animation
- Backend will process the data
- Wait for results (5 seconds)

#### 5. **Result Screen**
- View prediction results
- See risk assessment
- Check biomarker analysis
- View model performance metrics

---

## 🧪 API Testing (Using Browser/Postman)

### 1. Health Check
```
GET http://localhost:8000/health
```

### 2. Get Required Features
```
GET http://localhost:8000/api/v1/model/required-features
```

### 3. Register User
```
POST http://localhost:8000/api/v1/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123"
}
```

### 4. Login
```
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

### 5. Single Patient Inference
```
POST http://localhost:8000/api/v1/model/infer
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "patient": {
    "age": 65,
    "sex": "Male"
  },
  "proteomics": [
    {"name": "seq_6941_11", "value": 1.5},
    {"name": "seq_2585_2", "value": 2.0},
    ... (50 features total)
  ]
}
```

### 6. Upload CSV File
```
POST http://localhost:8000/api/v1/model/predict-csv
Content-Type: multipart/form-data

file: [your CSV file]
```

---

## 📊 Interactive API Documentation

Visit: **http://localhost:8000/docs**

This provides:
- All available endpoints
- Try it out functionality
- Request/response examples
- Schema documentation

---

## 🔍 Testing Checklist

### ✅ Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Demo mode works
- [ ] Token stored correctly

### ✅ File Upload
- [ ] Upload CSV file
- [ ] File validation works
- [ ] Protein data extracted
- [ ] Error handling for invalid files

### ✅ Prediction
- [ ] Single patient inference works
- [ ] Batch prediction from CSV works
- [ ] Results displayed correctly
- [ ] Error handling for missing data

### ✅ Visualizations
- [ ] Confusion Matrix displays
- [ ] Training Curves show data
- [ ] ROC Curves render properly
- [ ] All charts are interactive

### ✅ Navigation
- [ ] All screens accessible
- [ ] Back navigation works
- [ ] Data persists between screens
- [ ] No crashes

---

## 🐛 Troubleshooting

### Server Not Responding
```bash
# Check if server is running
lsof -ti:8000

# Restart server
cd backend
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Network Timeout
- Check if backend is running
- Verify IP address (192.168.1.6) is correct
- Make sure phone and computer on same WiFi
- Check firewall settings

### Model Loading Error
- Verify model files exist:
  ```bash
  ls -la lgb_model_20251211_093754.pkl
  ls -la scaler_20251211_093754.pkl
  ```

### CORS Errors
- Backend CORS is configured
- Check `backend/api/config.py` for allowed origins

---

## 📝 Sample CSV Format

Your CSV should have 50 columns with names like:
- seq_6941_11
- seq_2585_2
- seq_10967_12
- ... (50 total)

Each row = one patient
Values = protein measurements (numeric)

---

## 🎯 Quick Test Commands

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test root endpoint
curl http://localhost:8000/

# Get required features
curl http://localhost:8000/api/v1/model/required-features

# Test with sample data (after login)
curl -X POST http://localhost:8000/api/v1/model/infer \
  -H "Content-Type: application/json" \
  -d '{"patient": {}, "proteomics": [{"name": "seq_6941_11", "value": 1.5}]}'
```

---

Happy Testing! 🚀

