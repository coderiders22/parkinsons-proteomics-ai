# API URL Update Instructions

## After Backend Deployment

Once your backend is deployed (e.g., `https://parkinsons-api.onrender.com`), update `src/services/apiClient.js`:

### Current Code (Line 12-20):
```javascript
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  } else {
    return 'http://192.168.1.6:8000';
  }
};
```

### Updated Code (Replace with your deployed URL):
```javascript
const getBaseURL = () => {
  // Use deployed backend URL for both web and mobile
  const DEPLOYED_BACKEND_URL = 'https://parkinsons-api.onrender.com'; // Replace with your URL
  
  if (Platform.OS === 'web') {
    return DEPLOYED_BACKEND_URL;
  } else {
    return DEPLOYED_BACKEND_URL; // APK will use this
  }
};
```

### Or use Environment Variable:
```javascript
const getBaseURL = () => {
  // Use environment variable or fallback to deployed URL
  const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://parkinsons-api.onrender.com';
  return BACKEND_URL;
};
```

Then in `.env` file:
```
EXPO_PUBLIC_API_URL=https://parkinsons-api.onrender.com
```


