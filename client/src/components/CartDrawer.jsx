// client/src/components/CartDrawer.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, cartTotal } = useAppContext();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white/90 backdrop-blur-2xl z-[70] shadow-2xl border-l border-white/50 flex flex-col"
          >
            <div className="p-8 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-accent" size={24} />
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Your Cart</h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-text-secondary hover:text-danger transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-pastel-lavender rounded-[32px] flex items-center justify-center text-accent/40">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-text-secondary font-bold">Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white/50 rounded-2xl border border-white/80 shadow-sm">
                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-xl" />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-text-primary">{item.name}</h4>
                      <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                      <p className="text-accent font-black">${item.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="self-center p-2 text-gray-300 hover:text-danger transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-bold">Total Amount</span>
                  <span className="text-3xl font-black text-text-primary">${cartTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => { navigate('/checkout'); onClose(); }}
                  className="w-full bg-accent text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
                >
                  Proceed to Checkout <ArrowRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
