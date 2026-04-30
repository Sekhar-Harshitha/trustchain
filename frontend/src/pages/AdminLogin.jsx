import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Mail, Loader2, AlertTriangle, ChevronRight } from 'lucide-react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('admin@returnguard.ai')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/admin/login', { email, password })
      onLogin(res.data.data)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'TERMINAL ACCESS DENIED')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-mono relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-red-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-12 border border-slate-800 relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-[0.3em] uppercase">Admin Access</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-3">Nemo Protocol Terminal v9.0.4</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 text-[10px] font-black rounded-xl border border-red-500/20 text-center tracking-widest flex items-center justify-center gap-3">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="email" placeholder="ROOT_USER_EMAIL" required
                className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 focus:border-red-500/50 rounded-xl outline-none transition-all font-black text-xs text-white placeholder:text-slate-800"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="password" placeholder="ENCRYPTED_PASS" required
                className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 focus:border-red-500/50 rounded-xl outline-none transition-all font-black text-xs text-white placeholder:text-slate-800"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
             <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
             <p className="text-[9px] text-yellow-500/70 font-bold uppercase tracking-widest leading-relaxed italic">
               Warning: Authorized personnel only. All access attempts are logged with biometric tracking.
             </p>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Mainframe'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-slate-800 pt-8">
           <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-4">Demo Terminal Key</p>
           <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-500 font-mono text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>USER: <span className="text-slate-300">admin@returnguard.ai</span></div>
              <div>PASS: <span className="text-slate-300">admin123</span></div>
           </div>
        </div>
      </motion.div>

      {/* Footer Nodes */}
      <div className="fixed bottom-8 left-8 flex items-center gap-4 text-slate-800">
         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
         <span className="text-[10px] font-black uppercase tracking-widest">Mainnet integral</span>
      </div>
    </div>
  )
}
