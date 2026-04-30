import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { sendOtp, verifyOtp } from '../utils/api';
import AadhaarInput from '../components/AadhaarInput';
import OtpBoxes from '../components/OtpBoxes';

const Login = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userInfo, setUserInfo] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const demoAccounts = [
    { name: "Priya Sharma", id: "2345 6789 0123" },
    { name: "Rahul Verma", id: "3456 7890 1234" },
    { name: "Ananya Iyer", id: "4567 8901 2345" },
    { name: "Fraud Test User", id: "1111 2222 3333", flag: "⚠️" }
  ];

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (aadhaar.length !== 12) return setError('Invalid Aadhaar number');
    setLoading(true);
    setError('');
    try {
      const data = await sendOtp(aadhaar);
      setUserInfo(data);
      setStep(2);
      setCountdown(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otpStr) => {
    setLoading(true);
    setError('');
    try {
      const data = await verifyOtp(aadhaar, otpStr || otp.join(''));
      login(data.user, data.token);
      navigate('/shop');
    } catch (err) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE7F6] via-[#E3F2FD] to-[#E8F5E9] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50"
      >
        <div className="p-8 pb-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">TrustChain</h1>
          <p className="text-text-secondary font-medium mt-1">Aadhaar-Verified Secure Login</p>
        </div>

        <div className="p-8 pt-0">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-6"
              >
                <AadhaarInput 
                  value={aadhaar} 
                  onChange={setAadhaar} 
                  disabled={loading} 
                />

                {error && (
                  <div className="flex items-center gap-2 text-danger bg-danger/5 p-3 rounded-xl border border-danger/10">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSendOtp}
                  disabled={loading || aadhaar.length !== 12}
                  className="w-full bg-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Send OTP <ChevronRight className="w-5 h-5" /></>}
                </button>

                <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setShowDemo(!showDemo)}
                    className="flex items-center justify-between w-full text-text-secondary text-sm font-bold"
                  >
                    <span>Demo Credentials</span>
                    {showDemo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {showDemo && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                          {demoAccounts.map(acc => (
                            <div 
                              key={acc.id} 
                              onClick={() => setAadhaar(acc.id.replace(/\s/g, ''))}
                              className="flex justify-between items-center text-[10px] cursor-pointer hover:bg-white p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                            >
                              <span className="font-bold text-slate-600">{acc.flag} {acc.name}</span>
                              <span className="font-mono text-slate-400">{acc.id}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6 text-center"
              >
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">Welcome, {userInfo?.name}!</h2>
                  <div className="inline-block mt-2 px-3 py-1 bg-teal/10 text-teal rounded-full text-[10px] font-black uppercase tracking-widest">
                    {userInfo?.state}
                  </div>
                </div>

                <p className="text-sm text-text-secondary">
                  OTP sent to <span className="font-bold text-text-primary">{userInfo?.masked_phone}</span>
                </p>

                <OtpBoxes 
                  otp={otp} 
                  onChange={setOtp} 
                  onComplete={handleVerifyOtp}
                  disabled={loading}
                  error={!!error}
                />

                {error && (
                   <div className="flex items-center justify-center gap-2 text-danger text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otp.some(d => d === '')}
                    className="w-full bg-accent text-white py-4 rounded-2xl font-bold shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify OTP"}
                  </button>
                  
                  <div className="flex justify-between items-center px-2">
                    <button 
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-text-secondary hover:text-accent transition-colors"
                    >
                      ← Change Aadhaar
                    </button>
                    <button 
                      onClick={handleSendOtp}
                      disabled={countdown > 0}
                      className="text-xs font-bold text-accent disabled:text-slate-300"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
