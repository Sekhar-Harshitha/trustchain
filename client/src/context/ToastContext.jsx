import { useState, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../utils/utils';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []); // Memoized to prevent infinite loops in useEffect

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "min-w-[320px] p-5 rounded-[1.5rem] shadow-2xl border backdrop-blur-xl flex items-center justify-between gap-4",
                toast.type === 'success' ? "bg-white/90 border-emerald-100 text-emerald-900" : "bg-white/90 border-red-100 text-red-900"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-xl",
                  toast.type === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                  {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
