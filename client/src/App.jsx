import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('tc_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    // BrowserRouter MUST wrap AppProvider because AppProvider uses useNavigate()
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Navigate to="/shop" replace />} />
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
