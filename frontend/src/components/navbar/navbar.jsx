import { useState, useEffect } from 'react';
import { Home, Users, Trophy, Calendar, Award, Shield, LogIn, LogOut, Menu, X, User } from 'lucide-react';
import LoginModal from '../pages/login/login';

const Navbar = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [username, setUsername] = useState('');

    // Verificar si hay sesión activa al montar
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('username');
        if (token) {
            setIsLoggedIn(true);
            setUsername(user || 'Admin');
        }
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

    const navLinks = [
        { name: 'Inicio', href: '/', icon: Home, active: pathname === '/' },
        { name: 'Equipos', href: '/equipos', icon: Shield, active: pathname.startsWith('/equipos') },
        { name: 'Pichichi', href: '/pichichi', icon: Trophy, active: pathname.startsWith('/pichichi') },
        { name: 'Partidos', href: '/partidos', icon: Calendar, active: pathname.startsWith('/partido') || pathname.startsWith('/partidos') },
        { name: 'Jugadores', href: '/jugadores', icon: Users, active: pathname.startsWith('/jugadores') },
    ];

    return (
        <>
            {/* Top Navbar */}
            <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-orange-500 to-orange-600 flex items-center justify-center p-0.5 shadow-md shadow-orange-500/10">
                            <img src="http://localhost:5000/uploads/logo_basket.png" alt="Logo" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <span className="text-white font-extrabold text-lg tracking-wider hidden sm:block">NEXT<span className="text-orange-500">GEN</span></span>
                    </a>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    link.active
                                        ? 'bg-linear-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {link.name}
                            </a>
                        );
                    })}
                    {isLoggedIn && (
                        <a
                            href="/Admin"
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                pathname === '/Admin'
                                    ? 'bg-linear-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                            }`}
                        >
                            <Award className="w-4 h-4" />
                            Admin
                        </a>
                    )}
                </div>

                {/* Desktop Auth */}
                <div className="hidden lg:flex items-center gap-4">
                    {!isLoggedIn ? (
                        <button
                            onClick={openLogin}
                            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                            <LogIn className="w-4 h-4" />
                            Login
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 bg-slate-900/80 pl-3 pr-1.5 py-1.5 rounded-full border border-slate-800">
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4 text-orange-500" />
                                <span className="text-slate-200 text-sm font-medium pr-1">{username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Hamburger Toggle (Mobile Only) */}
                <button
                    className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                </button>
            </nav>

            {/* Mobile Drawer Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-70 bg-slate-950 border-l border-slate-900 z-50 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div>
                    <div className="flex items-center justify-between pb-5 border-b border-slate-900 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center p-0.5">
                                <img src="http://localhost:5000/uploads/logo_basket.png" alt="Logo" className="w-full h-full rounded-full object-cover" />
                            </div>
                            <span className="text-white font-extrabold text-sm tracking-wider">NEXT<span className="text-orange-500">GEN</span></span>
                        </div>
                        <button
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                                        link.active
                                            ? 'bg-orange-500/10 border border-orange-500/20 text-orange-500'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.name}
                                </a>
                            );
                        })}
                        {isLoggedIn && (
                            <a
                                href="/Admin"
                                onClick={() => setIsSidebarOpen(false)}
                                className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                                    pathname === '/Admin'
                                        ? 'bg-orange-500/10 border border-orange-500/20 text-orange-500'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                }`}
                            >
                                <Award className="w-4 h-4" />
                                Panel Admin
                            </a>
                        )}
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-5 mt-auto">
                    {!isLoggedIn ? (
                        <button
                            onClick={openLogin}
                            className="w-full py-3 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/10"
                        >
                            <LogIn className="w-4 h-4" />
                            Ingresar
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
                                <User className="w-4 h-4 text-orange-500" />
                                <span className="text-white text-sm font-semibold truncate">Hola, {username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-red-400 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Tab Bar for Mobile Navigation */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 border-t border-slate-900 backdrop-blur-md lg:hidden flex items-center justify-around z-40 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                                link.active ? 'text-orange-500 scale-105' : 'text-slate-500'
                            }`}
                        >
                            <Icon className="w-4.5 h-4.5" />
                            <span className="text-[10px] font-bold tracking-wide">{link.name}</span>
                        </a>
                    );
                })}
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
