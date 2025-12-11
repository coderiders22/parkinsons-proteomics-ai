/**
 * API Client for Parkinson's Proteomics AI
 * Connects to FastAPI backend for predictions and Django for auth
 */

// Backend URLs - Update these with your server IP for mobile testing
const FASTAPI_URL = 'http://localhost:8000/api/v1';
const DJANGO_URL = 'http://localhost:8001/api/v1/django';

// For Expo development, use your machine's IP:
// const FASTAPI_URL = 'http://192.168.1.x:8000/api/v1';
// const DJANGO_URL = 'http://192.168.1.x:8001/api/v1/django';

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
    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Upload file (multipart/form-data)
 */
async function uploadFile(url, file, fieldName = 'file') {
  const formData = new FormData();
  formData.append(fieldName, {
    uri: file.uri,
    type: file.mimeType || 'text/csv',
    name: file.name,
  });

  const headers = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Upload failed');
    }

    return data;
  } catch (error) {
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
  // Convert protein data to API format
  const proteomics = (proteinData?.allProteins || proteinData?.topProteins || [])
    .map((p, index) => ({
      name: p.name || `Protein_${index + 1}`,
      value: p.value || p.importance || Math.random() * 2,
    }));

  return request(`${FASTAPI_URL}/model/infer`, {
    method: 'POST',
    body: {
      patient: formData,
      proteomics,
    },
  });
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
