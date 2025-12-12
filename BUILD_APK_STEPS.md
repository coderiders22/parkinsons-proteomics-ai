# Build APK - Final Steps

## ✅ Backend is Live!
**URL:** https://parkinsons-proteomics-ai.onrender.com

## ✅ API URL Updated!
**File:** `src/services/apiClient.js` - Updated to production URL

---

## 📱 Build Android APK

### Step 1: Login to Expo/EAS

```bash
eas login
```

Agar account nahi hai, to:
1. https://expo.dev par sign up karo
2. Phir `eas login` run karo

### Step 2: Configure EAS (if needed)

```bash
eas build:configure
```

### Step 3: Build APK

```bash
eas build --platform android --profile preview
```

### Step 4: Download APK

1. Build complete hone ke baad, Expo dashboard par jao
2. APK download karo
3. Android device par install karo

---

## 🚀 Quick Commands

```bash
# 1. Login
eas login

# 2. Build APK
eas build --platform android --profile preview

# 3. Check build status
eas build:list
```

---

## 📋 Alternative: Expo Classic Build

Agar EAS se issue ho, to:

```bash
# Install Expo CLI
npm install -g expo-cli

# Login
expo login

# Build APK
expo build:android -t apk
```

---

## ✅ After APK is Ready

1. **Download APK** from Expo dashboard
2. **Transfer to Android device**
3. **Install APK** (Allow from Unknown Sources)
4. **Open app** → It will connect to: https://parkinsons-proteomics-ai.onrender.com
5. **Test CSV upload** → Should work perfectly!

---

## 🔧 Troubleshooting

### If build fails:
- Check Expo account is logged in
- Verify `eas.json` exists
- Check `app.json` has correct configuration

### If APK doesn't connect:
- Verify backend is accessible: https://parkinsons-proteomics-ai.onrender.com/health
- Check internet connection on device
- Verify API URL in code is correct

---

**Status:** ✅ Backend Live | ✅ API URL Updated | ⏳ APK Build Pending

