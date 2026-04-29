// client/src/utils/api.js

// Use relative path to leverage Vite proxy in development
// This resolves CORS and localhost resolution issues.
const BASE_URL = '/api';

const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // If the response is not JSON (e.g. 404 HTML), this might fail
    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) throw new Error(result.error || `HTTP Error ${response.status}`);
    
    return result;
  } catch (error) {
    console.error(`[API ERROR] ${endpoint}`, error);
    throw error;
  }
};

export const api = {
  products: {
    getAll: () => fetchAPI('/products'),
  },
  checkout: {
    submit: (data) => fetchAPI('/checkout', { method: 'POST', body: JSON.stringify(data) }),
  },
  orders: {
    getAll: () => fetchAPI('/orders'),
  },
  returns: {
    submit: (data) => fetchAPI('/returns', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => fetchAPI('/returns'),
  },
  admin: {
    processReturn: (id, status) => fetchAPI(`/admin/returns/${id}/action`, { method: 'POST', body: JSON.stringify({ status }) }),
  }
};
