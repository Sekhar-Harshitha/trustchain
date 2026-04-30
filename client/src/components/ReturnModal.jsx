import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, Database, Shield, Link2 } from 'lucide-react';
import { submitReturn } from '../utils/api';
import { useAppContext } from '../context/AppContext';
import FraudAlert from './FraudAlert';

const ReturnModal = ({ order, onClose, onSuccess }) => {
  const { token } = useAppContext();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const loadingMessages = [
    { text: "Running heuristic engine...", icon: Shield },
    { text: "Consulting Claude AI...", icon: Sparkles },
    { text: "Calculating trust score...", icon: Database },
    { text: "Recording to blockchain...", icon: Link2 }
  ];

  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev < loadingMessages.length - 1) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleSubmit = async () => {
    if (reason.length < 10) return setError('Reason must be at least 10 characters');
    setStep(2);
    try {
      const data = await submitReturn({ order_id: order.order_id, reason }, token);
      // Ensure we stay in loading at least long enough for animation
      setTimeout(() => {
        setResult(data);
        setStep(3);
        if (onSuccess) onSuccess();
      }, 3500);
    } catch (err) {
      setError(err.message);
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm z-[60] overflow-y-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-text-primary">Request Return</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Item: <span className="font-bold text-text-primary">{order.items[0]?.name}</span></p>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Return Reason</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Tell us exactly why you are returning this item..."
                  className="w-full h-32 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent focus:outline-none transition-all resize-none text-sm"
                />
              </div>
              {error && <p className="text-danger text-xs font-bold">{error}</p>}
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Secure Return via TrustChain
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-12 shadow-2xl text-center"
          >
            <div className="relative flex justify-center mb-8">
              <Loader2 className="w-16 h-16 text-accent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-6">TrustChain AI Analysis</h2>
            <div className="space-y-4 text-left max-w-[240px] mx-auto">
              {loadingMessages.map((msg, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i > loadingStep ? 'opacity-20 grayscale' : 'opacity-100'}`}>
                  <msg.icon className={`w-5 h-5 ${i === loadingStep ? 'text-accent' : 'text-success'}`} />
                  <span className={`text-sm font-medium ${i === loadingStep ? 'text-text-primary' : 'text-slate-400'}`}>{msg.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && result && (
          <FraudAlert 
            {...result}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReturnModal;
