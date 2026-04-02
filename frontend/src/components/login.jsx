import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credenciales, setCredenciales] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const manejarCambio = (e) => {
        setCredenciales({
            ...credenciales,
            [e.target.name]: e.target.value
        });
    };

    const iniciarSesion = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // 1. Enviamos los datos al backend
            const res = await axios.post('http://localhost:5000/api/auth/login', credenciales);
            
            // 2. Si es exitoso, guardamos el token y el nombre de usuario
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('usuario', res.data.username);

            // 3. Redirigimos a la página de Equipos (o al inicio)
            alert(`¡Bienvenido, ${res.data.username}!`);
            navigate('/equipos'); 
            
            window.location.reload();
            window.location.href = '/'; 
        } catch (err) {
            // Manejo de errores (401 usuario no encontrado, etc.)
            setError(err.response?.data?.error || "Error al conectar con el servidor");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center' }}>🔐 Acceso Administrativo</h2>
            
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <form onSubmit={iniciarSesion} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Usuario:</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={credenciales.username} 
                        onChange={manejarCambio} 
                        style={{ width: '100%', padding: '8px' }} 
                        required 
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={credenciales.password} 
                        onChange={manejarCambio} 
                        style={{ width: '100%', padding: '8px' }} 
                        required 
                    />
                </div>
                <button type="submit" style={{ padding: '10px', background: '#2c3e50', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Entrar
                </button>
            </form>
        </div>
    );
};

export default Login;