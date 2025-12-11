/**
 * Authentication Service
 * Wrapper around API client for auth operations
 */
import api, { login as apiLogin, signup as apiSignup, logout as apiLogout, setAuthToken, clearAuthToken } from './apiClient';

/**
 * Login user with email and password
 */
export async function login({ email, password }) {
  return apiLogin({ email, password });
}

/**
 * Register new user
 */
export async function signup({ name, email, password }) {
  return apiSignup({ name, email, password });
}

/**
 * Logout current user
 */
export async function logout() {
  return apiLogout();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  // In a real app, you'd check AsyncStorage for stored token
  return false;
}

/**
 * Store authentication token
 */
export function storeToken(token) {
  setAuthToken(token);
  // In a real app, also store in AsyncStorage
  // AsyncStorage.setItem('authToken', token);
}

/**
 * Remove authentication token
 */
export function removeToken() {
  clearAuthToken();
  // In a real app, also remove from AsyncStorage
  // AsyncStorage.removeItem('authToken');
}
