import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Calendar, Clock, Trophy, BarChart3, ChevronDown, ChevronUp, Users, Shield, ArrowLeft, Eye } from 'lucide-react';

const DetalleEquipo = () => {
    const { id } = useParams();
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [activeTab, setActiveTab] = useState('plantilla');
    const [expandirPlantilla, setExpandirPlantilla] = useState(false);

    // Cargar detalle completo del equipo (info, jugadores, partidos)
    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/equipos/${id}/detalle`);
                setDatos(res.data);
            } catch (error) {
                console.error("Error al cargar el detalle del equipo:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarDetalle();
    }, [id]);

    if (cargando) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                    <p className="text-slate-400 font-medium">Cargando detalles del equipo...</p>
                </div>
            </div>
        );
    }

    if (!datos) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="text-center bg-slate-950/40 border border-slate-900 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm">
                    <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4 opacity-80" />
                    <p className="text-white text-lg font-bold mb-2">No se encontró el equipo</p>
                    <p className="text-slate-400 text-sm mb-6">El equipo que estás buscando no existe o ha sido eliminado.</p>
                    <Link to="/equipos" className="inline-flex items-center justify-center px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20">
                        Volver a Equipos
                    </Link>
                </div>
            </div>
        );
    }

    const { equipo, jugadores, jugados, pendientes } = datos;

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return 'Sin fecha';
        return new Date(fechaStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const jugadoresAMostrar = expandirPlantilla ? jugadores : jugadores.slice(0, 10);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28 lg:pb-12 text-slate-100">
            {/* Botón de retroceso */}
            <div className="mb-6">
                <Link 
                    to="/equipos" 
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Equipos
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMNA IZQUIERDA: Perfil del Equipo */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 flex flex-col items-center shadow-xl shadow-black/30">
                        {/* Logo Wrapper */}
                        <div className="w-40 h-40 rounded-full bg-slate-950/60 p-4 border border-orange-500/20 flex items-center justify-center shadow-inner relative group mb-6">
                            <div className="absolute inset-0 rounded-full bg-orange-500/5 blur-md group-hover:bg-orange-500/10 transition-all duration-300"></div>
                            {equipo.logo ? (
                                <img
                                    src={`http://localhost:5000${equipo.logo}`}
                                    alt={equipo.nombre}
                                    className="w-28 h-28 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-10 transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <span className="text-6xl z-10">🏀</span>
                            )}
                        </div>

                        {/* Nombre */}
                        <h1 className="text-2xl font-extrabold text-white text-center tracking-wide uppercase mb-6 drop-shadow-sm">
                            {equipo.nombre}
                        </h1>

                        {/* Datos Info */}
                        <div className="w-full border-t border-slate-800/80 pt-5 space-y-4">
                            <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/30 hover:border-orange-500/10 transition-colors duration-200">
                                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 flex-shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Entrenador</p>
                                    <p className="text-sm font-semibold text-slate-200 truncate">{equipo.entrenador || 'No asignado'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/30 hover:border-orange-500/10 transition-colors duration-200">
                                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 flex-shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Estadio</p>
                                    <p className="text-sm font-semibold text-slate-200 truncate">{equipo.estadio || 'No asignado'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de Estadísticas Rápida (Desktop) */}
                    <div className="hidden lg:block bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl shadow-black/30">
                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-widest mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Estadísticas de Temporada
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/50 text-center">
                                <p className="text-2xl font-black text-white">{jugados.length}</p>
                                <p className="text-[10px] uppercase text-slate-500 font-bold mt-1">Jugados</p>
                            </div>
                            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/50 text-center">
                                <p className="text-2xl font-black text-orange-500">{pendientes.length}</p>
                                <p className="text-[10px] uppercase text-slate-500 font-bold mt-1">Pendientes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Contenido Principal */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Control de Pestañas (Tabs Switcher) */}
                    <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-1.5 border border-slate-850 flex gap-2">
                        <button 
                            className={`flex-1 py-3 px-4 text-xs font-bold uppercase rounded-lg transition-all duration-200 ${activeTab === 'plantilla' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
                            onClick={() => setActiveTab('plantilla')}
                        >
                            Plantilla
                        </button>
                        <button 
                            className={`flex-1 py-3 px-4 text-xs font-bold uppercase rounded-lg transition-all duration-200 ${activeTab === 'partidos' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
                            onClick={() => setActiveTab('partidos')}
                        >
                            Partidos
                        </button>
                        <button 
                            className={`flex-1 py-3 px-4 text-xs font-bold uppercase rounded-lg transition-all duration-200 ${activeTab === 'estadisticas' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
                            onClick={() => setActiveTab('estadisticas')}
                        >
                            Estadísticas
                        </button>
                    </div>

                    {/* PANEL DE CONTENIDO */}
                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl shadow-black/30 min-h-[400px]">
                        
                        {/* TAB 1: PLANTILLA */}
                        {activeTab === 'plantilla' && (
                            <div>
                                <div className="flex items-center gap-2 mb-6 border-b border-slate-800/60 pb-4">
                                    <Users className="w-5 h-5 text-orange-500" />
                                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Jugadores del Equipo</h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-800/60 text-slate-400 font-semibold text-left">
                                                <th className="p-3 px-4">Jugador</th>
                                                <th className="p-3 px-4 text-center">Categoría</th>
                                                <th className="p-3 px-4 text-right">Dorsal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/30">
                                            {jugadores.length > 0 ? (
                                                jugadoresAMostrar.map(j => (
                                                    <tr key={j.id} className="hover:bg-slate-800/10 transition-colors">
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-850 flex-shrink-0">
                                                                    <User className="w-3.5 h-3.5" />
                                                                </div>
                                                                <span className="font-semibold text-slate-200">{j.nombre_apellido}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{j.categoria || '—'}</td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 font-black text-sm border border-orange-500/10">
                                                                {j.dorsal ?? '—'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="py-12 text-center text-slate-500 font-medium italic">
                                                        Sin jugadores registrados
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {jugadores.length > 10 && (
                                    <button 
                                        className="w-full mt-4 py-3 px-4 rounded-xl border border-slate-800 bg-slate-950/20 text-slate-400 hover:text-white hover:border-slate-700 font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2"
                                        onClick={() => setExpandirPlantilla(!expandirPlantilla)}
                                    >
                                        <Users className="w-4 h-4" />
                                        {expandirPlantilla ? 'Mostrar menos' : 'Ver plantilla completa'}
                                        {expandirPlantilla ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* TAB 2: PARTIDOS (JUGADOS Y PENDIENTES) */}
                        {activeTab === 'partidos' && (
                            <div className="space-y-8">
                                {/* PARTIDOS JUGADOS */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-orange-500" />
                                            <h2 className="text-md font-bold text-white uppercase tracking-wider">Partidos Jugados</h2>
                                        </div>
                                        <Link
                                            to={`/partidos?equipo=${encodeURIComponent(equipo.nombre)}`}
                                            className="text-xs text-orange-500 hover:text-orange-400 font-semibold transition-colors"
                                        >
                                            Ver mas partidos &gt;
                                        </Link>
                                    </div>

                                    <div className="space-y-3">
                                        {jugados && jugados.length > 0 ? (
                                            jugados.map(p => (
                                                <div key={p.id} className="flex flex-col sm:flex-row items-center justify-between bg-slate-950/20 border border-slate-850 hover:border-slate-800 transition-all rounded-xl p-4 gap-4">
                                                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 flex-1">
                                                        <a 
                                                            href={`/partido/${p.id}`} 
                                                            className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        {/* Local */}
                                                        <div className="flex items-center gap-3 w-5/12 sm:w-[150px] justify-end text-right">
                                                            <span className="font-bold text-sm text-slate-200 truncate">{p.local}</span>
                                                            <div className="w-7 h-7 rounded-full bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-sm">
                                                                {p.logo_local ? (
                                                                    <img src={`http://localhost:5000${p.logo_local}`} alt={p.local} className="w-5 h-5 object-contain" />
                                                                ) : (
                                                                    <span className="text-xs">🏀</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Marcador */}
                                                        <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-1.5 font-black text-sm text-white text-center select-none shadow-sm flex-shrink-0">
                                                            {p.puntos_local ?? 0} - {p.puntos_visitante ?? 0}
                                                        </div>

                                                        {/* Visitante */}
                                                        <div className="flex items-center gap-3 w-5/12 sm:w-[150px]">
                                                            <div className="w-7 h-7 rounded-full bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-sm">
                                                                {p.logo_visitante ? (
                                                                    <img src={`http://localhost:5000${p.logo_visitante}`} alt={p.visitante} className="w-5 h-5 object-contain" />
                                                                ) : (
                                                                    <span className="text-xs">🏀</span>
                                                                )}
                                                            </div>
                                                            <span className="font-bold text-sm text-slate-200 truncate">{p.visitante}</span>
                                                        </div>

                                                    </div>

                                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-xs border-t sm:border-t-0 border-slate-850 pt-2 sm:pt-0 w-full sm:w-auto justify-center">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{formatearFecha(p.fecha)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-8 bg-slate-950/10 border border-dashed border-slate-850 rounded-xl text-slate-550 italic text-sm">
                                                <Trophy className="w-8 h-8 text-slate-700 mb-2 opacity-50" />
                                                Sin partidos jugados
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* PARTIDOS PENDIENTES */}
                                <div className="pt-4">
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-orange-500" />
                                            <h2 className="text-md font-bold text-white uppercase tracking-wider">Próximos Encuentros</h2>
                                        </div>
                                        <Link
                                            to={`/partidos?equipo=${encodeURIComponent(equipo.nombre)}`}
                                            className="text-xs text-orange-500 hover:text-orange-400 font-semibold transition-colors"
                                        >
                                            Ver mas partidos &gt;
                                        </Link>
                                    </div>

                                    <div className="space-y-3">
                                        {pendientes && pendientes.length > 0 ? (
                                            pendientes.map(p => (
                                                <div key={p.id} className="flex flex-col sm:flex-row items-center justify-between bg-slate-950/20 border border-slate-850 hover:border-slate-800 transition-all rounded-xl p-4 gap-4">
                                                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 flex-1">
                                                        <a 
                                                            href={`/partido/${p.id}`} 
                                                            className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        {/* Local */}
                                                        <div className="flex items-center gap-3 w-5/12 sm:w-[150px] justify-end text-right">
                                                            <span className="font-bold text-sm text-slate-200 truncate">{p.local}</span>
                                                            <div className="w-7 h-7 rounded-full bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-sm">
                                                                {p.logo_local ? (
                                                                    <img src={`http://localhost:5000${p.logo_local}`} alt={p.local} className="w-5 h-5 object-contain" />
                                                                ) : (
                                                                    <span className="text-xs">🏀</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* VS Pill */}
                                                        <div className="border border-orange-500/20 bg-orange-500/5 text-orange-500 rounded-lg px-4 py-1 font-black text-xs uppercase text-center select-none flex-shrink-0">
                                                            VS
                                                        </div>

                                                        {/* Visitante */}
                                                        <div className="flex items-center gap-3 w-5/12 sm:w-[150px]">
                                                            <div className="w-7 h-7 rounded-full bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-sm">
                                                                {p.logo_visitante ? (
                                                                    <img src={`http://localhost:5000${p.logo_visitante}`} alt={p.visitante} className="w-5 h-5 object-contain" />
                                                                ) : (
                                                                    <span className="text-xs">🏀</span>
                                                                )}
                                                            </div>
                                                            <span className="font-bold text-sm text-slate-200 truncate">{p.visitante}</span>
                                                        </div>

                                                    </div>

                                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-xs border-t sm:border-t-0 border-slate-850 pt-2 sm:pt-0 w-full sm:w-auto justify-center">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{formatearFecha(p.fecha)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-8 bg-slate-950/10 border border-dashed border-slate-850 rounded-xl text-slate-550 italic text-sm">
                                                <Clock className="w-8 h-8 text-slate-700 mb-2 opacity-50" />
                                                Sin partidos pendientes
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: ESTADÍSTICAS */}
                        {activeTab === 'estadisticas' && (
                            <div>
                                <div className="flex items-center gap-2 mb-6 border-b border-slate-800/60 pb-4">
                                    <BarChart3 className="w-5 h-5 text-orange-500" />
                                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Estadísticas del Equipo</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex justify-between items-center p-4 bg-slate-950/30 rounded-xl border border-slate-850">
                                        <span className="text-slate-400 font-medium text-sm">Partidos Jugados (PJ)</span>
                                        <span className="text-lg font-black text-white">{jugados.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-950/30 rounded-xl border border-slate-850">
                                        <span className="text-slate-400 font-medium text-sm">Partidos Pendientes</span>
                                        <span className="text-lg font-black text-orange-500">{pendientes.length}</span>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 flex-shrink-0">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-0.5">Estadísticas Detalladas</h4>
                                        <p className="text-xs text-slate-400">Las estadísticas individuales de jugadores y rendimientos en partido se actualizan en tiempo real al finalizar cada jornada oficial.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default DetalleEquipo;