// client/src/pages/Checkout.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { api } from '../utils/api';
import { CreditCard, MapPin, Truck, CheckCircle2 } from 'lucide-react';

export default function Checkout() {
  const { cart, user, cartTotal, clearCart } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!user) return navigate('/login');
    setLoading(true);
    try {
      await api.orders.place({
        userId: user.id,
        items: cart,
        total: cartTotal
      });
      setSuccess(true);
      clearCart();
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-success/20 text-success rounded-[32px] flex items-center justify-center"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-4xl font-black text-text-primary">Order Secured.</h2>
        <p className="text-text-secondary font-medium">Redirecting to your orders...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div className="space-y-12">
        <h1 className="text-5xl font-black text-text-primary tracking-tight">Finalize.</h1>
        
        <div className="space-y-8">
          <div className="p-8 bg-white/60 backdrop-blur-md rounded-[40px] border border-white/80 shadow-xl space-y-6">
            <div className="flex items-center gap-4 text-accent">
              <MapPin size={24} /> <h3 className="text-xl font-bold text-text-primary">Shipping Address</h3>
            </div>
            <div className="space-y-2 text-text-secondary font-medium">
              <p>Demo Street 123</p>
              <p>San Francisco, CA 94103</p>
            </div>
          </div>

          <div className="p-8 bg-white/60 backdrop-blur-md rounded-[40px] border border-white/80 shadow-xl space-y-6">
            <div className="flex items-center gap-4 text-accent">
              <CreditCard size={24} /> <h3 className="text-xl font-bold text-text-primary">Payment Method</h3>
            </div>
            <p className="text-text-secondary font-medium italic">Payment handled securely via TrustChain Identity.</p>
          </div>
        </div>
      </div>

      <div className="p-10 bg-gray-900 rounded-[48px] text-white space-y-10 h-fit sticky top-32">
        <h3 className="text-2xl font-bold">Order Summary</h3>
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center opacity-80">
              <p>{item.name} x {item.quantity}</p>
              <p className="font-bold">${(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        
        <div className="pt-10 border-t border-white/10 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-white/60 font-bold uppercase tracking-widest text-xs">Total Amount</span>
            <span className="text-4xl font-black">${cartTotal.toLocaleString()}</span>
          </div>
          <button 
            onClick={handlePlaceOrder}
            disabled={loading || cart.length === 0}
            className="w-full h-20 bg-accent text-white rounded-3xl font-black text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-2xl shadow-accent/20"
          >
            {loading ? "Securing Transaction..." : "Place Order Now"} <Truck size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
