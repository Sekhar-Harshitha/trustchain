import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';
import { Package, User as UserIcon, LogOut, ChevronRight, ShoppingBag, MapPin, CreditCard, Shield } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.orders.getAll();
        const userOrders = (response || []).filter(o => o.user_id === (user.id || user.email));
        setOrders(userOrders);
      } catch (err) {
        console.warn('[PROFILE] History sync node unreachable. Showing local state.', err);
        // Fallback to empty array if call fails, but don't show red toast to user
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user, showToast]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f6] pt-[120px] pb-24">
      <div className="container mx-auto px-10">
        
        {/* ── BREADCRUMBS ── */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-10">
          <span>Home</span> <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-bold">My Account</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ── LEFT: SIDEBAR ── */}
          <div className="lg:col-span-3 space-y-px">
            <div className="bg-white p-6 border-b border-gray-100">
               <p className="text-[12px] font-bold text-gray-800 uppercase tracking-widest">Account</p>
               <p className="text-[14px] text-gray-500 mt-1">{user.name}</p>
            </div>
            
            <div className="bg-white">
              {[
                { icon: <ShoppingBag />, label: "Orders", active: true },
                { icon: <UserIcon />, label: "Profile" },
                { icon: <MapPin />, label: "Addresses" },
                { icon: <CreditCard />, label: "Payments" },
                { icon: <Shield />, label: "Security" }
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${item.active ? 'text-[#f00078] border-l-4 border-l-[#f00078]' : 'text-gray-600'}`}>
                   <div className="flex items-center gap-4">
                      <span className="w-5 h-5">{item.icon}</span>
                      <span className="text-sm font-bold">{item.label}</span>
                   </div>
                   <ChevronRight className="w-4 h-4" />
                </div>
              ))}
              <button 
                onClick={logout}
                className="w-full flex items-center gap-4 p-5 text-gray-600 hover:text-red-500 hover:bg-gray-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-bold">Logout</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT: ORDERS ── */}
          <div className="lg:col-span-9 bg-white p-10 min-h-[600px]">
             <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                <p className="text-xs text-gray-400">Total {orders.length} orders found</p>
             </div>

             {loading ? (
               <div className="py-20 text-center text-sm text-gray-400">Syncing with history node...</div>
             ) : orders.length === 0 ? (
               <div className="py-20 text-center">
                  <Package className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                  <p className="text-sm text-gray-400">You haven't placed any orders yet.</p>
               </div>
             ) : (
               <div className="space-y-8">
                 {orders.map((order) => (
                   <div key={order.id} className="border border-gray-100 rounded overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                         <div className="flex gap-10">
                            <span>Order ID: {order.id.substring(0, 8)}</span>
                            <span>Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                         </div>
                         <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded">{order.status}</span>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        {order.order_items?.map((item, idx) => (
                          <div key={idx} className="flex gap-6 items-center">
                             <div className="w-16 h-20 bg-gray-50 shrink-0">
                                <img src={item.products?.image_url} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{item.products?.name}</p>
                                <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">${item.products?.price}</p>
                             </div>
                          </div>
                        ))}
                      </div>

                      <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center">
                         <p className="text-sm font-bold text-gray-800">Total: ${order.total}</p>
                         <button className="text-[11px] font-bold text-[#f00078] uppercase tracking-widest flex items-center gap-2">
                           Track Order <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
