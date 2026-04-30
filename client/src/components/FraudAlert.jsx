import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, ShieldAlert, X, Activity, Link2, BrainCircuit } from 'lucide-react';
import TrustBadge from './TrustBadge';

const FraudAlert = ({ decision, riskLevel, aiAnalysis, heuristic, trustScore, blockHash, onClose }) => {
  const getDecisionUI = () => {
    switch (decision) {
      case 'APPROVED':
        return { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', border: 'border-success' };
      case 'UNDER REVIEW':
        return { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning' };
      default:
        return { icon: ShieldAlert, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger' };
    }
  };

  const ui = getDecisionUI();
  const Icon = ui.icon;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm z-50 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
      >
        <div className={`${ui.bg} p-8 text-center border-b ${ui.border}/20`}>
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${ui.bg} border-4 ${ui.border}`}>
              <Icon className={`w-12 h-12 ${ui.color}`} />
            </div>
          </div>
          <h2 className={`text-3xl font-black mb-2 ${ui.color}`}>{decision}</h2>
          <p className="text-slate-600 font-medium tracking-wide">TrustChain Consensus Reached</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Trust Score</p>
              <TrustBadge score={trustScore.score} label={trustScore.label} size="lg" />
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Risk Analysis</p>
              <div className={`px-4 py-2 rounded-full font-bold text-white shadow-lg ${riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'bg-danger' : riskLevel === 'MEDIUM' ? 'bg-warning' : 'bg-success'}`}>
                {riskLevel} RISK
              </div>
            </div>
          </div>

          {aiAnalysis && aiAnalysis.ai_powered && (
            <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-accent" />
                <h3 className="text-accent font-bold uppercase text-xs tracking-widest">Claude AI Narrative Analysis</h3>
              </div>
              <p className="text-text-primary text-sm leading-relaxed italic">"{aiAnalysis.reasoning}"</p>
              <div className="mt-4 flex gap-4">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Probability: {(aiAnalysis.fraud_probability * 100).toFixed(0)}%</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Coherence: {aiAnalysis.narrative_coherence}</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="w-4 h-4" />
              <h3 className="font-bold uppercase text-[10px] tracking-widest">Heuristic Flags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {heuristic.flags.map((flag, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                  {flag}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Link2 className="w-4 h-4" />
              <p className="text-[10px] font-mono">BLOCK: {blockHash}...</p>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl"
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FraudAlert;
