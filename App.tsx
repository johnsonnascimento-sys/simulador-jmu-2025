import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Home from './src/pages/Home';
import Calculator from './src/pages/Calculator';
import Login from './src/pages/Login';
import AdminDashboard from './src/pages/AdminDashboard';
import MainLayout from './src/components/MainLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
    }

    if (!session) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/simulador/:slug" element={<Calculator />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/admin"
                            element={
                                <PrivateRoute>
                                    <AdminDashboard />
                                </PrivateRoute>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
