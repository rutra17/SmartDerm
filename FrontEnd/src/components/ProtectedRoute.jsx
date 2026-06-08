import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
    const userRaw = localStorage.getItem('smartderm_user');
    const token = localStorage.getItem('smartderm_token');

    if (!token || !userRaw) {
        return <Navigate to="/" replace />;
    }

    try {
        const user = JSON.parse(userRaw);

        if (!allowedRoles.includes(user.tipo_conta)) {
            console.warn(`Acesso negado. Rota exige ${allowedRoles}, usuário é ${user.tipo_conta}`);
            return <Navigate to="/" replace />;
        }

        return children;
    } catch {
        return <Navigate to="/" replace />;
    }
}
