import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nemo_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      
      // PURGE LEGACY DATA: If any ID is a number or numeric string, clear the cart to prevent "INVALID PRODUCT ID" errors
      const hasLegacyData = parsed.some(item => {
        const id = item.id || item.product_id;
        return !isNaN(id) || typeof id === 'number';
      });

      if (hasLegacyData) {
        console.warn('[CART] Legacy numeric data detected. Purging for UUID compatibility.');
        localStorage.removeItem('nemo_cart');
        return [];
      }

      return parsed;
    } catch (e) {
      console.error('Cart Restore Error:', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nemo_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const productId = product.id; // Expecting UUID from Supabase
      const existing = prev.find(item => item.id === productId);
      
      if (existing) {
        return prev.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      // Store full object with UUID
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const clearCart = () => {
    localStorage.removeItem('nemo_cart');
    setCart([]);
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
