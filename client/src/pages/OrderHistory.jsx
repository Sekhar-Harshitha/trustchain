import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, Clock, ShieldCheck, ShieldAlert, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getOrders, getReturns } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import ReturnModal from '../components/ReturnModal';

const OrderHistory = () => {
  const { user, token } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderData, returnData] = await Promise.all([
        getOrders(user.aadhaar.replace(/\s/g, ''), token),
        getReturns(user.aadhaar.replace(/\s/g, ''), token)
      ]);
      setOrders(orderData);
      setReturns(returnData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getReturnForOrder = (orderId) => {
    return returns.find(r => r.order_id === orderId);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-accent transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Boutique
            </button>
            <h1 className="text-4xl font-black text-text-primary tracking-tight">Order History</h1>
          </div>
          <button 
            onClick={fetchData}
            className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-text-secondary"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[3rem] text-center shadow-sm border border-slate-100">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No orders found yet</p>
            <button 
              onClick={() => navigate('/shop')}
              className="mt-6 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:opacity-90 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const returnInfo = getReturnForOrder(order.order_id);
              return (
                <motion.div 
                  key={order.order_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-slate-100 rounded-2xl">
                        <Package className="w-6 h-6 text-text-secondary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                        <p className="font-black text-text-primary">{order.order_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                        <p className="text-sm font-bold text-text-secondary">
                          {new Date(order.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <span className="px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-black uppercase tracking-widest">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-text-primary truncate max-w-[200px]">{item.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-400 font-bold">Qty: {item.quantity}</span>
                          <span className="font-black text-text-primary text-sm">₹{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-accent">₹{order.total.toLocaleString()}</p>
                    </div>

                    {!returnInfo ? (
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-text-primary rounded-xl font-bold hover:border-accent hover:text-accent transition-all group-hover:shadow-lg"
                      >
                        Request Return <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Return Status</p>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider ${
                          returnInfo.decision === 'APPROVED' ? 'bg-success/10 text-success' :
                          returnInfo.decision === 'REJECTED' ? 'bg-danger/10 text-danger' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {returnInfo.decision === 'APPROVED' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                          {returnInfo.decision}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <ReturnModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            onSuccess={() => {
              setSelectedOrder(null);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderHistory;
