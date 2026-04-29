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
  Cpu
} from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiSensitivity, setAiSensitivity] = useState('Medium')

  const fetchData = async () => {
    try {
      const [usersRes, returnsRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/returns/vendor/2') // Mock returns for stats
      ])
      setUsers(usersRes.data)
      setReturns(returnsRes.data)
    } catch (err) {
      console.error('Master node sync failed', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = {
    totalUsers: users.length,
    totalReturns: returns.length + 42, // Mock historical data
    fraudRate: '12.4%',
    revenueSaved: '₹4,52,000'
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
         <AdminStatCard label="Total Identities" value={stats.totalUsers} icon={<Users />} color="text-blue-500" />
         <AdminStatCard label="Network Returns" value={stats.totalReturns} icon={<RotateCcw />} color="text-amber-500" />
         <AdminStatCard label="Fraud Suppression" value={stats.fraudRate} icon={<Zap />} color="text-red-500" />
         <AdminStatCard label="Capital Protected" value={stats.revenueSaved} icon={<TrendingUp />} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* ── FRAUD DISTRIBUTION (CSS CHARTS) ── */}
         <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem]">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3"><PieChart size={18} className="text-red-500" /> Fraud Distribution</h3>
            <div className="space-y-8">
               <ChartBar label="Wardrobing" value={45} color="bg-red-500" />
               <ChartBar label="Physical Damage" value={30} color="bg-amber-500" />
               <ChartBar label="Fake Receipts" value={15} color="bg-indigo-500" />
               <ChartBar label="INR (Item Not Received)" value={10} color="bg-emerald-500" />
            </div>
            <div className="mt-12 p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50">
               <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed italic">
                 AI Analysis indicates a 12% rise in wardrobing attempts this quarter. Suppression protocols active.
               </p>
            </div>
         </div>

         {/* ── USER MANAGEMENT ── */}
         <div className="lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-[3rem] overflow-hidden">
            <div className="p-10 border-b border-slate-800 flex justify-between items-center">
               <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><Activity size={18} className="text-emerald-500" /> Identity Audit</h3>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                  <input type="text" placeholder="Search Hash..." className="bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-[10px] outline-none focus:border-red-500/50" />
               </div>
            </div>
            <table className="w-full text-left">
               <thead className="bg-slate-950/50 text-[9px] text-slate-500 font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-10 py-6">Identity Hash</th>
                     <th className="px-10 py-6">Role</th>
                     <th className="px-10 py-6 text-center">Integrity</th>
                     <th className="px-10 py-6 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {users.map(u => (
                     <tr key={u.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="px-10 py-8 font-mono text-[11px] text-slate-300">
                           {u.aadhaar_hash ? `HASH_${u.aadhaar_hash.substr(-6)}` : `ROOT_${u.name.substr(0,4)}`}
                        </td>
                        <td className="px-10 py-8">
                           <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : u.role === 'vendor' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                              {u.role}
                           </span>
                        </td>
                        <td className="px-10 py-8 text-center">
                           <span className={`text-[11px] font-black ${u.trust_score < 50 ? 'text-red-500' : 'text-emerald-500'}`}>{u.trust_score?.toFixed(0)}</span>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 bg-slate-800 hover:text-red-500 transition-all rounded-lg"><Edit size={14} /></button>
                              <button className="p-2 bg-slate-800 hover:text-red-500 transition-all rounded-lg"><Trash2 size={14} /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* ── SYSTEM SETTINGS & LOGS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem]">
            <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3"><Settings size={18} className="text-blue-500" /> Protocol Configuration</h3>
            <div className="space-y-8">
               <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">AI Engine Sensitivity</span>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                     {['Low', 'Medium', 'High'].map(s => (
                        <button key={s} onClick={() => setAiSensitivity(s)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${aiSensitivity === s ? 'bg-red-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}>{s}</button>
                     ))}
                  </div>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">OTP Expiry (Seconds)</span>
                  <input type="number" defaultValue={60} className="w-24 bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-[11px] text-right text-red-500 font-black outline-none" />
               </div>
               <div className="flex justify-between items-center pt-4">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Auto-Purge Logs</span>
                  <div className="w-12 h-6 bg-slate-800 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-red-500 rounded-full shadow-lg" /></div>
               </div>
            </div>
         </div>

         <div className="bg-slate-950 border border-slate-800 p-10 rounded-[3rem] font-mono">
            <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3"><Cpu size={18} className="text-purple-500" /> Recent System Logs</h3>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-4 scrollbar-hide">
               <LogItem time="14:52:10" msg="IDENTITY_VERIFIED: HASH_456 Authenticated via Node_Delta" type="success" />
               <LogItem time="14:50:04" msg="FRAUD_FLAGGED: RTN_902 AI_SCORE=82% (WARDROBING_PREDICTED)" type="warning" />
               <LogItem time="14:48:22" msg="ADMIN_LOGIN: ROOT_ADMIN Session Initialized" type="info" />
               <LogItem time="14:45:11" msg="SCHEMA_UPDATE: User_Index optimized for CID_Query" type="info" />
               <LogItem time="14:42:00" msg="SECURITY_ALERT: Multiple OTP attempts for HASH_789" type="error" />
            </div>
         </div>
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

function ChartBar({ label, value, color }) {
  return (
    <div className="space-y-3">
       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-slate-400">{label}</span>
          <span className="text-slate-200">{value}%</span>
       </div>
       <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
          <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} className={`h-full ${color}`} />
       </div>
    </div>
  )
}

function LogItem({ time, msg, type }) {
  const colors = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
    error: 'text-red-500'
  }
  return (
    <div className="flex gap-4 border-b border-slate-900 pb-4">
       <span className="text-[10px] text-slate-700 font-bold">{time}</span>
       <span className={`text-[10px] font-black uppercase tracking-widest ${colors[type]}`}>{msg}</span>
    </div>
  )
}
