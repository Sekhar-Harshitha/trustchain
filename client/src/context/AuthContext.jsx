import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nemo_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Auth Restore Error:', e);
      return null;
    }
  });

  const login = (userData) => {
    const role = userData.email === 'admin@nemo.com' || userData.username === 'admin' ? 'admin' : 'user';
    const finalUser = { ...userData, role };
    setUser(finalUser);
    localStorage.setItem('nemo_user', JSON.stringify(finalUser));
    localStorage.setItem('role', role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nemo_user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
