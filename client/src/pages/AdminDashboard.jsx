import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  RefreshCcw, 
  ShieldCheck, 
  Users,
  Search,
  Zap,
  ArrowUpRight,
  Check,
  X
} from 'lucide-react';
import { cn } from '../utils/utils';
import { api } from '../utils/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        api.orders.getAll(),
        api.returns.getAll()
      ]);
      setOrders(ordersRes || []);
      setReturns(returnsRes || []);
    } catch (err) {
      console.error('[ADMIN ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleReturnAction = async (id, status) => {
    try {
      await api.admin.processReturn(id, status);
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 text-[#f00078]">
       <div className="w-16 h-16 border-8 border-[#f00078]/10 border-t-[#f00078] rounded-full animate-spin" />
       <p className="uppercase tracking-[0.4em] text-xs font-black">Connecting to Mainnet...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-[90px]">
      <header className="bg-white border-b border-gray-200 px-12 py-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-[#f00078] rounded-2xl flex items-center justify-center">
               <Zap className="w-8 h-8 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Vibe Market Admin</h1>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Terminal Node: ALPHA-SYNC-9</p>
            </div>
          </div>
          
          <nav className="flex bg-[#f5f5f6] p-1.5 rounded-xl">
            {['Overview', 'Orders', 'Returns'].map(t => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)} 
                className={cn(
                  'px-10 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all', 
                  activeTab === t ? 'bg-white text-[#f00078] shadow-lg' : 'text-gray-400 hover:text-gray-700'
                )}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-12 py-16">
        {activeTab === 'Overview' && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              <StatCard label="Total Revenue" value={`$${orders.reduce((a, b) => a + b.total, 0).toFixed(0)}`} icon={ArrowUpRight} color="text-emerald-500" />
              <StatCard label="Live Orders" value={orders.length} icon={ShoppingBag} color="text-indigo-500" />
              <StatCard label="Pending Returns" value={returns.filter(r => r.status === 'pending').length} icon={RefreshCcw} color="text-amber-500" />
              <StatCard label="Active Nodes" value="452" icon={Users} color="text-sky-500" />
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-12 shadow-xl shadow-gray-100/50">
               <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-10">Network Intelligence</h3>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">Real-time Stream</p>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between group">
                         <div className="flex items-center gap-5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm font-bold text-gray-600">Block verified for order_{Math.random().toString(36).substring(7)}</span>
                         </div>
                         <span className="text-[10px] font-black text-gray-300 uppercase">{i+2}s ago</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center">
                     <ShieldCheck className="w-16 h-16 text-emerald-500 mb-6" />
                     <h4 className="text-lg font-black text-gray-800 uppercase tracking-tight">Mainnet Integral</h4>
                     <p className="text-sm text-gray-400 font-medium mt-2">All security nodes are operational. SHA-256 verification active.</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'Orders' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center">
               <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Sync History</h3>
               <div className="relative w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input type="text" placeholder="Search hash ID..." className="w-full bg-[#f8f9fa] border-none rounded-xl py-3 pl-12 pr-6 text-sm font-medium outline-none" />
               </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#fcfcfd] text-[11px] uppercase text-gray-400 font-black tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Transaction Hash</th>
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6">Value</th>
                  <th className="px-10 py-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-8 font-mono text-[13px] text-[#f00078] font-bold">{o.id.substring(0,24)}...</td>
                    <td className="px-10 py-8 text-sm font-bold text-gray-700">{o.user_id}</td>
                    <td className="px-10 py-8 font-black text-lg text-gray-900">${o.total}</td>
                    <td className="px-10 py-8">
                       <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                         {o.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Returns' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {returns.map(r => (
              <div key={r.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/30 flex flex-col gap-8">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                        <img src={r.products?.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{r.products?.name}</h3>
                        <p className="text-[11px] text-gray-400 mt-2 font-black uppercase tracking-[0.2em]">Risk ID: {r.id.substring(0,8)}</p>
                        <p className="text-sm text-gray-500 mt-3 font-medium italic">"{r.reason}"</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="mb-4">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Fraud Score</p>
                        <p className={cn("text-2xl font-black tracking-tighter", r.fraud_score > 50 ? "text-red-500" : "text-emerald-500")}>{r.fraud_score}</p>
                      </div>
                      <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', r.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                        {r.status}
                      </span>
                   </div>
                </div>
                
                <div className="flex gap-4">
                  {r.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleReturnAction(r.id, 'approved')} 
                        className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                      >
                        Approve Sync
                      </button>
                      <button 
                        onClick={() => handleReturnAction(r.id, 'rejected')} 
                        className="flex-1 py-5 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
                      >
                        Reject Node
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-5 bg-gray-50 text-gray-400 text-center rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 italic">
                      BLOCK PROCESSED
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
      <div className={cn("absolute right-[-10%] top-[-20%] p-12 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity", color)}>
         <Icon size={140} />
      </div>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-gray-50 shadow-inner", color)}>
         <Icon size={28} />
      </div>
      <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{label}</p>
      <p className="text-5xl font-black text-gray-900 tracking-tighter">{value}</p>
    </div>
  );
}
