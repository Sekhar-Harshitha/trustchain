import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Filter, Star, Plus, Minus, X, Shield, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getProducts } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import TrustBadge from '../components/TrustBadge';

const ProductCard = ({ product, onAdd }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100"
  >
    <div className="relative aspect-square overflow-hidden bg-slate-50">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
        <span className="text-[10px] font-bold">4.5</span>
      </div>
    </div>
    <div className="p-5">
      <p className="text-[10px] font-bold text-teal uppercase tracking-widest mb-1">{product.category}</p>
      <h3 className="font-bold text-text-primary text-sm line-clamp-1 mb-3">{product.name}</h3>
      <div className="flex items-center justify-between">
        <span className="text-lg font-black text-text-primary">₹{product.price.toLocaleString()}</span>
        <button 
          onClick={() => onAdd(product)}
          className="p-2 bg-accent text-white rounded-xl hover:bg-accent/90 active:scale-90 transition-all shadow-md shadow-accent/20"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  </motion.div>
);

const Shop = () => {
  const { user, cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount } = useAppContext();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts(category === 'All' ? null : category);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/shop')}>
            <Shield className="w-8 h-8 text-accent" />
            <span className="text-xl font-black text-text-primary tracking-tighter">TrustChain</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex bg-slate-100 p-1 rounded-2xl">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${category === c ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-text-primary'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trust Member</span>
                <span className="text-xs font-black text-text-primary">{user?.name}</span>
              </div>
              <TrustBadge score={user?.trust_score || 100} size="sm" />
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
              >
                <ShoppingCart className="w-6 h-6 text-text-primary" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/orders')} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                <Package className="w-6 h-6 text-text-primary" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h2 className="text-4xl font-black text-text-primary tracking-tight">The Trust Boutique</h2>
          <p className="text-text-secondary mt-2">Verified quality, blockchain-secured returns.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Authenticating Products...</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </motion.div>
        )}
      </main>

      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-text-primary">Shopping Cart</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingCart className="w-16 h-16 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <img src={item.image} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-text-primary line-clamp-1">{item.name}</h4>
                        <p className="text-accent font-black text-base mt-1">₹{item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center bg-white rounded-lg border border-slate-200">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-accent"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-accent"><Plus className="w-4 h-4" /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-bold text-danger uppercase tracking-widest">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Subtotal</span>
                    <span className="text-2xl font-black text-text-primary">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
