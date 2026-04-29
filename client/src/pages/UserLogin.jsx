import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, User, Smartphone, CreditCard, Mail } from 'lucide-react';

export default function UserLogin() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    aadhaar: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Aadhaar Validation (12 digits)
    if (!/^\d{12}$/.test(formData.aadhaar)) {
      setError('Aadhaar must be a 12-digit number');
      return;
    }
    if (!formData.name || !formData.email || !formData.mobile) {
      setError('All fields are required');
      return;
    }
    
    // Simulate Verification
    login({ 
      id: 'USER-' + Math.random().toString(36).substr(2, 9),
      name: formData.name, 
      email: formData.email, 
      mobile: formData.mobile,
      aadhaar: formData.aadhaar
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-[120px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-pink-50 p-12 border border-gray-100"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#f00078] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-pink-200">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Vibe Identity</h1>
          <p className="text-gray-400 text-xs mt-2 font-black uppercase tracking-widest">Secure Network Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-5 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 animate-pulse text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type="text" name="name" placeholder="Full Name" required
                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#f00078]/10 focus:bg-white rounded-2xl py-5 pl-14 pr-6 outline-none transition-all text-sm font-bold"
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type="email" name="email" placeholder="Email Address" required
                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#f00078]/10 focus:bg-white rounded-2xl py-5 pl-14 pr-6 outline-none transition-all text-sm font-bold"
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type="tel" name="mobile" placeholder="Mobile Number" required
                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#f00078]/10 focus:bg-white rounded-2xl py-5 pl-14 pr-6 outline-none transition-all text-sm font-bold"
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type="text" name="aadhaar" placeholder="12-digit Aadhaar" required maxLength={12}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#f00078]/10 focus:bg-white rounded-2xl py-5 pl-14 pr-6 outline-none transition-all text-sm font-bold"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#f00078] text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Authenticate Identity
          </button>
        </form>

        <div className="mt-12 text-center border-t border-gray-50 pt-8">
           <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">Are you a Network Operator?</p>
           <Link to="/admin/login" className="text-xs font-black text-[#f00078] uppercase tracking-widest hover:underline">Access Admin Terminal</Link>
        </div>
      </motion.div>
    </div>
  );
}
