import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, Heart, Search, Zap } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout, isAdmin } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white header-shadow px-10 h-[90px] flex items-center justify-between">
      {/* ── LOGO & NAV ── */}
      <div className="flex items-center gap-20 h-full">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#f00078] rounded-xl flex items-center justify-center shadow-lg shadow-pink-100">
             <Zap className="w-7 h-7 text-white fill-current" />
          </div>
          <span className="text-3xl font-[900] text-gray-900 tracking-tighter uppercase italic">Vibe Market</span>
        </Link>

        <div className="hidden xl:flex items-center h-full">
          {['Men', 'Women', 'Kids', 'Home', 'Beauty'].map(item => (
            <Link 
              key={item} 
              to="/" 
              className="px-6 h-full flex items-center text-[16px] font-extrabold uppercase tracking-widest text-gray-800 border-b-4 border-transparent hover:border-[#f00078] transition-all"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      {/* ── SEARCH ── */}
      <div className="flex-1 max-w-3xl px-12 group">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for premium vibes..." 
            className="w-full bg-[#f5f5f6] border-2 border-transparent focus:bg-white focus:border-[#f00078]/20 rounded-xl py-4 pl-16 pr-8 outline-none text-base text-gray-800 font-medium transition-all"
          />
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-10 h-full">
        <div className="relative h-full flex flex-col items-center justify-center group cursor-pointer border-b-4 border-transparent hover:border-[#f00078] px-2">
          <User className="w-7 h-7 text-gray-800" />
          <span className="text-[13px] font-black text-gray-900 mt-1 uppercase tracking-tight">Account</span>
          
          <div className="absolute top-[90px] right-0 w-72 bg-white shadow-2xl p-8 hidden group-hover:block border border-gray-100 animate-in fade-in slide-in-from-top-2">
             <div className="mb-8">
                <p className="text-[18px] font-black text-gray-900 mb-2">Welcome</p>
                <p className="text-[13px] text-gray-500 font-medium">To access account and manage orders</p>
             </div>
             {user ? (
               <div className="space-y-5">
                  <Link to="/profile" className="block text-base font-bold text-gray-700 hover:text-[#f00078]">My Orders</Link>
                  <button onClick={logout} className="block text-base font-bold text-gray-700 hover:text-[#f00078]">Logout</button>
               </div>
             ) : (
               <Link to="/login" className="block w-full py-4 bg-[#f00078] text-white text-center font-black text-sm uppercase tracking-widest rounded shadow-lg shadow-pink-100">Login / Signup</Link>
             )}
          </div>
        </div>

        <Link to="/" className="flex flex-col items-center justify-center h-full px-2 border-b-4 border-transparent hover:border-[#f00078] transition-all">
          <Heart className="w-7 h-7 text-gray-800" />
          <span className="text-[13px] font-black text-gray-900 mt-1 uppercase tracking-tight">Wishlist</span>
        </Link>

        <Link to="/cart" className="relative flex flex-col items-center justify-center h-full px-2 border-b-4 border-transparent hover:border-[#f00078] transition-all">
          <ShoppingBag className="w-7 h-7 text-gray-800" />
          <span className="text-[13px] font-black text-gray-900 mt-1 uppercase tracking-tight">Bag</span>
          {cart.length > 0 && (
            <span className="absolute top-5 right-1 bg-[#f00078] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
              {cart.length}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
