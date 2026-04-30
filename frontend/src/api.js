import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

export default api

const BASE = "http://localhost:5000/api"

export const sendOtp = async (aadhaar) => {
  const res = await fetch(`${BASE}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aadhaar: aadhaar.replace(/\s/g, "") })
  })
  return res.json()
}

export const verifyOtp = async (aadhaar, otp) => {
  const res = await fetch(`${BASE}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aadhaar: aadhaar.replace(/\s/g, ""), otp: otp })
  })
  return res.json()
}
