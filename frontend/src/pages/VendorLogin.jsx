import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, Smartphone, Lock, ChevronRight, Loader2, HelpCircle, CheckCircle2 } from 'lucide-react'
import api from '../api'
import { Link } from 'react-router-dom'

export default function VendorLogin({ onLogin }) {
  const [step, setStep] = useState(1)
  const [aadhaar, setAadhaar] = useState(localStorage.getItem('rg_vendor_pref') || '')
  const [otp, setOtp] = useState('')
  const [remember, setRemember] = useState(!!localStorage.getItem('rg_vendor_pref'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/customer/send-otp', { aadhaar_number: aadhaar })
      setMaskedPhone(res.data.masked_phone)
      if (remember) localStorage.setItem('rg_vendor_pref', aadhaar)
      else localStorage.removeItem('rg_vendor_pref')
      setStep(2)
    } catch (err) {
      setError('Vendor node synchronization failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/customer/verify-otp', { 
        aadhaar_number: aadhaar,
        otp: otp,
        role: 'vendor'
      })
      if (res.data.token) {
        onLogin(res.data)
      } else {
        setError('Verification hash mismatch')
      }
    } catch (err) {
      setError('Secure node offline')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center p-6 font-['Inter']">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl shadow-emerald-100/50 p-12 border border-emerald-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Vendor Portal</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Business Management Node</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOTP} 
              className="space-y-6"
            >
              <div className="relative">
                <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  type="text" maxLength={12} placeholder="Aadhaar ID" required
                  className="w-full pl-16 pr-6 py-6 bg-gray-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white rounded-2xl outline-none transition-all font-black text-base"
                  value={aadhaar} onChange={(e) => setAadhaar(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 ml-2 group cursor-pointer" onClick={() => setRemember(!remember)}>
                 <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${remember ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 group-hover:border-emerald-200'}`}>
                    {remember && <CheckCircle2 className="w-4 h-4 text-white" />}
                 </div>
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Remember this device</span>
              </div>

              <button 
                type="submit" disabled={loading || aadhaar.length !== 12}
                className="w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-100"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Request Access'}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOTP} 
              className="space-y-6"
            >
              <div className="text-center p-6 bg-emerald-50 rounded-3xl mb-8 border border-emerald-100/50">
                <p className="text-xs text-emerald-700 font-bold mb-1">Operator authenticated at:</p>
                <p className="text-sm font-black text-gray-900">{maskedPhone}</p>
              </div>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  type="text" maxLength={6} placeholder="OTP HASH" required
                  className="w-full pl-16 pr-6 py-6 bg-gray-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white rounded-2xl outline-none transition-all font-black text-lg tracking-[0.6em] text-center"
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button 
                type="submit" disabled={loading || otp.length !== 6}
                className="w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-2xl shadow-emerald-100"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Finalize Session'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-10 border-t border-gray-100 space-y-6">
           <div className="flex justify-between items-center px-2">
              <Link to="/login/customer" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600">Shopper login</Link>
              <Link to="/login/admin" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500">System admin</Link>
           </div>
           
           <div className="bg-emerald-50/50 p-6 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] p-3 opacity-10 rotate-12 text-emerald-500"><Store size={60} /></div>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Vendor Demo Access</p>
              <p className="text-xs font-bold text-gray-700">Aadhaar: <span className="font-black text-emerald-600">999999999999</span></p>
           </div>
        </div>
      </motion.div>
    </div>
  )
}
