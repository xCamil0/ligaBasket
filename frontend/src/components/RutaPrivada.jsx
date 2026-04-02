import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaPrivada = ({ children }) => {
    // Revisamos si existe el token en el localStorage
    const token = localStorage.getItem('token');

    // Si no hay token, redirigimos al login
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Si hay token, mostramos el componente hijo (Equipos, Partidos, etc.)
    return children;
};

export default RutaPrivada;