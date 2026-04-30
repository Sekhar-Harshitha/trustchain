import { Link, useNavigate } from 'react-router-dom'
import { Shield, User as UserIcon, LogOut, LayoutDashboard, Store, Settings, PieChart, Activity } from 'lucide-react'

export default function Navbar({ auth, onLogout }) {
  const { user, role } = auth
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  // --- DYNAMIC NAV LINKS BASED ON ROLE ---
  const renderLinks = () => {
    if (role === 'customer') {
      return (
        <>
          <Link to="/" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Home</Link>
          <Link to="/shop" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Shop</Link>
          <Link to="/customer/dashboard" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">My Returns</Link>
        </>
      )
    }
    if (role === 'vendor') {
      return (
        <>
          <Link to="/vendor/dashboard" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/vendor/dashboard" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Returns Queue</Link>
          <Link to="/vendor/dashboard" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Analytics</Link>
        </>
      )
    }
    if (role === 'admin') {
      return (
        <>
          <Link to="/admin/dashboard" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#EF4444] transition-colors">Overview</Link>
          <Link to="/admin/dashboard" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#EF4444] transition-colors">Users</Link>
          <Link to="/admin/dashboard" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#EF4444] transition-colors">System Logs</Link>
        </>
      )
    }
    return null
  }

  const renderBadge = () => {
    if (role === 'admin') return <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-red-500/20">Admin</span>
    if (role === 'vendor') return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-emerald-500/20">Vendor</span>
    if (role === 'customer') return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-blue-500/20">Customer</span>
    return null
  }

  return (
    <nav className={`h-[80px] flex items-center px-10 border-b sticky top-0 z-50 transition-colors duration-500 ${role === 'admin' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-900 border-gray-800 text-white'}`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${role === 'admin' ? 'bg-[#EF4444]' : 'bg-indigo-600'}`}>
            {role === 'admin' ? <Shield className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
          </div>
          <span className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
            ReturnGuard <span className={role === 'admin' ? 'text-red-500' : 'text-indigo-400'}>{role === 'admin' ? 'ADMIN' : 'AI'}</span>
          </span>
        </Link>

        {/* LINKS */}
        <div className="flex items-center gap-8">
          {renderLinks()}
          
          {user ? (
            <div className={`flex items-center gap-6 pl-8 border-l transition-colors ${role === 'admin' ? 'border-slate-800' : 'border-gray-800'}`}>
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${role === 'admin' ? 'bg-slate-800' : 'bg-gray-800'}`}>
                     {role === 'admin' ? <Shield className="w-4 h-4 text-red-500" /> : role === 'vendor' ? <Store className="w-4 h-4 text-emerald-400" /> : <UserIcon className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-white leading-none mb-1">{user.name}</span>
                     {renderBadge()}
                  </div>
               </div>
               <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-all"
               >
                 <LogOut className="w-5 h-5" />
               </button>
            </div>
          ) : (
             <div className="flex items-center gap-4">
                <Link to="/login/customer" className="text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all">Sign In</Link>
                <Link to="/login/admin" className="p-2 bg-slate-800 text-gray-400 rounded-lg hover:text-white transition-all">
                   <Shield className="w-4 h-4" />
                </Link>
             </div>
          )}
        </div>
      </div>
    </nav>
  )
}
