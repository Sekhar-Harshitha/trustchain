import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, ShieldAlert, X, Activity, Link2, BrainCircuit, TrendingUp } from 'lucide-react';
import TrustBadge from './TrustBadge';

/**
 * FraudAlert component
 * Props from ReturnModal → submitReturn API response:
 *   decision, fraudDecision, fraud_probability, riskLevel, trustScore,
 *   aiAnalysis, heuristic, blockHash
 */
const FraudAlert = ({
  decision,
  fraudDecision,
  fraud_probability,
  riskLevel,
  trustScore,
  aiAnalysis,
  heuristic,
  blockHash,
  onClose
}) => {
  // Map decision strings to UI config
  const getDecisionUI = () => {
    const d = decision || fraudDecision;
    if (d === 'APPROVED' || d === 'APPROVE') {
      return {
        icon: ShieldCheck,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        label: 'APPROVED',
        message: 'Your return has been approved.',
      };
    }
    if (d === 'UNDER REVIEW' || d === 'REVIEW') {
      return {
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        label: 'UNDER REVIEW',
        message: 'Your return is being reviewed by our team.',
      };
    }
    return {
      icon: ShieldAlert,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'REJECTED',
      message: 'This return was flagged as potentially fraudulent.',
    };
  };

  const ui = getDecisionUI();
  const Icon = ui.icon;

  const fraudPct = Math.round((fraud_probability || 0) * 100);
  const fraudColor = fraudPct > 70 ? '#ef4444' : fraudPct > 40 ? '#f59e0b' : '#22c55e';

  // Resolve trustScore — handles both {score, label} object and plain number
  const resolvedScore = typeof trustScore === 'object'
    ? trustScore
    : { score: trustScore || Math.round((1 - (fraud_probability || 0)) * 100), label: ui.label };

  const flags = heuristic?.flags || [];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm z-50 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border ${ui.border}`}
      >
        {/* Header */}
        <div className={`${ui.bg} p-8 text-center border-b ${ui.border}`}>
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className={`inline-flex p-4 rounded-full ${ui.bg} border-4 ${ui.border} mb-4`}>
            <Icon className={`w-12 h-12 ${ui.color}`} />
          </div>
          <h2 className={`text-3xl font-black mb-2 ${ui.color}`}>{ui.label}</h2>
          <p className="text-slate-500 font-medium">{ui.message}</p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">

          {/* Score + Fraud % Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Trust Score */}
            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Trust Score
              </p>
              <TrustBadge
                score={resolvedScore.score}
                label={resolvedScore.label}
                size="lg"
              />
            </div>

            {/* Fraud Probability */}
            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Fraud Probability
              </p>
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={fraudColor}
                    strokeWidth="3"
                    strokeDasharray={`${fraudPct} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: fraudColor }}>{fraudPct}%</span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-3">ML Model Score</p>
            </div>
          </div>

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="w-5 h-5 text-accent" />
                <h3 className="text-accent font-bold uppercase text-xs tracking-widest">
                  {aiAnalysis.ai_powered ? 'RandomForest ML Model' : 'Heuristic Engine'}
                </h3>
                {aiAnalysis.ai_powered && (
                  <span className="ml-auto px-2 py-0.5 bg-accent text-white text-[10px] font-black rounded-full">
                    scikit-learn
                  </span>
                )}
              </div>
              <p className="text-text-primary text-sm leading-relaxed">
                {aiAnalysis.reasoning ||
                  `Analysis complete. Fraud probability: ${fraudPct}%. Decision: ${ui.label}.`}
              </p>
              <div className="mt-4 flex gap-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <span>Probability: <strong className="text-text-primary">{fraudPct}%</strong></span>
                <span>Engine: <strong className="text-text-primary">{aiAnalysis.narrative_coherence || (aiAnalysis.ai_powered ? 'ML' : 'Heuristic')}</strong></span>
              </div>
            </div>
          )}

          {/* Heuristic Flags */}
          {flags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Activity className="w-4 h-4" />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Behavioral Flags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {flags.map((flag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Link2 className="w-4 h-4" />
              <p className="text-[10px] font-mono">
                BLOCK: {(blockHash || '').slice(0, 20)}...
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl"
            >
              Continue →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FraudAlert;
