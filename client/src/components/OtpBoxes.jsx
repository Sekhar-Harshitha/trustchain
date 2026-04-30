import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const OtpBoxes = ({ otp, onChange, onComplete, disabled, error }) => {
  const inputs = useRef([]);

  useEffect(() => {
    if (otp.every(digit => digit !== '') && onComplete) {
      onComplete(otp.join(''));
    }
  }, [otp, onComplete]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    onChange(newOtp);

    if (val && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    data.forEach((digit, i) => {
      if (!isNaN(digit)) newOtp[i] = digit;
    });
    onChange(newOtp);
    if (data.length > 0) {
      const nextIndex = Math.min(data.length, 5);
      inputs.current[nextIndex].focus();
    }
  };

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  };

  return (
    <motion.div 
      animate={error ? shakeAnimation : {}}
      className="flex justify-between gap-2"
    >
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          value={digit}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          maxLength={1}
          className="w-12 h-14 text-center text-2xl font-bold bg-white border-2 border-slate-200 rounded-xl focus:border-accent focus:outline-none transition-all disabled:opacity-50"
        />
      ))}
    </motion.div>
  );
};

export default OtpBoxes;
