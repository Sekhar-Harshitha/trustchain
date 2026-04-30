import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

export default api

export const sendOtp = async (aadhaar) => {
  const res = await api.post('/auth/send-otp', { aadhaar });
  return res.data;
}

export const verifyOtp = async (aadhaar, otp) => {
  const res = await api.post('/auth/verify-otp', { aadhaar, otp });
  return res.data;
}

export const checkout = async (data) => {
  const res = await api.post('/checkout', data);
  return res.data;
}

export const getTransactions = async () => {
  const res = await api.get('/admin/transactions');
  return res.data;
}

export const blockUser = async (userId) => {
  const res = await api.post('/admin/block-user', { userId });
  return res.data;
}
