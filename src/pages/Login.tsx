import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const { session } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (session) {
            navigate('/admin');
        }
    }, [session, navigate]);

    const handleLogin = async () => {
        // Exemplo simplificado: login com Google (requer config no Supabase) ou apenas alerta
        // Como não tenho detalhes de credenciais, vou sugerir o uso do Auth UI ou instruir o usuário.
        // Para simplificar e testar, vou colocar um botão que tenta login anônimo ou apenas mostra estado.
        // Mas Supabase requer setup. Vou colocar um aviso.
        if (!import.meta.env.VITE_SUPABASE_URL) {
            alert("Configure Supabase keys!");
            return;
        }

        // Tentativa de login genérica (Magic Link para teste se o usuário digitar email)
        const email = prompt("Digite seu email para receber Magic Link (Supabase deve estar configurado):");
        if (email) {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });
            if (error) alert(error.message);
            else alert("Verifique seu email!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <p className="mb-4 text-gray-600">Faça login para acessar o Painel Administrativo.</p>
                <button
                    onClick={handleLogin}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Entrar com Email (Magic Link)
                </button>
            </div>
        </div>
    );
}
