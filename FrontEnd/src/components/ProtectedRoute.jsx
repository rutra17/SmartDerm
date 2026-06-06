import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function ProtectedRoute({ children, allowedRoles }) {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const verificarAcesso = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error || !session) {
                    setIsAuthorized(false);
                    setLoading(false);
                    return;
                }

                // Extrai o tipo de conta (cargo) dos metadados
                const tipoConta = session.user.user_metadata?.tipo_conta;
                
                // Console.log para o ajudar a debugar se der erro
                console.log("🔒 Segurança verificando. Cargo encontrado:", tipoConta);

                if (allowedRoles.includes(tipoConta)) {
                    setIsAuthorized(true);
                } else {
                    // Está logado mas tentou entrar num painel que não é dele
                    console.warn(`Acesso negado. A rota exige ${allowedRoles}, mas o utilizador é ${tipoConta}`);
                    setIsAuthorized(false);
                }
            } catch (err) {
                console.error("Erro no ProtectedRoute:", err);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        verificarAcesso();
    }, [allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#202123] flex items-center justify-center">
                <p className="animate-pulse text-emerald-500 font-bold">Validando credenciais de segurança...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        // Usa o replace para destruir o histórico de navegação
        return <Navigate to="/" replace />;
    }

    return children;
}