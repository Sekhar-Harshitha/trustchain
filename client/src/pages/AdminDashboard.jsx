import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Activity, 
  Cpu, 
  Fingerprint,
  Link2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { getAdminStats, getAdminReturns, getChain, validateChain } from '../utils/api';

const AdminDashboard = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [returns, setReturns] = useState([]);
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    if (authed) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [authed]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, r, c] = await Promise.all([
        getAdminStats(),
        getAdminReturns(),
        getChain()
      ]);
      setStats(s);
      setReturns(r);
      setChain(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    const res = await validateChain();
    setValidationResult(res);
    setTimeout(() => setValidationResult(null), 5000);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <Shield className="w-16 h-16 text-teal mb-6" />
        <h1 className="text-white text-3xl font-black mb-8 tracking-tighter">TrustChain Admin Portal</h1>
        <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Master Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal mb-6"
            placeholder="••••••••"
          />
          <button
            onClick={() => password === 'admin123' ? setAuthed(true) : alert('Wrong Password')}
            className="w-full py-4 bg-teal text-slate-900 font-black rounded-xl hover:bg-teal/90 transition-all"
          >
            Authenticate Node
          </button>
        </div>
      </div>
    );
  }

  const chartData = returns.slice(0, 7).reverse().map(r => ({
    name: new Date(r.timestamp).toLocaleDateString(),
    risk: r.risk_level === 'CRITICAL' ? 100 : r.risk_level === 'HIGH' ? 75 : r.risk_level === 'MEDIUM' ? 50 : 25
  }));

  const pieData = stats ? [
    { name: 'Approved', value: stats.approved },
    { name: 'Under Review', value: stats.under_review },
    { name: 'Rejected', value: stats.rejected }
  ] : [];

  const COLORS = ['#00E676', '#FFB300', '#FF5252'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-text-primary tracking-tighter">System Overview</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" /> Live Blockchain Monitor
              </p>
            </div>
          </div>
          <button onClick={fetchData} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">
            <RefreshCw className={`w-6 h-6 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Orders', value: stats?.total_orders, icon: Database, color: 'text-accent' },
            { label: 'Total Returns', value: stats?.total_returns, icon: BarChart3, color: 'text-teal' },
            { label: 'Fraud Flags', value: stats?.fraud_flags, icon: AlertTriangle, color: 'text-danger' },
            { label: 'Chain Integrity', value: stats?.chain_valid ? 'SECURE' : 'TAMPERED', icon: Fingerprint, color: stats?.chain_valid ? 'text-success' : 'text-danger' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 bg-slate-50 rounded-lg ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-text-primary">{s.value || 0}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" /> Recent Risk Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Bar dataKey="risk" fill="#7C4DFF" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-teal" /> Decision Mix
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-black text-text-primary">Recent Returns Activity</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full">LIVE AI SYNC</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">User</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Risk</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Score</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">AI</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Decision</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {returns.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-text-primary text-sm">XXXX...{r.aadhaar.slice(-4)}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.order_id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 rounded text-[10px] font-black ${
                        r.risk_level === 'CRITICAL' ? 'bg-danger text-white' : 
                        r.risk_level === 'HIGH' ? 'bg-danger/20 text-danger' : 
                        'bg-success/20 text-success'
                      }`}>
                        {r.risk_level}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-sm">{r.trust_score}</td>
                    <td className="px-8 py-6">
                      {r.ai_powered ? (
                        <div className="flex items-center gap-1 text-accent">
                          <Cpu className="w-3 h-3" />
                          <span className="text-[10px] font-black">AI</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300">HEU</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`font-bold text-xs ${
                        r.decision === 'APPROVED' ? 'text-success' : 
                        r.decision === 'REJECTED' ? 'text-danger' : 'text-warning'
                      }`}>
                        {r.decision}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-slate-400">
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Blockchain Viewer */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-text-primary">Ledger Explorer</h3>
            <button 
              onClick={handleValidate}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
            >
              Verify Entire Chain
            </button>
          </div>
          
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-2xl mb-4 font-bold text-sm ${validationResult.valid ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}
              >
                {validationResult.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chain.slice().reverse().map((block, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12 group-hover:bg-accent/5 transition-colors" />
                <div className="flex items-center justify-between mb-4 relative">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-accent" />
                    <span className="text-xs font-black text-text-primary">BLOCK #{block.index}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{block.hash.slice(0, 16)}</span>
                </div>
                <div className="space-y-2 relative">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(block.timestamp).toLocaleString()}</p>
                   <div className="pt-2 border-t border-slate-50">
                      {typeof block.data === 'string' ? (
                        <p className="text-xs font-bold text-text-primary">{block.data}</p>
                      ) : (
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-text-primary truncate mr-2">{block.data.reason}</span>
                           <span className="text-[10px] font-black text-danger">{block.data.risk_level}</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
