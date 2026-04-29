// client/src/pages/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, RefreshCcw, ShieldCheck, Clock, Shield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { api } from '../utils/api';
import ReturnModal from '../components/ReturnModal';
import TrustBadge from '../components/TrustBadge';

export default function OrderHistory() {
  const { user, setTrustScoreData, trustScoreData } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [ordersRes, scoreRes] = await Promise.all([
            api.orders.getByUser(user.id),
            api.user.getTrustScore(user.id)
          ]);
          setOrders(ordersRes.data);
          setTrustScoreData(scoreRes.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleReturnSuccess = async () => {
    // Refresh data after return
    const [ordersRes, scoreRes] = await Promise.all([
      api.orders.getByUser(user.id),
      api.user.getTrustScore(user.id)
    ]);
    setOrders(ordersRes.data);
    setTrustScoreData(scoreRes.data);
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 space-y-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-text-primary tracking-tight">Your Orders.</h1>
          <p className="text-text-secondary font-medium">Manage your purchases and returns secured by blockchain.</p>
        </div>
        
        {trustScoreData && (
          <TrustBadge 
            score={trustScoreData.score} 
            label={trustScoreData.label} 
            color={trustScoreData.color} 
          />
        )}
      </header>

      {orders.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-6 bg-white/40 backdrop-blur-md rounded-[48px] border border-white/80 border-dashed">
          <ShoppingBag size={64} className="text-gray-200" />
          <p className="text-text-secondary font-bold">No orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {orders.map(order => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/60 backdrop-blur-md rounded-[40px] border border-white/80 shadow-xl overflow-hidden"
            >
              <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-8 justify-between items-center">
                <div className="flex gap-10">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Order Date</p>
                    <p className="text-sm font-bold text-text-primary">{new Date(order.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Total</p>
                    <p className="text-sm font-black text-accent">${order.total.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-success/10 text-success rounded-full text-[10px] font-black uppercase tracking-widest border border-success/20">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-6 items-center">
                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-2xl" />
                    <div className="flex-1">
                      <h4 className="font-bold text-text-primary text-lg">{item.name}</h4>
                      <p className="text-xs text-text-secondary font-medium">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-black text-text-primary">${item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-gray-50/30 flex justify-end">
                <button 
                  onClick={() => { setSelectedOrder(order); setIsReturnModalOpen(true); }}
                  className="px-8 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-text-primary flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-lg shadow-black/5"
                >
                  <RefreshCcw size={18} /> Initiate Return
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <ReturnModal 
          isOpen={isReturnModalOpen}
          order={selectedOrder}
          onClose={() => setIsReturnModalOpen(false)}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}
