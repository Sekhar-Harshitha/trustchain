// client/src/components/FraudAlert.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, XCircle } from 'lucide-react';

export default function FraudAlert({ riskLevel }) {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="p-10 space-y-8"
    >
      <div className="w-24 h-24 mx-auto bg-danger/10 text-danger rounded-[32px] flex items-center justify-center animate-pulse">
        <ShieldAlert size={56} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-danger font-black uppercase tracking-widest text-sm">
          <AlertTriangle size={18} /> High Risk Activity Detected
        </div>
        <h3 className="text-4xl font-black text-text-primary tracking-tight">Access Denied</h3>
        <p className="text-text-secondary font-medium leading-relaxed max-w-sm mx-auto">
          Our security engine has flagged this request as <span className="text-danger font-bold">{riskLevel} RISK</span>. 
          Your narrative inconsistencies have been recorded on the immutable ledger.
        </p>
      </div>

      <div className="p-6 bg-danger/5 rounded-[32px] border border-danger/10">
        <p className="text-[10px] font-bold text-danger/60 uppercase tracking-widest mb-2">Security Enforcement</p>
        <p className="text-xs text-danger/80 font-bold leading-relaxed italic">
          Account status: RESTRICTED. Please contact security@trustchain.com for manual identity verification.
        </p>
      </div>
    </motion.div>
  );
}
