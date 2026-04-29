import { Navigate, Link } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('rg_token');
  const role = localStorage.getItem('rg_role');

  if (!token) {
    // Redirect to the appropriate login page based on the intended role
    if (allowedRole === 'admin') return <Navigate to="/login/admin" replace />;
    if (allowedRole === 'vendor') return <Navigate to="/login/vendor" replace />;
    return <Navigate to="/login/customer" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10 font-['Inter']">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-red-100 text-center">
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
           </div>
           <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Access Denied</h1>
           <p className="text-sm text-gray-500 font-medium mb-10 leading-relaxed">
             This sector requires <span className="font-black text-red-500 uppercase">{allowedRole}</span> clearance. Please authenticate via the correct terminal.
           </p>
           <Link to={`/login/${allowedRole}`} className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all inline-block">Authenticate</Link>
        </div>
      </div>
    );
  }

  return children;
}
