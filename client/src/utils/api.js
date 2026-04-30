const BASE = "/api";

const request = async (endpoint, options = {}) => {
  const { token, ...rest } = options;
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...rest.headers,
  };

  const response = await fetch(`${BASE}${endpoint}`, {
    ...rest,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
};

export const sendOtp = (aadhaar) => 
  request("/auth/send-otp", { 
    method: "POST", 
    body: JSON.stringify({ aadhaar }) 
  });

export const verifyOtp = (aadhaar, otp) => 
  request("/auth/verify-otp", { 
    method: "POST", 
    body: JSON.stringify({ aadhaar, otp }) 
  });

export const getProducts = (category) => 
  request(`/products${category ? `?category=${category}` : ""}`);

export const getProduct = (id) => 
  request(`/products/${id}`);

export const placeOrder = (items, total, token) => 
  request("/orders", { 
    method: "POST", 
    token, 
    body: JSON.stringify({ items, total }) 
  });

export const getOrders = (aadhaar, token) => 
  request(`/orders/${aadhaar}`, { token });

export const submitReturn = (data, token) => 
  request("/returns", { 
    method: "POST", 
    token, 
    body: JSON.stringify(data) 
  });

export const getReturns = (aadhaar, token) => 
  request(`/returns/${aadhaar}`, { token });

export const getTrustScore = (token) => 
  request("/auth/me", { token });

export const getAdminStats = () => 
  request("/admin/stats");

export const getAdminReturns = () => 
  request("/admin/returns");

export const getChain = () => 
  request("/admin/chain");

export const validateChain = () => 
  request("/admin/validate");
