import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import ComingSoon from './pages/ComingSoon';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Donate from './pages/Donate';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Coming Soon Page (Default Landing) */}
          <Route path="/" element={<ComingSoon />} />

          {/* Secret Preview Access - Full Site */}
          <Route path="/beta-access" element={<Home />} />
          <Route path="/home" element={<Navigate to="/beta-access" replace />} />

          {/* Rotas de Login/Admin */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Rotas que USAM o MainLayout (Simulador e Apoiar) */}
          <Route element={<MainLayout />}>
            <Route path="/simulador/:slug" element={<Calculator />} />
            <Route path="/apoiar" element={<Donate />} />
          </Route>

          {/* Rota padrão para não encontrados */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;