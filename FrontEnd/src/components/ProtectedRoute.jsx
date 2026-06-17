import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    // 1. Procura o Token no cofre do navegador
    const token = localStorage.getItem('token');
    // 2. Procura os dados do utilizador que guardámos no momento do login
    const usuarioString = localStorage.getItem('usuario');
    
    // Se não tiver token, expulsa para a tela de login inicial
    if (!token || !usuarioString) {
        return <Navigate to="/" replace />;
    }

    try {
        const usuario = JSON.parse(usuarioString);

        // Se o tipo do utilizador logado não estiver na lista de permitidos (ex: um Paciente a tentar acessar a rota do Médico)
        if (allowedRoles && !allowedRoles.includes(usuario.tipo)) {
            // Pode redirecionar para uma página de "Acesso Negado" ou forçar logout
            return <Navigate to="/" replace />;
        }

        // Se tudo estiver certo, renderiza a página que ele pediu!
        return children;
        
    } catch (error) {
        // Se der erro ao ler os dados, limpa tudo e expulsa
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        return <Navigate to="/" replace />;
    }
};

export default ProtectedRoute;