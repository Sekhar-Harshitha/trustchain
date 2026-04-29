// client/src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('trustchain_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [trustScoreData, setTrustScoreData] = useState({ score: 100, label: "Trusted", color: "green" });

  useEffect(() => {
    if (user) {
      localStorage.setItem('trustchain_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('trustchain_user');
    }
  }, [user]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const value = {
    user, setUser,
    cart, addToCart, removeFromCart, clearCart, cartTotal,
    orders, setOrders,
    trustScoreData, setTrustScoreData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
