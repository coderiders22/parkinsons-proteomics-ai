/**
 * Feature Importance Service
 * API calls for biomarker and feature importance data
 */
import { getFeatureImportance, getBiomarkers, getCategories } from './apiClient';

/**
 * Get feature importance ranking
 * @param {number} topN - Number of top features to return
 */
export async function fetchFeatureImportance(topN = 50) {
  return getFeatureImportance(topN);
}

/**
 * Get detailed biomarker information
 */
export async function fetchBiomarkers() {
  return getBiomarkers();
}

/**
 * Get protein categories
 */
export async function fetchCategories() {
  return getCategories();
}

// Export default for backward compatibility
export default {
  getImportance: fetchFeatureImportance,
  getBiomarkers: fetchBiomarkers,
  getCategories: fetchCategories,
};
