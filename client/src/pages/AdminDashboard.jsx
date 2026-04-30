import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, BarChart3, Database, AlertTriangle, RefreshCw,
  Activity, Cpu, Fingerprint, Link2, Users, TrendingUp,
  CheckCircle2, XCircle, Clock, Ban, Unlock, PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  getAdminStats, getAdminReturns, getAdminUsers,
  getChain, validateChain, blockUser, unblockUser
} from '../utils/api';

// ─────────────────────────────────────────────────────────────
const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

const RiskBadge = ({ risk }) => {
  const map = {
    HIGH:    'bg-red-100 text-red-700',
    MEDIUM:  'bg-amber-100 text-amber-700',
    LOW:     'bg-emerald-100 text-emerald-700',
    CRITICAL:'bg-red-200 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black ${map[risk] || 'bg-slate-100 text-slate-600'}`}>
      {risk || 'LOW'}
    </span>
  );
};

const DecisionBadge = ({ decision }) => {
  const map = {
    APPROVED:      'text-emerald-600',
    'UNDER REVIEW':'text-amber-600',
    REJECTED:      'text-red-600',
  };
  return (
    <span className={`font-bold text-xs ${map[decision] || 'text-slate-600'}`}>
      {decision || 'UNDER REVIEW'}
    </span>
  );
};

const FraudBar = ({ probability }) => {
  const pct = Math.round((probability || 0) * 100);
  const color = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#22c55e';
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [authed, setAuthed]           = useState(false);
  const [password, setPassword]       = useState('');
  const [stats, setStats]             = useState(null);
  const [returns, setReturns]         = useState([]);
  const [users, setUsers]             = useState([]);
  const [chain, setChain]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [validationResult, setValidationResult] = useState(null);
  const [activeTab, setActiveTab]     = useState('returns');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, u, c] = await Promise.all([
        getAdminStats(),
        getAdminReturns(),
        getAdminUsers(),
        getChain(),
      ]);
      setStats(s);
      setReturns(Array.isArray(r) ? r : []);
      setUsers(Array.isArray(u) ? u : []);
      setChain(Array.isArray(c) ? c : []);
    } catch (err) {
      console.error('[Admin] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      fetchData();
      const iv = setInterval(fetchData, 30000);
      return () => clearInterval(iv);
    }
  }, [authed, fetchData]);

  const handleValidate = async () => {
    const res = await validateChain();
    setValidationResult(res);
    setTimeout(() => setValidationResult(null), 5000);
  };

  const handleBlock = async (userId) => {
    try {
      await blockUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: true } : u));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await unblockUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: false } : u));
    } catch (e) {
      alert(e.message);
    }
  };

  // ── LOGIN SCREEN ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-teal/20 rounded-2xl">
            <Shield className="w-10 h-10 text-teal-400" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-black tracking-tighter">TrustChain</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>
        <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">
            Master Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (password === 'admin123' ? setAuthed(true) : alert('Wrong password'))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400 mb-6 transition-colors"
            placeholder="••••••••"
          />
          <p className="text-slate-500 text-[10px] mb-4 font-bold">Demo password: <span className="text-teal-400 font-mono">admin123</span></p>
          <button
            onClick={() => password === 'admin123' ? setAuthed(true) : alert('Wrong password')}
            className="w-full py-4 bg-teal-500 text-slate-900 font-black rounded-xl hover:bg-teal-400 transition-all shadow-lg"
          >
            Authenticate Node
          </button>
        </div>
      </div>
    );
  }

  // Chart data
  const chartData = returns.slice(0, 8).reverse().map((r, i) => ({
    name: `#${i + 1}`,
    fraud: Math.round((r.fraud_probability || 0) * 100),
  }));

  const pieData = stats ? [
    { name: 'Approved', value: stats.approved || 0 },
    { name: 'Under Review', value: stats.under_review || 0 },
    { name: 'Rejected', value: stats.rejected || 0 },
  ] : [];

  const statCards = [
    { label: 'Total Orders',   value: stats?.total_orders,   icon: Database,     color: 'text-accent bg-accent/10'   },
    { label: 'Total Returns',  value: stats?.total_returns,  icon: BarChart3,    color: 'text-teal-600 bg-teal-50'   },
    { label: 'Fraud Flags',    value: stats?.fraud_flags,    icon: AlertTriangle,color: 'text-red-500 bg-red-50'     },
    { label: 'Blocked Users',  value: stats?.blocked_users,  icon: Ban,          color: 'text-orange-500 bg-orange-50'},
  ];

  const tabs = [
    { id: 'returns', label: 'Returns & Fraud', icon: Activity },
    { id: 'users',   label: 'Users',           icon: Users    },
    { id: 'chain',   label: 'Blockchain',      icon: Link2    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-xl">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-text-primary">TrustChain Admin</span>
            <span className="ml-3 flex-none inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statCards.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-black text-text-primary mt-1">{s.value ?? '—'}</p>
            </motion.div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-base font-black text-text-primary mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" /> Fraud Score by Return
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Fraud %']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="fraud" fill="#7C4DFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-base font-black text-text-primary mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-teal-500" /> Decision Breakdown
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-8 py-5 text-sm font-bold transition-all ${
                  activeTab === t.id
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-slate-500 hover:text-text-primary'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* RETURNS TAB */}
          {activeTab === 'returns' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {['User', 'Order', 'Reason', 'Risk', 'Fraud Score', 'Decision', 'Time'].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {returns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">
                        No returns yet
                      </td>
                    </tr>
                  ) : returns.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-text-primary text-sm font-mono">
                          {(r.aadhaar || r.userId || 'unknown').slice(-8)}
                        </p>
                        <p className={`text-[10px] font-bold ${r.ml_used ? 'text-accent' : 'text-slate-400'}`}>
                          {r.ml_used ? '🤖 ML Model' : '⚙️ Heuristic'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-slate-500">{(r.order_id || '').slice(-8)}</p>
                      </td>
                      <td className="px-6 py-4 max-w-[180px]">
                        <p className="text-xs text-text-primary truncate">{r.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge risk={r.risk_level || r.riskLevel} />
                      </td>
                      <td className="px-6 py-4">
                        <FraudBar probability={r.fraud_probability} />
                      </td>
                      <td className="px-6 py-4">
                        <DecisionBadge decision={r.decision || r.status} />
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {['Name', 'ID', 'Trust Score', 'Returns', 'Fraud Flags', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">
                        No users
                      </td>
                    </tr>
                  ) : users.map((u, i) => (
                    <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${u.blocked ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-text-primary text-sm">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-slate-500">{u.id?.slice(-8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                            u.trustScore > 70 ? 'bg-emerald-500' : u.trustScore > 40 ? 'bg-amber-500' : 'bg-red-500'
                          }`}>
                            {u.trustScore}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-center">{u.returnCount || 0}</td>
                      <td className="px-6 py-4 text-center">
                        {u.fraudFlags > 0
                          ? <span className="text-red-600 font-black">{u.fraudFlags}</span>
                          : <span className="text-slate-400">—</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        {u.blocked
                          ? <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-black">BLOCKED</span>
                          : <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black">ACTIVE</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        {u.blocked ? (
                          <button
                            onClick={() => handleUnblock(u.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all"
                          >
                            <Unlock className="w-3 h-3" /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(u.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all"
                          >
                            <Ban className="w-3 h-3" /> Block
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BLOCKCHAIN TAB */}
          {activeTab === 'chain' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-black text-text-primary">Ledger Explorer</h3>
                <button
                  onClick={handleValidate}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                >
                  <Fingerprint className="inline w-3 h-3 mr-1" /> Verify Chain
                </button>
              </div>

              <AnimatePresence>
                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 rounded-2xl mb-6 font-bold text-sm ${
                      validationResult.valid
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {validationResult.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chain.slice().reverse().map((block, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-accent/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-accent" />
                        <span className="text-xs font-black text-text-primary">BLOCK #{block.index}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {(block.hash || '').slice(0, 12)}...
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                      {new Date(block.timestamp).toLocaleString()}
                    </p>
                    <div className="text-xs font-bold text-text-primary truncate">
                      {typeof block.data === 'string'
                        ? block.data
                        : block.data?.reason || JSON.stringify(block.data)
                      }
                    </div>
                    {typeof block.data === 'object' && block.data?.risk_level && (
                      <RiskBadge risk={block.data.risk_level} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
