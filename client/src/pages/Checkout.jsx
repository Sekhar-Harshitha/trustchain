import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ArrowLeft, CreditCard, Smartphone,
  Truck, CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { placeOrder } from '../utils/api';

const Checkout = () => {
  const { cart, cartTotal, token, clearCart } = useAppContext();
  const navigate   = useNavigate();
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [payment, setPayment]     = useState('upi');

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await placeOrder(cart, cartTotal, token);
      setSuccess(true);
      clearCart();
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      alert(err.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </motion.div>
        <h1 className="text-3xl font-black text-text-primary mb-2">Order Confirmed!</h1>
        <p className="text-text-secondary max-w-xs mx-auto">
          Your items have been secured and are being prepared for delivery.
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Blockchain-secured transaction
          </div>
          <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Redirecting to Order History...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Address + Payment */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-black text-text-primary">Delivery Address</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Street Address"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent transition-colors"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-black text-text-primary">Payment Method</h2>
              </div>
              <div className="flex gap-4">
                {[
                  { id: 'upi',  icon: Smartphone, label: 'UPI'  },
                  { id: 'card', icon: CreditCard,  label: 'Card' },
                  { id: 'cod',  icon: Truck,       label: 'COD'  },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      payment === m.id
                        ? 'border-accent bg-accent/5'
                        : 'border-slate-100 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <m.icon className={`w-6 h-6 ${payment === m.id ? 'text-accent' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* AI Fraud Detection Notice */}
            <div className="bg-gradient-to-r from-accent/10 to-teal-500/10 p-5 rounded-2xl border border-accent/20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-text-primary text-sm">AI Fraud Protection Active</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Returns are analysed by our RandomForest ML model using your behavioral profile.
                    The decision engine (Block / Review / Approve) runs automatically on each return request.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <aside>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 sticky top-32">
              <h2 className="text-xl font-black text-text-primary mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex gap-3">
                      <span className="font-black text-accent">{item.quantity}×</span>
                      <span className="text-slate-600 truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-text-primary">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-500 font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-text-primary text-lg">Total</span>
                  <span className="font-black text-accent text-3xl">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || cart.length === 0}
                className="w-full mt-8 py-5 bg-accent text-white rounded-2xl font-black shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? 'Securing Order...' : 'Place Order →'}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Blockchain-Encrypted Transaction
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
