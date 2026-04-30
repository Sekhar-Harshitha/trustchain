import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import CustomerLogin from './pages/CustomerLogin'
import VendorLogin from './pages/VendorLogin'
import AdminLogin from './pages/AdminLogin'
import CustomerDashboard from './pages/CustomerPortal'
import VendorDashboard from './pages/VendorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Shop from './pages/Shop'

export default function App() {
  const [authState, setAuthState] = useState({
    user: null,
    role: localStorage.getItem('rg_role'),
    token: localStorage.getItem('rg_token')
  })

  useEffect(() => {
    const userStr = localStorage.getItem('rg_user')
    if (userStr) {
      try {
        setAuthState(prev => ({ ...prev, user: JSON.parse(userStr) }))
      } catch (e) {
        localStorage.clear()
      }
    }
  }, [])

  const handleLogin = (data) => {
    localStorage.setItem('rg_token', data.token)
    localStorage.setItem('rg_user', JSON.stringify(data.user))
    localStorage.setItem('rg_role', data.role)
    setAuthState({ user: data.user, role: data.role, token: data.token })
  }

  const handleLogout = () => {
    localStorage.clear()
    setAuthState({ user: null, role: null, token: null })
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-['Inter']">
        <Navbar auth={authState} onLogout={handleLogout} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Login Routes */}
            <Route path="/login/customer" element={<CustomerLogin onLogin={handleLogin} />} />
            <Route path="/login/vendor" element={<VendorLogin onLogin={handleLogin} />} />
            <Route path="/login/admin" element={<AdminLogin onLogin={handleLogin} />} />

            {/* Shop Experience */}
            <Route 
              path="/shop" 
              element={
                <ProtectedRoute allowedRole="customer">
                  <Shop user={authState.user} />
                </ProtectedRoute>
              } 
            />

            {/* Dashboards (Protected) */}
            <Route 
              path="/customer/dashboard" 
              element={
                <ProtectedRoute allowedRole="customer">
                  <CustomerDashboard user={authState.user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendor/dashboard" 
              element={
                <ProtectedRoute allowedRole="vendor">
                  <VendorDashboard user={authState.user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard user={authState.user} />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
