import { useState, useEffect } from 'react'
import api from '../api'
import { 
  Store, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  ChevronRight, 
  Loader2,
  CheckCircle2,
  BarChart3,
  Flag,
  Activity,
  User as UserIcon,
  X,
  Star
} from 'lucide-react'

export default function VendorDashboard({ user }) {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')

  const fetchReturns = async () => {
    try {
      const res = await api.get('/api/returns/vendor/2') // Using techstore id from seed
      setReturns(res.data)
    } catch (err) {
      console.error('Failed to sync vendor history', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReturns()
  }, [])

  const handleSubmitRating = async () => {
    setSubmitting(true)
    try {
      await api.post('/api/ratings/submit', {
        vendor_id: 2,
        user_id: selectedReturn.user_id,
        return_id: selectedReturn.id,
        rating: rating,
        comment: comment
      })
      setSelectedReturn(null)
      setComment('')
      setRating(5)
      fetchReturns()
    } catch (err) {
      alert('Rating submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredReturns = returns.filter(r => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Auto Approved') return r.status === 'auto_approved'
    if (activeFilter === 'Pending') return r.status === 'pending_review'
    if (activeFilter === 'Flagged') return r.status === 'flagged_fraud'
    return true
  })

  const stats = {
    total: returns.length,
    flagged: returns.filter(r => r.ai_fraud_score > 60).length,
    pending: returns.filter(r => r.status === 'pending_review').length,
    avgTrust: returns.length ? 88 : 0 // Mock stat
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Initializing Vendor Node...</p>
       </div>
    </div>
  )

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 font-['Inter']">
      
      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <StatCard label="Total Returns" value={stats.total} icon={<BarChart3 />} color="text-indigo-600" />
         <StatCard label="Flagged by AI" value={stats.flagged} icon={<Flag />} color="text-red-500" />
         <StatCard label="Pending Review" value={stats.pending} icon={<ClockIcon />} color="text-amber-500" />
         <StatCard label="Avg Customer Trust" value={`${stats.avgTrust}%`} icon={<Activity />} color="text-emerald-500" />
      </div>

      {/* ── TABLE SECTION ── */}
      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-emerald-50 overflow-hidden">
         <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
               <Store className="w-6 h-6 text-emerald-500" />
               Returns Queue
            </h2>
            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
               {['All', 'Auto Approved', 'Pending', 'Flagged'].map(f => (
                  <button 
                    key={f} onClick={() => setActiveFilter(f)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {f}
                  </button>
               ))}
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                     <th className="px-10 py-6">Identity</th>
                     <th className="px-10 py-6">Product</th>
                     <th className="px-10 py-6">Value</th>
                     <th className="px-10 py-6 text-center">AI Score</th>
                     <th className="px-10 py-6">Status</th>
                     <th className="px-10 py-6 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredReturns.map(r => (
                     <tr key={r.id} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><UserIcon size={16} /></div>
                              <span className="text-sm font-bold text-gray-900 uppercase tracking-tighter">USER_{r.user_id}</span>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-sm font-black text-gray-900">{r.product_name}</td>
                        <td className="px-10 py-8 text-sm font-bold text-gray-600">₹{r.order_value}</td>
                        <td className="px-10 py-8 text-center">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${r.ai_fraud_score > 60 ? 'bg-red-50 text-red-500 border-red-100' : r.ai_fraud_score > 30 ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                              {r.ai_fraud_score?.toFixed(0)}%
                           </span>
                        </td>
                        <td className="px-10 py-8">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${r.status === 'auto_approved' ? 'text-emerald-500' : r.status === 'flagged_fraud' ? 'text-red-500' : 'text-amber-500'}`}>
                              {r.status.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <button 
                              onClick={() => setSelectedReturn(r)}
                              className="px-6 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-3 ml-auto"
                           >
                              Audit <ChevronRight size={14} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* RATING MODAL */}
      {selectedReturn && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-10">
               <button onClick={() => setSelectedReturn(null)} className="absolute top-8 right-8 p-3 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={20} /></button>
               <div className="p-12 space-y-10">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Audit Transaction: {selectedReturn.id}</h3>
                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4">
                     <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                     <p className="text-sm font-medium text-amber-800 leading-relaxed italic">"{selectedReturn.ai_explanation}"</p>
                  </div>
                  <div className="space-y-6">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate Customer Integrity</label>
                     <div className="flex justify-between gap-4">
                        {[1, 2, 3, 4, 5].map(v => (
                           <button 
                              key={v} onClick={() => setRating(v)}
                              className={`flex-1 py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${rating === v ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl' : 'bg-white border-gray-100 text-gray-300'}`}
                           >
                              <span className="text-2xl">{v === 1 ? '😡' : v === 2 ? '😟' : v === 3 ? '😐' : v === 4 ? '😊' : '😍'}</span>
                              <span className="text-[10px] font-black">{v}</span>
                           </button>
                        ))}
                     </div>
                  </div>
                  <textarea 
                    value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Operator Comments..."
                    className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                  />
                  <button 
                    onClick={handleSubmitRating} disabled={submitting}
                    className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 shadow-xl"
                  >
                     {submitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                     {submitting ? 'Finalizing Audit...' : 'Submit Rating & Close'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl flex items-center justify-between group hover:-translate-y-1 transition-all">
       <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{value}</p>
       </div>
       <div className={`w-14 h-14 bg-gray-50 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>{icon}</div>
    </div>
  )
}

function ClockIcon() { return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
