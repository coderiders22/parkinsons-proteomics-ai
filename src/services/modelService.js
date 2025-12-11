/**
 * Model Service
 * Wrapper for ML prediction API calls
 */
import { runInference, predictFromCSV, getRequiredFeatures, getSampleData } from './apiClient';

/**
 * Run inference with patient and proteomics data
 * @param {Object} params - { formData, proteinData }
 */
export async function predict({ formData, proteinData }) {
  return runInference({ formData, proteinData });
}

/**
 * Upload CSV file for prediction
 * @param {Object} file - File object from document picker
 */
export async function predictCSV(file) {
  return predictFromCSV(file);
}

/**
 * Get required feature names
 */
export async function getFeatures() {
  return getRequiredFeatures();
}

/**
 * Get sample data format
 */
export async function getSample() {
  return getSampleData();
}

// Export for compatibility
export { runInference };
