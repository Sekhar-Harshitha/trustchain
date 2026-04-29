import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Zap, ArrowRight, Loader2, LogOut, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/utils';

export default function ReturnModal({
  selectedOrder,
  setSelectedOrder,
  returnForm,
  setReturnForm,
  handleReturnRequest,
  isSubmitting,
  analysisResult,
  error
}) {
  return (
    <AnimatePresence>
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && setSelectedOrder(null)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden relative z-10"
          >
            {isSubmitting && (
              <motion.div
                initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }}
                className="absolute top-0 left-0 h-1.5 bg-indigo-600"
              />
            )}

            <div className="p-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Return Intelligence</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                     <Zap className="w-3 h-3" /> Node Verification Protocol
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-colors"
                  >
                    <LogOut className="w-5 h-5 rotate-180" />
                  </button>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 mb-8"
                >
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {!analysisResult ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onSubmit={handleReturnRequest} className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Inconsistency Category</label>
                          <select
                            value={returnForm.reason}
                            onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-gray-50 focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-6 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                          >
                            <option>Defective</option>
                            <option>Not needed</option>
                            <option>Wrong item</option>
                          </select>
                       </div>
                       <div className="flex items-center">
                          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 flex gap-3">
                             <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                             <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">The Narrative engine will analyze your reasoning against historical node behavior.</p>
                          </div>
                       </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Behavioral Narrative</label>
                        <textarea
                          required rows={4}
                          placeholder="Provide a detailed narrative of the asset inconsistency..."
                          className="w-full bg-gray-50 border-2 border-gray-50 focus:border-indigo-100 focus:bg-white rounded-[2rem] py-5 px-7 outline-none transition-all text-sm font-medium resize-none shadow-inner"
                          onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                        />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all disabled:opacity-50 relative overflow-hidden group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          CALCULATING INTEGRITY SCORE...
                        </>
                      ) : (
                        <>
                          SYNCHRONIZE WITH BLOCKCHAIN
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-10"
                  >
                     <div className={cn(
                       'p-12 rounded-[3.5rem] border-2 text-center relative overflow-hidden',
                       analysisResult.status === 'Approved'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-red-50 border-red-100 text-red-600 animate-pulse'
                     )}>
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                           {analysisResult.status === 'Approved' ? <ShieldCheck className="w-40 h-40" /> : <ShieldAlert className="w-40 h-40" />}
                        </div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10">
                           <div className={cn(
                             'w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6',
                             analysisResult.status === 'Approved' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg'
                           )}>
                              {analysisResult.status === 'Approved' ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                           </div>
                           <h2 className="text-5xl font-black tracking-tighter mb-2 uppercase">
                              {analysisResult.status === 'Approved' ? 'Validated' : 'Containment'}
                           </h2>
                           <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-70">
                              Protocol Decision: {analysisResult.status}
                           </p>
                        </motion.div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Risk Assessment</p>
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                'w-3 h-3 rounded-full shadow-[0_0_12px]',
                                analysisResult.riskLevel === 'Low' ? 'bg-emerald-500 shadow-emerald-500' :
                                analysisResult.riskLevel === 'Medium' ? 'bg-orange-500 shadow-orange-500' :
                                'bg-red-500 shadow-red-500'
                              )} />
                              <span className={cn(
                                'text-2xl font-black uppercase tracking-tight',
                                analysisResult.riskLevel === 'Low' ? 'text-emerald-600' :
                                analysisResult.riskLevel === 'Medium' ? 'text-orange-500' :
                                'text-red-600'
                              )}>
                                {analysisResult.riskLevel || 'Unknown'}
                              </span>
                           </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Trust Score Impact</p>
                           <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-black text-gray-900">{analysisResult.score ?? '—'}</span>
                              <span className="text-xs font-bold text-gray-400 uppercase">Index</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SHA-256 Block Sealed</span>
                        </div>
                        <code className="text-[9px] font-mono text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg">
                           {(analysisResult.blockHash || 'N/A').substring(0, 24)}...
                        </code>
                     </div>

                     <button
                       onClick={() => setSelectedOrder(null)}
                       className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all"
                     >
                       CLOSE IDENTITY TERMINAL
                     </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
