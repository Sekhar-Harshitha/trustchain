// client/src/components/ProductCard.jsx
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white border border-gray-100 rounded-[32px] p-6 shadow-xl shadow-gray-100/50 hover:shadow-2xl transition-all"
    >
      <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden mb-6 bg-gray-50">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-gray-100 shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      <div className="space-y-2 px-2">
        <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">{product.name}</h3>
        
        <div className="flex items-center justify-between pt-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Price</span>
            <span className="text-xl font-black text-gray-900 tracking-tighter">${product.price}</span>
          </div>
          <button 
            onClick={() => {
              addToCart(product);
              showToast(`${product.name} added to cart.`);
            }}
            className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-lg shadow-black/10 active:scale-90"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
