// client/src/utils/api.js
const BASE = '/api';

const request = async (endpoint, options = {}) => {
  const { token, ...rest } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...rest.headers,
  };

  const response = await fetch(`${BASE}${endpoint}`, {
    ...rest,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Server returned invalid JSON');
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Something went wrong');
  }

  // Handle both `data` wrapper and direct response formats
  return data.data !== undefined ? data.data : data;
};

// ─── AUTH ──────────────────────────────────────────────────────
export const sendOtp = (aadhaar) =>
  request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ aadhaar }),
  });

export const verifyOtp = (aadhaar, otp) =>
  request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ aadhaar, otp }),
  });

export const getMe = (token) =>
  request('/auth/me', { token });

// ─── PRODUCTS ──────────────────────────────────────────────────
export const getProducts = (category) =>
  request(`/products${category ? `?category=${category}` : ''}`);

export const getProduct = (id) =>
  request(`/products/${id}`);

// ─── ORDERS ────────────────────────────────────────────────────
export const placeOrder = (items, total, token) =>
  request('/orders', {
    method: 'POST',
    token,
    body: JSON.stringify({ items, total }),
  });

export const getOrders = (userId, token) =>
  request(`/orders/${encodeURIComponent(userId)}`, { token });

// ─── RETURNS ───────────────────────────────────────────────────
export const submitReturn = (data, token) =>
  request('/returns', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });

export const getReturns = (userId, token) =>
  request(`/returns/${encodeURIComponent(userId)}`, { token });

// ─── FRAUD PREDICT ─────────────────────────────────────────────
export const fraudPredict = (features, token) =>
  request('/fraud-predict', {
    method: 'POST',
    token,
    body: JSON.stringify(features),
  });

// ─── RATINGS ───────────────────────────────────────────────────
export const submitRating = (data, token) =>
  request('/ratings', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });

export const getRatings = (customerId, token) =>
  request(`/ratings/${encodeURIComponent(customerId)}`, { token });

// ─── ADMIN ─────────────────────────────────────────────────────
export const getAdminStats = () =>
  request('/admin/stats');

export const getAdminReturns = () =>
  request('/admin/returns');

export const getAdminUsers = () =>
  request('/admin/users');

export const blockUser = (userId) =>
  request('/admin/block-user', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });

export const unblockUser = (userId) =>
  request('/admin/unblock-user', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });

export const getChain = () =>
  request('/admin/chain');

export const validateChain = () =>
  request('/admin/validate');
