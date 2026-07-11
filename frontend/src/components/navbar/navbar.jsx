import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Trophy, Calendar, Award, Shield, LogIn, LogOut, Menu, X, User } from 'lucide-react';
import LoginModal from '../pages/login/login';

const Navbar = () => {
    const [estaAbiertoLogin, setEstaAbiertoLogin] = useState(false);
    const [estaLogueado, setEstaLogueado] = useState(false);
    const [estaAbiertaBarraLateral, setEstaAbiertaBarraLateral] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState('');

    // Verificar si hay sesión activa al montar
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('username');
        if (token) {
            setEstaLogueado(true);
            setNombreUsuario(user || 'Admin');
        }
    }, []);

    const manejarInicioSesionCorrecto = () => {
        setEstaLogueado(true);
        setEstaAbiertoLogin(false);
        window.location.reload();
    };

    const manejarCerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setEstaLogueado(false);
        window.location.reload();
    };

    const abrirLogin = () => {
        setEstaAbiertoLogin(true);
        setEstaAbiertaBarraLateral(false);
    };

    // useLocation se actualiza en cada cambio de ruta sin recargar la página
    const { pathname } = useLocation();

    const enlacesNavegacion = [
        { name: 'Inicio', href: '/', icon: Home, active: pathname === '/' },
        { name: 'Equipos', href: '/equipos', icon: Shield, active: pathname.startsWith('/equipos') },
        { name: 'Pichichi', href: '/pichichi', icon: Trophy, active: pathname.startsWith('/pichichi') },
        { name: 'Partidos', href: '/partidos', icon: Calendar, active: pathname.startsWith('/partido') || pathname.startsWith('/partidos') },
        { name: 'Jugadores', href: '/jugadores', icon: Users, active: pathname.startsWith('/jugadores') },
    ];

    return (
        <>
            {/* Barra de navegación superior */}
            <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-orange-500 to-orange-600 flex items-center justify-center p-0.5 shadow-md shadow-orange-500/10">
                            <img src="http://localhost:5000/uploads/logo_basket.png" alt="Logo" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <span className="text-white font-extrabold text-lg tracking-wider hidden sm:block">NEXT<span className="text-orange-500">GEN</span></span>
                    </Link>
                </div>

                {/* Menú de escritorio */}
                <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
                    {enlacesNavegacion.map((enlace) => {
                        const Icono = enlace.icon;
                        return (
                            <Link
                                key={enlace.name}
                                to={enlace.href}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    enlace.active
                                        ? 'bg-linear-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                                }`}
                            >
                                <Icono className="w-4 h-4" />
                                {enlace.name}
                            </Link>
                        );
                    })}
                    {estaLogueado && (
                        <Link
                            to="/admin"
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                pathname === '/admin'
                                    ? 'bg-linear-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                            }`}
                        >
                            <Award className="w-4 h-4" />
                            Admin
                        </Link>
                    )}
                </div>

                {/* Autenticación en escritorio */}
                <div className="hidden lg:flex items-center gap-4">
                    {!estaLogueado ? (
                        <button
                            onClick={abrirLogin}
                            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                            <LogIn className="w-4 h-4" />
                            Login
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 bg-slate-900/80 pl-3 pr-1.5 py-1.5 rounded-full border border-slate-800">
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4 text-orange-500" />
                                <span className="text-slate-200 text-sm font-medium pr-1">{nombreUsuario}</span>
                            </div>
                            <button
                                onClick={manejarCerrarSesion}
                                className="p-2 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Menú hamburguesa (móvil) */}
                <button
                    className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                    onClick={() => setEstaAbiertaBarraLateral(true)}
                >
                    <Menu className="w-5 h-5" />
                </button>
            </nav>

            {/* Fondo del menú móvil */}
            {estaAbiertaBarraLateral && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setEstaAbiertaBarraLateral(false)}
                />
            )}

            {/* Menú lateral móvil */}
            <div
                className={`fixed top-0 right-0 h-full w-70 bg-slate-950 border-l border-slate-900 z-50 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
                    estaAbiertaBarraLateral ? 'translate-x-0' : 'translate-x-full'
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
                            onClick={() => setEstaAbiertaBarraLateral(false)}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {enlacesNavegacion.map((enlace) => {
                            const Icono = enlace.icon;
                            return (
                                <Link
                                    key={enlace.name}
                                    to={enlace.href}
                                    onClick={() => setEstaAbiertaBarraLateral(false)}
                                    className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                                        enlace.active
                                            ? 'bg-orange-500/10 border border-orange-500/20 text-orange-500'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                    }`}
                                >
                                    <Icono className="w-4 h-4" />
                                    {enlace.name}
                                </Link>
                            );
                        })}
                        {estaLogueado && (
                            <Link
                                to="/admin"
                                onClick={() => setEstaAbiertaBarraLateral(false)}
                                className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                                    pathname === '/admin'
                                        ? 'bg-orange-500/10 border border-orange-500/20 text-orange-500'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                }`}
                            >
                                <Award className="w-4 h-4" />
                                Panel Admin
                            </Link>
                        )}
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-5 mt-auto">
                    {!estaLogueado ? (
                        <button
                            onClick={abrirLogin}
                            className="w-full py-3 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/10"
                        >
                            <LogIn className="w-4 h-4" />
                            Ingresar
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
                                <User className="w-4 h-4 text-orange-500" />
                                <span className="text-white text-sm font-semibold truncate">Hola, {nombreUsuario}</span>
                            </div>
                            <button
                                onClick={manejarCerrarSesion}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-red-400 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Barra de navegación inferior móvil */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 border-t border-slate-900 backdrop-blur-md lg:hidden flex items-center justify-around z-40 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
                {enlacesNavegacion.map((enlace) => {
                    const Icono = enlace.icon;
                    return (
                        <Link
                            key={enlace.name}
                            to={enlace.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                                enlace.active ? 'text-orange-500 scale-105' : 'text-slate-500'
                            }`}
                        >
                            <Icono className="w-4.5 h-4.5" />
                            <span className="text-[10px] font-bold tracking-wide">{enlace.name}</span>
                        </Link>
                    );
                })}
            </div>

            {estaAbiertoLogin && (
                <LoginModal
                    alCerrar={() => setEstaAbiertoLogin(false)}
                    alIniciarSesionCorrecto={manejarInicioSesionCorrecto}
                />
            )}
        </>
    );
};

export default Navbar;
