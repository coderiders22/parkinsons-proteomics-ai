/**
 * API Client for Parkinson's Proteomics AI
 * Connects to FastAPI backend for predictions and Django for auth
 */

// Backend URLs Configuration
// For mobile/Expo: Use your machine's local IP address
// For web: Use localhost
import { Platform } from 'react-native';

// Get the base URL based on platform
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  } else {
    // For mobile devices, use your machine's local IP
    // Update this IP if your network changes
    return 'http://192.168.1.6:8000';
  }
};

const BASE_URL = getBaseURL();
const FASTAPI_URL = `${BASE_URL}/api/v1`;
const DJANGO_URL = `${BASE_URL}/api/v1/django`;

// Token storage
let authToken = null;

/**
 * Set the authentication token
 */
export function setAuthToken(token) {
  authToken = token;
}

/**
 * Get the current auth token
 */
export function getAuthToken() {
  return authToken;
}

/**
 * Clear the auth token (logout)
 */
export function clearAuthToken() {
  authToken = null;
}

/**
 * Make API request with error handling
 */
async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
      throw new Error(errorData.detail || errorData.error || 'Request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check if the server is running and try again.');
    }
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Upload file (multipart/form-data)
 */
async function uploadFile(url, file, fieldName = 'file') {
  const formData = new FormData();
  
  // Platform detection: Web vs React Native
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
  
  if (isWeb) {
    // Web: Use File/Blob directly
    // file should be a File object from input or FileReader
    if (file instanceof File || file instanceof Blob) {
      formData.append(fieldName, file, file.name || 'file.csv');
    } else if (file.uri) {
      // Handle React Native file object on web (convert to File)
      // This happens when expo-document-picker is used on web
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const fileName = file.name || 'file.csv';
        const fileObj = new File([blob], fileName, { type: file.mimeType || 'text/csv' });
        formData.append(fieldName, fileObj);
      } catch (err) {
        console.error('Error converting file:', err);
        throw new Error('Failed to process file for upload');
      }
    } else {
      throw new Error('Invalid file object for web platform');
    }
  } else {
    // React Native: Use FormData with uri
    formData.append(fieldName, {
      uri: file.uri,
      type: file.mimeType || 'text/csv',
      name: file.name || 'file.csv',
    });
  }

  const headers = {};
  
  // Don't set Content-Type on web - browser will set it with boundary automatically
  // React Native needs it explicitly
  if (!isWeb) {
    headers['Content-Type'] = 'multipart/form-data';
  }

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for file uploads

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(errorData.detail || errorData.error || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out. The file might be too large or the server is processing. Please try again.');
    }
    console.error('Upload Error:', error);
    throw error;
  }
}

// =============================================================================
// AUTHENTICATION APIs (FastAPI)
// =============================================================================

/**
 * Register a new user
 */
export async function signup({ name, email, password }) {
  const data = await request(`${FASTAPI_URL}/auth/signup`, {
    method: 'POST',
    body: { name, email, password },
  });
  
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  
  return data;
}

/**
 * Login user
 */
export async function login({ email, password }) {
  const data = await request(`${FASTAPI_URL}/auth/login`, {
    method: 'POST',
    body: { email, password },
  });
  
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  
  return data;
}

/**
 * Logout user
 */
export async function logout() {
  clearAuthToken();
  return { message: 'Logged out successfully' };
}

/**
 * Get current user profile
 */
export async function getProfile() {
  return request(`${FASTAPI_URL}/auth/me`);
}

// =============================================================================
// PREDICTION APIs (FastAPI)
// =============================================================================

/**
 * Run inference with proteomics data
 */
export async function runInference({ formData, proteinData }) {
  try {
    // First, get the required features from backend to know exact seq_* names
    const featuresResponse = await getRequiredFeatures();
    const expectedFeatures = featuresResponse?.features || [];
    
    // Convert protein data to API format
    // Backend expects: { patient: {...}, proteomics: [{ name: string, value: number }] }
    // where name should be seq_* format
    
    // Create a map from protein names/symbols to values
    // Priority: Use backend response data (most accurate from CSV)
    const proteinMap = {};
    
    // First, try to use backend response data (from CSV upload)
    if (proteinData?.backendResponse?.patients && proteinData.backendResponse.patients.length > 0) {
      const firstPatient = proteinData.backendResponse.patients[0];
      const patientFeatures = firstPatient.features || {};
      const usedFeatures = proteinData.backendResponse.used_features || [];
      
      // Map all used features with their actual values
      usedFeatures.forEach(feature => {
        proteinMap[feature] = patientFeatures[feature] || 1.0;
      });
    }
    
    // Fallback to provided protein data
    if (Object.keys(proteinMap).length === 0) {
      (proteinData?.allProteins || proteinData?.topProteins || []).forEach((p) => {
        const key = p.symbol || p.name;
        if (key) {
          proteinMap[key] = p.value || p.importance || 1.0;
        }
      });
    }
    
    // Map to expected features, using proteinMap if available, otherwise default to 1.0
    const proteomics = expectedFeatures.length > 0
      ? expectedFeatures.map((featureName) => ({
          name: featureName,
          value: proteinMap[featureName] || 1.0,
        }))
      : // Fallback: use provided data or generate default
        (proteinData?.allProteins || proteinData?.topProteins || [])
          .slice(0, 50)
          .map((p, index) => {
            const name = p.symbol?.startsWith('seq_') 
              ? p.symbol 
              : p.name?.startsWith('seq_')
                ? p.name
                : `seq_${index + 1}`;
            
            return {
              name: name,
              value: p.value || p.importance || 1.0,
            };
          });

    // Ensure we have exactly 50 proteins (backend requirement)
    if (proteomics.length < 50) {
      for (let i = proteomics.length; i < 50; i++) {
        const featureName = expectedFeatures[i] || `seq_${i + 1}`;
        proteomics.push({
          name: featureName,
          value: 1.0,
        });
      }
    }

    // Send ONLY proteomics data - no demographic/patient data
    return request(`${FASTAPI_URL}/model/infer`, {
      method: 'POST',
      body: {
        patient: {}, // Empty - model only uses proteomics
        proteomics: proteomics.slice(0, 50), // Ensure exactly 50
      },
    });
  } catch (error) {
    console.error('Inference error:', error);
    throw error;
  }
}

/**
 * Upload CSV file for prediction
 */
export async function predictFromCSV(file) {
  return uploadFile(`${FASTAPI_URL}/model/predict-csv`, file);
}

/**
 * Get required features for prediction
 */
export async function getRequiredFeatures() {
  return request(`${FASTAPI_URL}/model/required-features`);
}

/**
 * Get sample data format
 */
export async function getSampleData() {
  return request(`${FASTAPI_URL}/model/sample-data`);
}

// =============================================================================
// FEATURE IMPORTANCE APIs (FastAPI)
// =============================================================================

/**
 * Get feature importance
 */
export async function getFeatureImportance(topN = 50) {
  return request(`${FASTAPI_URL}/features/importance?top_n=${topN}`);
}

/**
 * Get biomarker details
 */
export async function getBiomarkers() {
  return request(`${FASTAPI_URL}/features/biomarkers`);
}

/**
 * Get protein categories
 */
export async function getCategories() {
  return request(`${FASTAPI_URL}/features/categories`);
}

// =============================================================================
// PREDICTION HISTORY APIs (Django)
// =============================================================================

/**
 * Get prediction history
 */
export async function getPredictionHistory() {
  return request(`${DJANGO_URL}/predictions/history/`);
}

/**
 * Get specific prediction detail
 */
export async function getPredictionDetail(id) {
  return request(`${DJANGO_URL}/predictions/history/${id}/`);
}

// =============================================================================
// DEFAULT EXPORT (for compatibility with existing code)
// =============================================================================

const api = {
  request: (path, options) => {
    // Determine which base URL to use
    const baseUrl = path.startsWith('/auth') || path.startsWith('/model') || path.startsWith('/features')
      ? FASTAPI_URL
      : DJANGO_URL;
    
    return request(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      body: options.body,
      headers: options.headers,
    });
  },
};

export default api;
