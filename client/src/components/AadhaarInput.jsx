import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const AadhaarInput = ({ value, onChange, disabled }) => {
  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 12);
    onChange(val);
  };

  const formattedValue = value
    .replace(/\s?/g, '')
    .replace(/(\d{4})/g, '$1 ')
    .trim();

  const isComplete = value.length === 12;

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Aadhaar Number
        </label>
        <input
          type="text"
          value={formattedValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="XXXX XXXX XXXX"
          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-accent focus:outline-none transition-all text-lg tracking-widest font-mono"
        />
        {isComplete && (
          <CheckCircle2 className="absolute right-4 top-[38px] text-success w-6 h-6" />
        )}
      </div>

      {isComplete && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-teal font-bold tracking-tighter text-xs">AADHAAR</span>
            <span className="text-xl">🇮🇳</span>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">Government of India</p>
            <p className="text-white font-mono tracking-[0.2em] text-lg">
              XXXX XXXX {value.slice(-4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AadhaarInput;
