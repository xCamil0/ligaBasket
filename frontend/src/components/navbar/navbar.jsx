import { useState, useEffect } from 'react';
import LoginModal from '../pages/login/login';
import './navbar.css';

const Navbar = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Verificar si hay sesión activa al montar
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setIsLoggedIn(true);
    }, []);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        window.location.reload();
    };

    const openLogin = () => {
        setIsLoginModalOpen(true);
        setIsSidebarOpen(false);
    };

    const pathname = window.location.pathname;

    return (
        <>
            {/* Top Navbar */}
            <nav className="navbar">
                <div className="navbar-logo">
                    <a href="/"><img src="http://localhost:5000/uploads/logo_basket.png" alt="Logo" className='logo' /></a>
                </div>

                <div className="navbar-links-main">
                    <a href="/" className={pathname === '/' ? 'nav-btn-active' : 'nav-link'}>Inicio</a>
                    <a href="/equipos" className={pathname.startsWith('/equipos') ? 'nav-btn-active' : 'nav-link'}>Equipos</a>
                    <a href="/pichichi" className={pathname.startsWith('/pichichi') ? 'nav-btn-active' : 'nav-link'}>Pichichi</a>
                    <a href="/partidos" className={pathname.startsWith('/partido') ? 'nav-btn-active' : 'nav-link'}>Partidos</a>
                    <a href="/jugadores" className={pathname.startsWith('/jugadores') ? 'nav-btn-active' : 'nav-link'}>Jugadores</a>
                    {isLoggedIn && <a href="/Admin" className={pathname === '/Admin' ? 'nav-btn-active' : 'nav-link'}>Admin</a>}
                </div>

                <div className="navbar-auth">
                    {!isLoggedIn ? (
                        <button onClick={openLogin} className="login-btn-orange">Login</button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <p style={{ color: 'white', fontSize: '0.95rem' }}>Bienvenido, {localStorage.getItem('username')}</p>
                            <button onClick={handleLogout} className="login-btn-orange">Cerrar Sesión</button>
                        </div>
                    )}
                </div>

                {/* Hamburger button visible only on Mobile */}
                <button className="navbar-hamburger" onClick={() => setIsSidebarOpen(true)}>
                    <svg viewBox="0 0 100 80" width="25" height="25" fill="white">
                        <rect width="100" height="12" rx="6"></rect>
                        <rect y="30" width="100" height="12" rx="6"></rect>
                        <rect y="60" width="100" height="12" rx="6"></rect>
                    </svg>
                </button>
            </nav>

            {/* Sidebar drawer overlay & container for Mobile */}
            <div className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />
            <div className={`sidebar-drawer ${isSidebarOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src="http://localhost:5000/uploads/logo_basket.png" alt="Logo" className='logo' style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                    </div>
                    <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>&times;</button>
                </div>
                
                <div className="sidebar-nav-links">
                    <a href="/" className={pathname === '/' ? 'sidebar-link active' : 'sidebar-link'} onClick={() => setIsSidebarOpen(false)}>Inicio</a>
                    <a href="/equipos" className={pathname.startsWith('/equipos') ? 'sidebar-link active' : 'sidebar-link'} onClick={() => setIsSidebarOpen(false)}>Equipos</a>
                    <a href="/pichichi" className={pathname.startsWith('/pichichi') ? 'sidebar-link active' : 'sidebar-link'} onClick={() => setIsSidebarOpen(false)}>Pichichi</a>
                    <a href="/partidos" className={pathname.startsWith('/partido') ? 'sidebar-link active' : 'sidebar-link'} onClick={() => setIsSidebarOpen(false)}>Partidos</a>
                    <a href="/jugadores" className={pathname.startsWith('/jugadores') ? 'sidebar-link active' : 'sidebar-link'} onClick={() => setIsSidebarOpen(false)}>Jugadores</a>
                    {isLoggedIn && <a href="/Admin" className={pathname === '/Admin' ? 'sidebar-link active' : 'sidebar-link'} onClick={() => setIsSidebarOpen(false)}>Admin</a>}
                </div>

                <div className="sidebar-auth-section">
                    {!isLoggedIn ? (
                        <div className="sidebar-auth-buttons">
                            <button onClick={openLogin} className="sidebar-btn-orange" style={{ width: '100%' }}>Ingresar</button>
                        </div>
                    ) : (
                        <div className="sidebar-user-logged">
                            <p style={{ color: 'white', fontSize: '0.95rem' }}>Bienvenido, <strong>{localStorage.getItem('username')}</strong></p>
                            <button onClick={handleLogout} className="sidebar-btn-orange" style={{ marginTop: '12px', width: '100%' }}>Cerrar Sesión</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Tab Bar for Mobile */}
            <div className="bottom-tab-bar">
                <a href="/" className={`tab-item ${pathname === '/' ? 'active' : ''}`}>
                    <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <span className="tab-label">Inicio</span>
                </a>
                <a href="/equipos" className={`tab-item ${pathname.startsWith('/equipos') ? 'active' : ''}`}>
                    <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span className="tab-label">Equipos</span>
                </a>
                <a href="/partidos" className={`tab-item ${pathname.startsWith('/partido') ? 'active' : ''}`}>
                    <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    <span className="tab-label">Partidos</span>
                </a>
                <a href="/jugadores" className={`tab-item ${pathname.startsWith('/jugadores') ? 'active' : ''}`}>
                    <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="tab-label">Jugadores</span>
                </a>
                <a href="/pichichi" className={`tab-item ${pathname.startsWith('/pichichi') ? 'active' : ''}`}>
                    <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a6 6 0 0 1 6 6c0 3.2-2.1 5.3-6 6.8-3.9-1.5-6-3.6-6-6.8a6 6 0 0 1 6-6z"/></svg>
                    <span className="tab-label">Pichichi</span>
                </a>
            </div>

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
