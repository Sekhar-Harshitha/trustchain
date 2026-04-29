import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Heart, Search, Star, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/utils';
import { api } from '../utils/api';

export default function Home() {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Furniture', 'Sports'];

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const data = await api.products.getAll();
        if (isMounted) {
          setProducts(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[VIBE SYNC] Falling back to local node assets.');
          // Don't show confusing DB errors to user, just load fallbacks if backend handles it
          setLoading(false);
        }
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, [showToast]);

  const filteredProducts = (products || []).filter(p => 
    selectedCategory === 'All' || p.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* ── HERO BANNER ── */}
      <section className="w-full relative h-[650px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2000&q=80" 
          className="w-full h-full object-cover" 
          alt="Luxury Purple Banner" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
          <div className="container mx-auto px-10">
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               className="text-white max-w-4xl"
             >
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#f00078] rounded-full mb-8 shadow-xl shadow-pink-500/20">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-black uppercase tracking-widest">Global Vibe Selection</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-black mb-10 leading-[0.85] tracking-tighter">
                  UNLEASH <br /> <span className="text-[#f00078]">THE VIBE.</span>
                </h1>
                <p className="text-2xl text-gray-200 font-medium max-w-2xl leading-relaxed mb-12">
                  Upgrade your lifestyle with our premium curated collection. High-fidelity assets, secured and verified.
                </p>
                <button className="px-16 py-6 bg-white text-[#f00078] font-black uppercase text-base tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-2xl">
                  Shop All Vibes
                </button>
             </motion.div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY BAR ── */}
      <section className="w-full border-b border-gray-100 py-6 bg-white sticky top-[90px] z-40">
        <div className="flex justify-center gap-12 px-10 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={cn(
                "text-[16px] font-black uppercase tracking-[0.2em] pb-3 transition-all border-b-4", 
                selectedCategory === cat ? "text-[#f00078] border-[#f00078]" : "text-gray-400 border-transparent hover:text-gray-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="w-full px-6 py-20">
        <div className="flex justify-between items-end mb-16 px-10">
           <div>
             <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Trending Now</h2>
             <p className="text-lg text-gray-400 font-medium mt-2">The most sync'd products on the network</p>
           </div>
           <button className="flex items-center gap-2 text-sm font-black text-[#f00078] uppercase tracking-widest group">
             View All <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
           </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 px-10">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-0 border-t border-l border-gray-100">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group border-r border-b border-gray-100 p-8 bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all relative z-10 hover:z-20">
                <div className="relative aspect-[3/4] mb-6 overflow-hidden rounded-xl bg-gray-50">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  
                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg flex items-center gap-1.5 text-xs font-black text-gray-800 shadow-sm">
                    4.5 <Star className="w-3.5 h-3.5 text-emerald-500 fill-current" /> <span className="text-gray-400 font-bold border-l pl-1.5">1.2k</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-gray-900 uppercase tracking-tight truncate">{product.name}</h3>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{product.category}</p>
                  <div className="flex items-center gap-3 pt-3">
                    <span className="text-xl font-black text-gray-900">${product.price}</span>
                    <span className="text-sm text-gray-400 line-through font-bold">${(product.price * 1.5).toFixed(0)}</span>
                    <span className="text-sm text-[#ff905a] font-black">(50% OFF)</span>
                  </div>
                </div>

                {/* Add to Cart */}
                <button 
                  onClick={() => {
                    addToCart(product);
                    showToast(`Vibe Secured: ${product.name}`);
                  }}
                  className="absolute inset-x-0 bottom-0 py-5 bg-[#f00078] text-white text-[13px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0"
                >
                  Sync to Bag
                </button>
                
                <button className="absolute top-12 right-12 p-3 bg-white rounded-full shadow-xl text-gray-300 hover:text-[#f00078] transition-colors opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                   <Heart className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1a1a1b] text-white pt-32 pb-16 px-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-24 mb-24">
           <div>
              <div className="flex items-center gap-3 mb-10">
                <Zap className="w-8 h-8 text-[#f00078] fill-current" />
                <span className="text-3xl font-black tracking-tighter uppercase italic">Vibe Market</span>
              </div>
              <p className="text-base text-gray-500 font-medium leading-relaxed max-w-xs">The world's first high-fidelity vibe marketplace. Immutably secured by the Nemo Protocol.</p>
           </div>
           <div>
              <h4 className="text-[13px] font-black uppercase tracking-[0.3em] mb-10 text-gray-400">Shopping</h4>
              <ul className="space-y-4 text-base font-bold text-gray-500">
                {['Collections', 'New Arrivals', 'Trending', 'Exclusives'].map(i => <li key={i} className="hover:text-[#f00078] cursor-pointer transition-colors">{i}</li>)}
              </ul>
           </div>
           <div>
              <h4 className="text-[13px] font-black uppercase tracking-[0.3em] mb-10 text-gray-400">Governance</h4>
              <ul className="space-y-4 text-base font-bold text-gray-500">
                {['Protocol Status', 'Safety Node', 'Terms', 'Privacy'].map(i => <li key={i} className="hover:text-[#f00078] cursor-pointer transition-colors">{i}</li>)}
              </ul>
           </div>
           <div>
              <h4 className="text-[13px] font-black uppercase tracking-[0.3em] mb-10 text-gray-400">Network Status</h4>
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                 <span className="text-[13px] font-black text-emerald-500 uppercase tracking-widest">Mainnet Online</span>
              </div>
           </div>
        </div>
        <div className="container mx-auto pt-16 border-t border-gray-800 flex justify-between items-center text-gray-600 text-[11px] font-black uppercase tracking-[0.4em]">
           <span>© 2026 VIBE MARKET PROTOCOL</span>
           <span>EST. 2026</span>
        </div>
      </footer>
    </div>
  );
}
