import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../utils/utils';

export default function TrustBadge({ score, label, className }) {
  const isHighRisk = score < 50;
  const isMediumRisk = score >= 50 && score < 80;
  
  const colors = isHighRisk 
    ? "from-red-500 to-orange-600 shadow-red-500/20 text-red-500" 
    : isMediumRisk 
    ? "from-orange-400 to-yellow-500 shadow-orange-500/20 text-orange-500"
    : "from-emerald-400 to-teal-500 shadow-emerald-500/20 text-emerald-500";

  const Icon = isHighRisk ? ShieldAlert : isMediumRisk ? Zap : ShieldCheck;

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("relative group", className)}
    >
      {/* Animated Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className={cn("absolute inset-0 blur-2xl rounded-full bg-gradient-to-br opacity-20", colors)}
      />

      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Shield className="w-24 h-24 rotate-12" />
        </div>

        <div className="relative">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40" cy="40" r="36"
              stroke="currentColor" strokeWidth="6"
              fill="transparent" className="text-gray-100"
            />
            <motion.circle
              cx="40" cy="40" r="36"
              stroke="currentColor" strokeWidth="6"
              fill="transparent"
              strokeDasharray="226"
              initial={{ strokeDashoffset: 226 }}
              animate={{ strokeDashoffset: 226 - (226 * score) / 100 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className={colors.split(' ')[2]} // Use the color text class
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
             <Icon className={cn("w-8 h-8", colors.split(' ')[3])} />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Integrity Index</p>
          <div className="flex items-baseline gap-1">
            <motion.h4 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black text-gray-900 tracking-tighter"
            >
              {score}
            </motion.h4>
            <span className="text-xs font-bold text-gray-400">/100</span>
          </div>
          <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", colors.split(' ')[3])}>
            {label || (isHighRisk ? 'Critical Risk' : isMediumRisk ? 'Review Required' : 'Verified Trusted')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
