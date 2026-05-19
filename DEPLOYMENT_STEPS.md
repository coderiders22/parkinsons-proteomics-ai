# Deployment Guide - Parkinson's Proteomics AI

## 📱 APK Build & Backend Deployment

### Step 1: Backend Deploy (Render/Railway)

#### Option A: Render (Recommended - Free tier available)

1. **Go to Render.com** and sign up/login
2. **Create New Web Service**
   - Connect your GitHub repo: `coderiders22/parkinsons-proteomics-ai`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3.11

3. **Environment Variables:**
   ```
   PORT=8000
   ENVIRONMENT=production
   DEBUG=False
   ```

4. **After deployment, you'll get URL like:**
   ```
   https://parkinsons-api.onrender.com
   ```

#### Option B: Railway

1. Go to railway.app
2. New Project → Deploy from GitHub
3. Select repo and set root directory to `backend`
4. Railway auto-detects Python and deploys

---

### Step 2: Update API Client with Deployed Backend URL

After backend is deployed, update `src/services/apiClient.js`:

```javascript
// Replace localhost with your deployed backend URL
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'https://parkinsons-api.onrender.com'; // Your deployed URL
  } else {
    // For mobile APK, use deployed backend
    return 'https://parkinsons-api.onrender.com'; // Same deployed URL
  }
};
```

---

### Step 3: Build Android APK

#### Using Expo EAS Build (Recommended)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS:**
   ```bash
   eas build:configure
   ```

3. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```

4. **Download APK** from Expo dashboard

#### Using Expo Classic Build (Alternative)

1. **Install Expo CLI:**
   ```bash
   npm install -g expo-cli
   ```

2. **Build APK:**
   ```bash
   expo build:android -t apk
   ```

3. **Wait for build** (takes 15-20 minutes)
4. **Download APK** from Expo dashboard

---

### Step 4: Update Backend CORS for Mobile

After deploying backend, update CORS in `backend/api/config.py`:

```python
CORS_ORIGINS: list = [
    "https://your-expo-app-url.expo.dev",  # Expo web URL
    "exp://your-expo-app-url",  # Expo mobile URL
    "*",  # For APK, allow all (or specific domains)
]
```

Or in Render dashboard, add environment variable:
```
CORS_ORIGINS=["*"]
```

---

## ✅ Complete Flow

1. **Deploy Backend** → Get URL (e.g., `https://parkinsons-api.onrender.com`)
2. **Update API Client** → Replace localhost with deployed URL
3. **Commit & Push** → Push updated code to GitHub
4. **Build APK** → Use EAS or Expo CLI
5. **Test APK** → Install on Android device and test

---

## 🔧 Important Notes

- **APK will work** with deployed backend ✅
- **APK needs internet** to connect to backend
- **Backend URL must be HTTPS** for production
- **CORS must allow** your app's origin
- **Model files** must be in backend directory (they're already there)

---

## 🚀 Quick Commands

```bash
# 1. Update API URL
# Edit src/services/apiClient.js with deployed backend URL

# 2. Commit changes
git add .
git commit -m "Update API URL for production"
git push

# 3. Build APK
eas build --platform android --profile preview

# 4. Download and install APK on Android device
```

---

## 📝 Environment Setup

### For EAS Build:
Create `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## ✅ Testing Checklist

- [ ] Backend deployed and accessible
- [ ] API URL updated in code
- [ ] CORS configured correctly
- [ ] APK built successfully
- [ ] APK installed on Android device
- [ ] App connects to backend
- [ ] CSV upload works
- [ ] Predictions work

---

**Note:** APK will work perfectly with deployed backend! Just make sure:
1. Backend is deployed and accessible
2. API URL is updated in code
3. CORS allows your app
4. APK is built with updated code


