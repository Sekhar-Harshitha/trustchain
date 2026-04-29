import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, User, Lock, Smartphone, CreditCard } from 'lucide-react';

export default function Login() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    aadhaar: '',
    username: '',
    password: ''
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

    if (isAdminMode) {
      if (formData.username === 'admin' && formData.password === 'admin123') {
        login({ username: 'admin', email: 'admin@nemo.com' });
        navigate('/admin');
      } else {
        setError('Invalid admin credentials');
      }
    } else {
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6 font-['Inter']">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-10 border border-indigo-50/50"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nemo x TrustChain</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Secure E-commerce Identity Node</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => setIsAdminMode(false)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${!isAdminMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            User Login
          </button>
          <button 
            onClick={() => setIsAdminMode(true)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${isAdminMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            Admin Terminal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          {!isAdminMode ? (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" name="name" placeholder="Full Name" required
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none transition-all text-sm font-medium"
                  onChange={handleInputChange}
                />
              </div>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="tel" name="mobile" placeholder="Mobile Number" required
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none transition-all text-sm font-medium"
                  onChange={handleInputChange}
                />
              </div>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" name="aadhaar" placeholder="12-digit Aadhaar" required maxLength={12}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none transition-all text-sm font-medium"
                  onChange={handleInputChange}
                />
              </div>
              <div className="relative">
                <input 
                  type="email" name="email" placeholder="Email Address" required
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-6 outline-none transition-all text-sm font-medium"
                  onChange={handleInputChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" name="username" placeholder="Admin Username" required
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none transition-all text-sm font-medium"
                  onChange={handleInputChange}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" name="password" placeholder="Admin Password" required
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none transition-all text-sm font-medium"
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isAdminMode ? 'Initialize Terminal' : 'Authenticate Identity'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
