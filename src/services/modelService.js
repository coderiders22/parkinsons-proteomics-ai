import api from './apiClient';


const INFERENCE_PATH = '/model/infer';

export async function runInference({ formData, proteinData }) {
  // When hooking to real backend, send actual file/JSON here.
  // If backend expects multipart for Excel, change body and headers accordingly.
  return api.request(INFERENCE_PATH, {
    method: 'POST',
    body: {
      patient: formData,
      proteomics: proteinData?.allProteins || proteinData?.topProteins || [],
    },
  });
}

