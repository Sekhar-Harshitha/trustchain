import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Smartphone, Lock, ChevronRight, Loader2, User, HelpCircle, PhoneCall } from 'lucide-react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function CustomerLogin({ onLogin }) {
  const [step, setStep] = useState(1)
  const [aadhaar, setAadhaar] = useState('')
  const [phone, setPhone] = useState('') 
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const navigate = useNavigate()

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/customer/send-otp', { 
        aadhaar_number: aadhaar,
        phone_number: phone || null 
      })
      setMaskedPhone(res.data.data.masked_phone)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Identity sync failed')
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
        role: 'customer'
      })
      if (res.data.data.token) {
        onLogin(res.data.data)
        navigate('/shop')
      } else {
        setError('Invalid OTP sequence')
      }
    } catch (err) {
      setError('Verification node error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-50/30 flex items-center justify-center p-6 font-['Inter']">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 p-12 border border-blue-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Welcome Back</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Customer Identity Node</p>
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
              <div className="space-y-4">
                 <div className="relative">
                   <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                   <input 
                     type="text" maxLength={12} placeholder="Aadhaar ID (12-digit)" required
                     className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                     value={aadhaar} onChange={(e) => setAadhaar(e.target.value)}
                   />
                 </div>
                 <div className="relative">
                   <PhoneCall className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                   <input 
                     type="text" maxLength={10} placeholder="Custom Phone (Demo Optional)"
                     className="w-full pl-14 pr-6 py-5 bg-indigo-50/30 border-2 border-dashed border-indigo-100 focus:border-indigo-200 focus:bg-white rounded-2xl outline-none transition-all font-black text-sm text-indigo-600 placeholder:text-indigo-300"
                     value={phone} onChange={(e) => setPhone(e.target.value)}
                   />
                 </div>
              </div>
              
              <button 
                type="submit" disabled={loading || aadhaar.length !== 12}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Real-Time OTP'}
                {!loading && <ChevronRight className="w-4 h-4" />}
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
              <div className="text-center p-4 bg-blue-50 rounded-2xl mb-6 border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-tight">OTP DISPATCHED TO</p>
                <p className="text-sm font-black text-gray-900 tracking-widest mt-1">{maskedPhone}</p>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  type="text" maxLength={6} placeholder="ENTER CODE" required
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-black text-sm tracking-[0.5em] text-center"
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button 
                type="submit" disabled={loading || otp.length !== 6}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalize Authentication'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && <p className="mt-6 text-[10px] text-red-500 font-black text-center uppercase tracking-widest animate-shake">{error}</p>}

        <div className="mt-10 pt-10 border-t border-gray-100 space-y-6">
           <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10"><HelpCircle size={40} className="text-indigo-600" /></div>
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Live Demo Protocol</p>
              <p className="text-[11px] font-medium text-indigo-900 leading-relaxed">
                Enter <span className="font-black">YOUR PHONE NUMBER</span> in the field above to receive a real-time OTP during the presentation.
              </p>
           </div>
           <div className="flex flex-col gap-4">
              <Link to="/login/vendor" className="text-xs font-black text-blue-600 uppercase tracking-widest text-center hover:underline">Vendor Portal Login</Link>
           </div>
        </div>
      </motion.div>
    </div>
  )
}
