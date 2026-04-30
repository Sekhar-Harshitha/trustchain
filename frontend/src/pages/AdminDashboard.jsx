import { useState, useEffect } from 'react'
import api from '../api'
import { 
  Shield, 
  Users, 
  RotateCcw, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  Settings, 
  Search, 
  Trash2, 
  Edit,
  Loader2,
  PieChart,
  Zap,
  Lock,
  Cpu,
  UserX,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // ALL, FRAUD, SAFE
  const [alerts, setAlerts] = useState([
    { id: 1, msg: "New suspicious transaction from u_234567890123", type: "warning" },
    { id: 2, msg: "System node delta synchronized", type: "info" }
  ])

  const fetchData = async () => {
    try {
      const [usersRes, transRes] = await Promise.all([
        api.get('/users'),
        api.get('/admin/transactions')
      ])
      // Handle the data structure from our new backend
      setUsers(usersRes.data || [])
      setTransactions(transRes.data.data.transactions || [])
    } catch (err) {
      console.error('Master node sync failed', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Simulated live alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert = {
          id: Date.now(),
          msg: `System scan: ${Math.random() > 0.5 ? 'Security breach attempt blocked' : 'New identity verified'}`,
          type: Math.random() > 0.5 ? 'error' : 'info'
        }
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)])
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to block this user and revoke all credentials?')) return;
    try {
      await api.post('/admin/block-user', { userId });
      alert('User blocked successfully');
      fetchData();
    } catch (err) {
      alert('Failed to block user');
    }
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'FRAUD') return t.status === 'FLAGGED';
    if (filter === 'SAFE') return t.status === 'DELIVERED';
    return true;
  })

  const stats = {
    totalUsers: users.length,
    totalTransactions: transactions.length,
    fraudFlags: transactions.filter(t => t.status === 'FLAGGED').length,
    capitalRisk: `₹${transactions.reduce((acc, t) => t.status === 'FLAGGED' ? acc + t.total : acc, 0).toLocaleString()}`
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
       <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Mounting Admin Terminal...</p>
       </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10 space-y-12 font-mono">
      
      {/* ── MASTER STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <AdminStatCard label="Identities" value={stats.totalUsers} icon={<Users />} color="text-blue-500" />
         <AdminStatCard label="Transactions" value={stats.totalTransactions} icon={<Activity />} color="text-indigo-500" />
         <AdminStatCard label="Fraud Flags" value={stats.fraudFlags} icon={<AlertTriangle />} color="text-red-500" />
         <AdminStatCard label="Value at Risk" value={stats.capitalRisk} icon={<TrendingUp />} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* ── LIVE ALERTS ── */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem]">
               <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3"><Zap size={18} className="text-yellow-500" /> Live Threat Feed</h3>
               <div className="space-y-4">
                  <AnimatePresence>
                     {alerts.map(alert => (
                        <motion.div 
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-4 rounded-xl border text-[10px] uppercase font-black tracking-tight ${
                            alert.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                            alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-500'
                          }`}
                        >
                           {alert.msg}
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem]">
               <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3"><Cpu size={18} className="text-purple-500" /> AI Sensitivity</h3>
               <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {['Low', 'Medium', 'High'].map(s => (
                     <button key={s} className={`flex-1 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${s === 'Medium' ? 'bg-red-500 text-white' : 'text-slate-600 hover:text-slate-300'}`}>{s}</button>
                  ))}
               </div>
            </div>
         </div>

         {/* ── TRANSACTION AUDIT ── */}
         <div className="lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-[3rem] overflow-hidden">
            <div className="p-10 border-b border-slate-800 flex justify-between items-center">
               <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><RotateCcw size={18} className="text-indigo-500" /> Transaction Ledger</h3>
               <div className="flex gap-4">
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-[10px] outline-none text-slate-400 font-black uppercase tracking-widest"
                  >
                    <option value="ALL">All Flows</option>
                    <option value="FRAUD">Fraud Flags</option>
                    <option value="SAFE">Safe Cleared</option>
                  </select>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-950/50 text-[9px] text-slate-500 font-black uppercase tracking-widest">
                     <tr>
                        <th className="px-10 py-6">ID</th>
                        <th className="px-10 py-6">User</th>
                        <th className="px-10 py-6 text-center">Score</th>
                        <th className="px-10 py-6 text-center">Status</th>
                        <th className="px-10 py-6 text-right">Value</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-800/20 transition-colors group">
                           <td className="px-10 py-8 font-mono text-[10px] text-slate-400">{t.id.slice(-6).toUpperCase()}</td>
                           <td className="px-10 py-8 font-black text-[11px] text-white">
                              {t.userId || 'GUEST'}
                              <div className="text-[8px] text-slate-600 font-normal">{new Date(t.timestamp).toLocaleString()}</div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <span className={`text-[11px] font-black ${t.fraudScore >= 50 ? 'text-red-500' : 'text-emerald-500'}`}>{t.fraudScore}%</span>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${t.status === 'FLAGGED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                 {t.status}
                              </span>
                           </td>
                           <td className="px-10 py-8 text-right font-black text-white">₹{t.total.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* ── IDENTITY MANAGEMENT ── */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] overflow-hidden">
         <div className="p-10 border-b border-slate-800">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><Users size={18} className="text-blue-500" /> Identity Management</h3>
         </div>
         <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-[9px] text-slate-500 font-black uppercase tracking-widest">
               <tr>
                  <th className="px-10 py-6">Name</th>
                  <th className="px-10 py-6">ID / Aadhaar</th>
                  <th className="px-10 py-6 text-center">Trust</th>
                  <th className="px-10 py-6 text-center">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
               {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition-colors group">
                     <td className="px-10 py-8 font-black text-[11px]">{u.name}</td>
                     <td className="px-10 py-8 font-mono text-[10px] text-slate-400">{u.id}</td>
                     <td className="px-10 py-8 text-center">
                        <div className="flex flex-col items-center gap-1">
                           <span className={`text-[11px] font-black ${u.trustScore < 50 ? 'text-red-500' : 'text-emerald-500'}`}>{u.trustScore}</span>
                           <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${u.trustScore < 50 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${u.trustScore}%` }}></div>
                           </div>
                        </div>
                     </td>
                     <td className="px-10 py-8 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${u.status === 'blocked' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                           {u.status || 'Active'}
                        </span>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-4">
                           {u.status !== 'blocked' && (
                              <button 
                                onClick={() => handleBlockUser(u.id)}
                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl flex items-center gap-2 text-[9px] font-black uppercase"
                              >
                                 <UserX size={14} /> Block
                              </button>
                           )}
                           <button className="p-3 bg-slate-800 text-slate-400 hover:text-white transition-all rounded-xl"><Settings size={14} /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}

function AdminStatCard({ label, value, icon, color }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] flex items-center justify-between group hover:border-red-500/30 transition-all duration-500">
       <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</p>
          <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
       </div>
       <div className={`w-14 h-14 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:border-red-500/20 transition-all ${color}`}>{icon}</div>
    </div>
  )
}
