import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Terminal, Lock, User, Zap, ChevronRight } from 'lucide-react';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
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

    if (formData.username === 'admin' && formData.password === 'admin123') {
      login({ username: 'admin', email: 'admin@nemo.com' });
      navigate('/admin');
    } else {
      setError('ACCESS DENIED: INVALID CREDENTIALS');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-mono">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f00078] opacity-[0.05] blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 opacity-[0.05] blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-slate-800 p-12 shadow-2xl relative z-10"
      >
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
               <Terminal className="w-6 h-6 text-[#f00078]" />
            </div>
            <div>
               <h1 className="text-xl font-black text-white tracking-widest uppercase">Admin Terminal</h1>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Nemo Protocol v9.0.4</p>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-[#f00078]/50 to-transparent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20 animate-pulse text-center tracking-widest">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#f00078] transition-colors" />
              <input 
                type="text" name="username" placeholder="ROOT_USERNAME" required
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#f00078]/50 rounded-xl py-4 pl-12 pr-6 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-700"
                onChange={handleInputChange}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#f00078] transition-colors" />
              <input 
                type="password" name="password" placeholder="ENCRYPTED_PASSWORD" required
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#f00078]/50 rounded-xl py-4 pl-12 pr-6 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-700"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-slate-950 py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-[#f00078] hover:text-white transition-all flex items-center justify-center gap-3 group"
          >
            Initialize Session
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-12 text-center">
           <Link to="/login" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
             <Zap className="w-3 h-3" />
             Return to Public Marketplace
           </Link>
        </div>
      </motion.div>

      <div className="fixed bottom-8 left-8 flex items-center gap-4 text-slate-700">
         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
         <span className="text-[10px] font-black uppercase tracking-widest">Mainnet Secure</span>
      </div>
    </div>
  );
}
