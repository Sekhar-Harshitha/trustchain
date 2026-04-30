import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ArrowLeft, RefreshCw, ShieldCheck, ShieldAlert,
  ArrowRight, Clock, Star
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getOrders, getReturns, submitRating } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import ReturnModal from '../components/ReturnModal';

const StatusBadge = ({ status }) => {
  const map = {
    APPROVED:       { cls: 'bg-emerald-100 text-emerald-700', label: 'Approved' },
    'UNDER REVIEW': { cls: 'bg-amber-100 text-amber-700',   label: 'Under Review' },
    REJECTED:       { cls: 'bg-red-100 text-red-700',       label: 'Rejected' },
    DELIVERED:      { cls: 'bg-blue-100 text-blue-700',     label: 'Delivered' },
  };
  const s = map[status] || { cls: 'bg-slate-100 text-slate-600', label: status };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.cls}`}>
      {s.label}
    </span>
  );
};

const VendorRating = ({ returnId, customerId, token, onRated }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleRate = async (r) => {
    setRating(r);
    setLoading(true);
    try {
      await submitRating({ customerId, returnId, rating: r, vendorId: 'vendor_default' }, token);
      setDone(true);
      if (onRated) onRated(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
      <Star className="w-3 h-3 fill-amber-400" /> Rating submitted!
    </div>
  );

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-slate-400 font-bold mr-1">Vendor Rate:</span>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          disabled={loading}
          onClick={() => handleRate(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-all"
        >
          <Star className={`w-4 h-4 ${n <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  );
};

const OrderHistory = () => {
  const { user, token } = useAppContext();
  const [orders, setOrders]           = useState([]);
  const [returns, setReturns]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use user.id as the identifier (e.g. "u_234567890123")
      const userId = user.id;
      const [orderData, returnData] = await Promise.all([
        getOrders(userId, token),
        getReturns(userId, token),
      ]);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setReturns(Array.isArray(returnData) ? returnData : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReturnForOrder = (orderId) =>
    returns.find(r => r.order_id === orderId || r.orderId === orderId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-accent transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Boutique
            </button>
            <h1 className="text-4xl font-black text-text-primary tracking-tight">Order History</h1>
            <p className="text-slate-400 text-sm mt-1">
              Logged in as <span className="font-bold text-text-primary">{user?.name}</span>
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-text-secondary"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[3rem] text-center shadow-sm border border-slate-100">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No orders yet</p>
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
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-slate-100 rounded-2xl">
                        <Package className="w-6 h-6 text-text-secondary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                        <p className="font-black text-text-primary font-mono text-sm">{order.order_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-6 items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                        <p className="text-sm font-bold text-text-secondary">
                          {new Date(order.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-8">
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100"
                      >
                        <span className="text-sm font-bold text-text-primary truncate max-w-[200px]">{item.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-400 font-bold">Qty: {item.quantity}</span>
                          <span className="font-black text-text-primary text-sm">₹{(item.price).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-accent">₹{(order.total || 0).toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {!returnInfo ? (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-text-primary rounded-xl font-bold hover:border-accent hover:text-accent transition-all"
                        >
                          Request Return <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-right">Return Status</p>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider ${
                              returnInfo.decision === 'APPROVED'     ? 'bg-emerald-50 text-emerald-700' :
                              returnInfo.decision === 'REJECTED'     ? 'bg-red-50 text-red-700' :
                                                                       'bg-amber-50 text-amber-700'
                            }`}>
                              {returnInfo.decision === 'APPROVED'
                                ? <ShieldCheck className="w-4 h-4" />
                                : returnInfo.decision === 'REJECTED'
                                  ? <ShieldAlert className="w-4 h-4" />
                                  : <Clock className="w-4 h-4" />
                              }
                              {returnInfo.decision}
                            </div>
                          </div>

                          {/* Fraud Score Badge */}
                          {returnInfo.fraud_probability !== undefined && (
                            <div className="text-[10px] font-bold text-slate-400">
                              Fraud Score:{' '}
                              <span className={
                                returnInfo.fraud_probability > 0.7 ? 'text-red-600' :
                                returnInfo.fraud_probability > 0.4 ? 'text-amber-600' :
                                'text-emerald-600'
                              }>
                                {(returnInfo.fraud_probability * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}

                          {/* Vendor Rating Widget */}
                          <VendorRating
                            returnId={returnInfo.id}
                            customerId={user?.id}
                            token={token}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50">
            <ReturnModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onSuccess={() => {
                setSelectedOrder(null);
                fetchData();
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderHistory;
