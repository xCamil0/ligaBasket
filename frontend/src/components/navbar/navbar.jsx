import { useState, useEffect } from 'react';
import LoginModal from '../pages/login/login';
import './navbar.css';

const Navbar = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

    useEffect(() => {
        // Check if token exists on mount
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        window.location.reload(); // Recargar la página al iniciar sesión
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        window.location.reload(); // Recargar la página al cerrar sesión
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-logo">
                    <a href="/"><img src="http://localhost:5000/uploads/logo_basket.png" alt="Logo" className='logo' /></a>
                </div>

                <div className="navbar-links-main">
                    <a href="/" className={window.location.pathname === '/' ? 'nav-btn-active' : 'nav-link'}>Inicio</a>
                    <a href="/equipos" className={window.location.pathname === '/equipos' ? 'nav-btn-active' : 'nav-link'}>Equipos</a>
                    <a href="/pichichi" className={window.location.pathname === '/pichichi' ? 'nav-btn-active' : 'nav-link'}>Pichichi</a>
                    <a href="/partidos" className={window.location.pathname === '/partidos' ? 'nav-btn-active' : 'nav-link'}>Partidos</a>
                    <a href="/jugadores" className={window.location.pathname === '/jugadores' ? 'nav-btn-active' : 'nav-link'}>Jugadores</a>
                </div>

                <div className="navbar-auth">
                    {!isLoggedIn ? (
                        <button onClick={() => setIsLoginModalOpen(true)} className="login-btn-orange">Login</button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <p style={{ margin: 0, color: '#f28b43', fontWeight: 500 }}>Bienvenido, {localStorage.getItem('username')}</p>
                            <button onClick={handleLogout} className="login-btn-orange">Cerrar Sesión</button>
                        </div>
                    )}
                </div>
            </nav>

            {isLoginModalOpen && (
                <LoginModal
                    onClose={() => setIsLoginModalOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </>
    );
};

export default Navbar;
