import { Link } from 'react-router-dom'
import { ShieldCheck, Zap, BarChart3, Lock } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-white">
      {/* ── HERO SECTION ── */}
      <section className="pt-32 pb-20 px-10">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-10 animate-bounce">
            <Zap className="w-4 h-4 fill-current" />
            Next-Gen Fraud Prevention
          </div>
          <h1 className="text-7xl md:text-8xl font-black text-gray-900 tracking-tighter uppercase mb-8 leading-[0.9]">
            Stop Return Fraud, <br />
            <span className="text-indigo-600">Keep Customer Trust.</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            AI-powered fraud detection with Aadhaar verification and Vendor ratings. Protect your inventory while rewarding your best shoppers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/login"
              className="px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
            >
              Get Started Now
            </Link>
            <button className="px-12 py-6 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-indigo-600 transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-10 grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Lock className="w-8 h-8" />}
            title="Aadhaar Identity"
            desc="OTP-based verification ensures every account is tied to a real identity."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8" />}
            title="AI Risk Engine"
            desc="CLIP & BART models analyze images and text to flag suspicious returns."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-8 h-8" />}
            title="Trust Scores"
            desc="Dynamic integrity ratings that evolve based on real vendor feedback."
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 group hover:-translate-y-2 transition-all duration-500">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4">{title}</h3>
      <p className="text-gray-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  )
}
