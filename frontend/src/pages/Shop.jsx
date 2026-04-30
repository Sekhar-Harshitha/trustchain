import { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingCart, ShieldCheck, Zap, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Shop({ user }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setResult(null);
    try {
      const res = await api.post('/checkout', {
        items: cart,
        userId: user?.id,
        amount: cart.reduce((acc, i) => acc + i.price, 0)
      });
      setResult(res.data.data);
      setCart([]);
    } catch (err) {
      alert('Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 className="w-12 h-12 text-[#7C4DFF] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Boutique <span className="text-[#7C4DFF]">Trust</span></h1>
            <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest font-bold">Secure AI-Powered Shopping</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-400" />
              {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#7C4DFF] text-[10px] font-black px-1.5 py-0.5 rounded-full">{cart.length}</span>}
            </div>
          </div>
        </header>

        {result ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-12 rounded-[3rem] text-center border ${result.status === 'FRAUD' ? 'border-red-500 bg-red-500/10' : 'border-emerald-500 bg-emerald-500/10'}`}
          >
            {result.status === 'FRAUD' ? (
              <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            ) : (
              <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            )}
            <h2 className="text-4xl font-black uppercase mb-4">{result.status === 'FRAUD' ? 'Transaction Flagged' : 'Order Successful'}</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">{result.message}</p>
            
            <div className="bg-black/40 p-8 rounded-3xl inline-block text-left mb-10 border border-white/10">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Fraud Analysis Report</p>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-white">{result.fraudScore}%</span>
                <div className="h-2 w-32 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${result.status === 'FRAUD' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${result.fraudScore}%` }}></div>
                </div>
              </div>
            </div>

            <div>
              <button 
                onClick={() => setResult(null)}
                className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
              >
                Back to Shop
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-[#7C4DFF]/50 transition-all">
                  <div className="h-64 overflow-hidden relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black">₹{p.price}</div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-lg font-black uppercase mb-2">{p.name}</h3>
                    <p className="text-gray-500 text-xs mb-6 leading-relaxed">{p.description}</p>
                    <button 
                      onClick={() => addToCart(p)}
                      className="w-full py-4 bg-[#7C4DFF]/10 text-[#7C4DFF] border border-[#7C4DFF]/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#7C4DFF] hover:text-white transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 sticky top-32">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3"><ShoppingCart size={20} className="text-[#7C4DFF]" /> Your Cart</h3>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-12 italic">Your cart is empty.</p>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div>
                          <p className="text-sm font-black uppercase">{item.name}</p>
                          <p className="text-[10px] text-gray-500">Qty: 1</p>
                        </div>
                        <p className="text-sm font-bold text-white">₹{item.price}</p>
                      </div>
                    ))}
                    <div className="pt-4">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-xs font-black uppercase text-gray-400">Total</span>
                        <span className="text-2xl font-black text-[#7C4DFF]">₹{cart.reduce((acc, i) => acc + i.price, 0)}</span>
                      </div>
                      <button 
                        onClick={handleCheckout}
                        disabled={checkingOut}
                        className="w-full py-5 bg-[#7C4DFF] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#651FFF] shadow-xl shadow-[#7C4DFF]/20 transition-all flex items-center justify-center gap-3"
                      >
                        {checkingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Secure Checkout'}
                        {!checkingOut && <Zap size={16} />}
                      </button>
                      <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                        <ShieldCheck size={12} />
                        Identity Verified Transaction
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
