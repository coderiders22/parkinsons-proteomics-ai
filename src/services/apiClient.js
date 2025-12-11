const BASE_URL = '';

async function request(path, { method = 'GET', headers = {}, body }) {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not set in apiClient.js');
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  const json = await res.json();
  return json;
}

export default {
  request,
  getBaseUrl: () => BASE_URL || '(not set)',
  isMock: () => false,
};

