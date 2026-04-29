// client/src/pages/Shop.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.products.getAll();
        setProducts(data || []);
      } catch (err) {
        console.error(err);
        showToast('Sync Failure: Collections Unavailable.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []); // REMOVED [showToast] TO PREVENT INFINITE LOOP

  const filtered = (products || []).filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">The Collection</h1>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest">Handpicked Essentials, Secured for Life.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-16 pl-14 pr-8 bg-white rounded-2xl border border-gray-100 focus:border-indigo-600 transition-all outline-none w-full md:w-80 font-bold"
            />
          </div>
          <button className="h-16 w-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
            <SlidersHorizontal size={24} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/6] bg-gray-50 rounded-[32px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
