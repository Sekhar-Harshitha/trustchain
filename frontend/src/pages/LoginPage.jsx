import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendOtp, verifyOtp } from "../api";

export default function LoginPage({ onLogin }) {
  const [step, setStep] = useState(1);
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [shake, setShake] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleAadhaarChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 12) {
      const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
      setAadhaar(formatted);
    }
    setError("");
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSendOtp = async () => {
    const rawAadhaar = aadhaar.replace(/\s/g, "");
    if (rawAadhaar.length !== 12) {
      setError("Aadhaar must be exactly 12 digits.");
      triggerShake();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await sendOtp(rawAadhaar);
      if (res.success || res.message === "OTP sent") {
        setSuccessMsg(`OTP sent to number ending in ${res.masked_phone}`);
        setStep(2);
        setCountdown(30);
      } else {
        setError(res.detail || "Failed to send OTP.");
        triggerShake();
      }
    } catch (err) {
      setError("Network error connecting to backend.");
      triggerShake();
    }
    setLoading(false);
  };

  const handleOtpChange = (index, val) => {
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      otpRefs.current[index + 1].focus();
    }
    
    if (newOtp.every((digit) => digit !== "")) {
      submitVerifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const submitVerifyOtp = async (fullOtp) => {
    setLoading(true);
    setError("");
    try {
      const rawAadhaar = aadhaar.replace(/\s/g, "");
      const res = await verifyOtp(rawAadhaar, fullOtp);
      if (res.success || res.token) {
        localStorage.setItem("token", res.token);
        if (onLogin && res.user) {
          onLogin(res.user);
        } else {
          window.location.href = "/shop";
        }
      } else {
        setError(res.detail || "Invalid OTP.");
        triggerShake();
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0].focus();
      }
    } catch (err) {
      setError("Error verifying OTP.");
      triggerShake();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C4DFF] rounded-full blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#00E676] rounded-full blur-[100px] opacity-10"></div>

      <motion.div
        animate={shake ? { x: [0, -8, 8, -8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-[16px] border border-white/20 rounded-[20px] shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-300 text-center mb-8">Secure login with Aadhaar & Verify</p>

        {error && (
          <div className="bg-[#FF5252]/20 border border-[#FF5252] text-[#FF5252] px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {successMsg && step === 2 && (
          <div className="bg-[#00E676]/20 border border-[#00E676] text-[#00E676] px-4 py-3 rounded-lg mb-6 text-sm">
            {successMsg}
          </div>
        )}

        <div className="overflow-hidden relative">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                className="w-full"
              >
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={aadhaar}
                  onChange={handleAadhaarChange}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-5 py-4 text-white text-lg tracking-widest focus:outline-none focus:border-[#7C4DFF] transition-colors mb-6"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-[#7C4DFF] hover:bg-[#651FFF] text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                className="w-full"
              >
                <label className="block text-sm font-medium mb-4 text-center text-gray-300">
                  Enter 6-digit Code
                </label>
                <div className="flex justify-between gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 bg-black/40 border border-white/20 rounded-lg text-center text-2xl font-semibold focus:outline-none focus:border-[#00E676] transition-colors"
                    />
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => submitVerifyOtp(otp.join(""))}
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full bg-[#00E676] hover:bg-[#00C853] text-black font-bold py-4 rounded-xl transition-all mb-4 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </motion.button>
                
                <div className="text-center">
                  <button
                    onClick={handleSendOtp}
                    disabled={countdown > 0 || loading}
                    className="text-sm text-[#7C4DFF] hover:text-white transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Demo Hint */}
        <div className="mt-12 text-xs text-gray-500 text-center border-t border-white/10 pt-4">
          <p className="mb-1 uppercase tracking-wider font-semibold">Demo Credentials</p>
          <div className="flex flex-col gap-1 items-center">
            <code>2345 6789 0123</code>
            <code>3456 7890 1234</code>
            <code>4567 8901 2345</code>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
