import { useState, useEffect } from 'react'
import api from '../api'
import { 
  Package, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Award,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CustomerDashboard({ user: initialUser }) {
  const [user, setUser] = useState(initialUser)
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [form, setForm] = useState({
    product_name: '',
    order_value: '',
    return_reason: '',
    damage_image_url: ''
  })

  const fetchData = async () => {
    try {
      const [userRes, returnsRes] = await Promise.all([
        api.get(`/api/users/${user.id}`),
        api.get(`/api/returns/user/${user.id}`)
      ])
      setUser(userRes.data)
      setReturns(returnsRes.data)
    } catch (err) {
      console.error('Failed to fetch node data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setLastResult(null)
    try {
      const res = await api.post('/api/returns/submit', {
        ...form,
        user_id: user.id,
        order_value: parseFloat(form.order_value)
      })
      setLastResult(res.data)
      setForm({ product_name: '', order_value: '', return_reason: '', damage_image_url: '' })
      fetchData()
    } catch (err) {
      alert('Return submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const getTier = (score) => {
    if (score > 90) return { label: 'Platinum (VIP)', color: 'text-purple-600 bg-purple-50 border-purple-100' }
    if (score > 75) return { label: 'Gold', color: 'text-amber-600 bg-amber-50 border-amber-100' }
    if (score > 50) return { label: 'Silver', color: 'text-gray-600 bg-gray-50 border-gray-100' }
    return { label: 'Bronze', color: 'text-orange-600 bg-orange-50 border-orange-100' }
  }

  const tier = getTier(user?.trust_score || 0)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ((user?.trust_score || 0) / 100) * circumference

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Syncing Customer Node...</p>
       </div>
    </div>
  )

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 font-['Inter']">
      
      {/* ── WELCOME BANNER ── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter mb-2">Hello, {user?.name}!</h1>
            <p className="text-blue-100 font-medium tracking-wide">Your Customer Integrity Status: <span className="font-black text-white">{user?.trust_score?.toFixed(0)}/100</span></p>
         </div>
         <div className="absolute right-[-5%] top-[-10%] opacity-10 rotate-12"><Package size={240} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── LEFT: CIRCULAR PROGRESS ── */}
        <div className="lg:col-span-4 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-blue-50 flex flex-col items-center text-center">
           <div className="relative flex items-center justify-center mb-10">
              <svg className="w-48 h-48 transform -rotate-90">
                 <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                 <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-blue-600 transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-black text-gray-900 tracking-tighter">{user?.trust_score?.toFixed(0)}</span>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trust Index</span>
              </div>
           </div>
           <div className={`px-8 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest mb-8 ${tier.color}`}>{tier.label}</div>
           {user?.trust_score < 50 && (
             <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex gap-4 text-left">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-[11px] text-red-600 font-bold leading-relaxed uppercase tracking-tight">Your account is under review. Please contact support.</p>
             </div>
           )}
        </div>

        {/* ── RIGHT: SUBMIT ── */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-blue-50">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4"><RotateCcw className="w-6 h-6 text-blue-600" />Submit New Return</h2>
                 <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:scale-110 transition-all"><AlertCircle size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <input 
                    type="text" required placeholder="Product Name" 
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-sm"
                    value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})}
                 />
                 <input 
                    type="number" required placeholder="Order Value (₹)" 
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-sm"
                    value={form.order_value} onChange={e => setForm({...form, order_value: e.target.value})}
                 />
                 <textarea 
                    required placeholder="Return Reason" 
                    className="md:col-span-2 w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-medium text-sm h-32 resize-none"
                    value={form.return_reason} onChange={e => setForm({...form, return_reason: e.target.value})}
                 />
                 <button className="md:col-span-2 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                    {submitting ? 'Analyzing Sequence...' : 'Submit to ReturnGuard AI'}
                 </button>
              </form>
           </div>
        </div>
      </div>

      {/* ── RECENT RETURNS ── */}
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-blue-50">
         <h3 className="text-xl font-black text-gray-900 tracking-tight mb-10">Recent Transactions</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {returns.map(r => (
               <div key={r.id} className="p-8 border border-gray-100 rounded-[2.5rem] hover:border-blue-200 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-50 transition-colors"><RotateCcw size={24} /></div>
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${r.status === 'auto_approved' ? 'bg-emerald-50 text-emerald-500' : r.status === 'flagged_fraud' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>{r.status.replace('_', ' ')}</span>
                  </div>
                  <h4 className="text-lg font-black text-gray-900 mb-2">{r.product_name}</h4>
                  <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Score: {r.ai_fraud_score?.toFixed(0)}%</span>
                     <span className="text-xs font-bold text-gray-600">₹{r.order_value}</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}
