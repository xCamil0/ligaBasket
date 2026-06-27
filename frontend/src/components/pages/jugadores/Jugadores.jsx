import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Award, Activity, HelpCircle } from 'lucide-react';

const Jugadores = () => {
    // Datos generales
    const [jugadores, setJugadores] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState('todos'); // 'todos', 'agentes-libres', o equipo_id
    const [cargando, setCargando] = useState(true);

    // buscador de jugadores por nombre
    const [busqueda, setBusqueda] = useState('');

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [resJugadores, resEquipos] = await Promise.all([
                axios.get('http://localhost:5000/api/jugadores'),
                axios.get('http://localhost:5000/api/equipos')
            ]);
            setJugadores(resJugadores.data);
            setEquipos(resEquipos.data);
        } catch (error) {
            console.error("Error al cargar datos de jugadores:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Filtrar la lista principal
    const jugadoresFiltrados = jugadores.filter(j => {
        const query = busqueda.toLowerCase();
        const nombreCompleto = j.nombre_apellido ? j.nombre_apellido.toLowerCase() : '';
        const nombreEquipo = j.nombre_equipo ? j.nombre_equipo.toLowerCase() : '';
        if (filtroSeleccionado === 'agentes-libres') return j.equipo_id === null;
        return (filtroSeleccionado === 'todos' || j.equipo_id === parseInt(filtroSeleccionado, 10)) &&
               (nombreCompleto.includes(query) || nombreEquipo.includes(query));
    });

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 pb-28 lg:pb-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Mobile Filters Dropdown */}
                <div className="lg:hidden w-full bg-slate-950/40 border border-slate-900 rounded-2xl p-4 mb-2 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider mb-3">
                        <Users className="w-4 h-4" />
                        <span>Filtrar por Equipo</span>
                    </div>
                    <div className="relative">
                        <select 
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none pr-10 cursor-pointer"
                            value={filtroSeleccionado}
                            onChange={(e) => setFiltroSeleccionado(e.target.value)}
                        >
                            <option value="todos">Todos los Jugadores</option>
                            <option value="agentes-libres">Agentes Libres</option>
                            {equipos.map(eq => (
                                <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                            ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Sidebar Izquierdo: Filtros */}
                <aside className="hidden lg:block w-64 shrink-0 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 h-fit backdrop-blur-md">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        Equipos
                    </h2>
                    <ul className="space-y-1.5">
                        <li>
                            <button 
                                className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    filtroSeleccionado === 'todos' 
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/10' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                }`}
                                onClick={() => setFiltroSeleccionado('todos')}
                            >
                                Todos
                            </button>
                        </li>
                        <li>
                            <button 
                                className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    filtroSeleccionado === 'agentes-libres' 
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/10' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                }`}
                                onClick={() => setFiltroSeleccionado('agentes-libres')}
                            >
                                Agentes Libres
                            </button>
                        </li>
                        {equipos.map(eq => (
                            <li key={eq.id}>
                                <button 
                                    className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-xl transition-all cursor-pointer truncate ${
                                        filtroSeleccionado == eq.id 
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/10' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                    }`}
                                    onClick={() => setFiltroSeleccionado(eq.id)}
                                >
                                    {eq.nombre}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Contenido Principal */}
                <main className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-900 pb-5">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Estadísticas de Jugadores</h1>
                            <p className="text-slate-400 text-xs mt-0.5">Puntos totales por temporada y trayectoria</p>
                        </div>
                        
                        <div className="relative w-full md:w-72">
                            <input 
                                type="text" 
                                placeholder="Buscar Jugador" 
                                value={busqueda} 
                                onChange={e => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs font-medium placeholder-slate-500"
                            />
                            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {cargando ? (
                        <div className="py-12 text-center text-slate-500 text-sm font-semibold">
                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            Cargando lista de jugadores...
                        </div>
                    ) : jugadoresFiltrados.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {jugadoresFiltrados.map(jugador => (
                                <div key={jugador.id} className="bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors pointer-events-none" />

                                    <div>
                                        <div className="flex items-start justify-between gap-4 mb-5 border-b border-slate-900/55 pb-4">
                                            <div className="truncate">
                                                <h3 className="text-base font-extrabold text-white group-hover:text-orange-500 transition-colors truncate">{jugador.nombre_apellido}</h3>
                                                <p className="text-[10px] font-bold text-slate-500 tracking-wide mt-1 uppercase">
                                                    {jugador.nombre_equipo || 'Agente Libre'} {jugador.dorsal !== null && `• #${jugador.dorsal}`}
                                                </p>
                                            </div>
                                            <div className="w-11 h-11 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-inner">
                                                {jugador.logo_equipo ? (
                                                    <img 
                                                        src={`http://localhost:5000${jugador.logo_equipo}`} 
                                                        alt={jugador.nombre_equipo} 
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-base">🏀</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <Activity className="w-3.5 h-3.5 text-orange-500" />
                                                    Puntos por Temporada
                                                </h4>
                                                <ul className="space-y-1 bg-slate-950/30 p-3 rounded-xl border border-slate-900/50">
                                                    {jugador.puntos_temporadas && jugador.puntos_temporadas.length > 0 ? (
                                                        jugador.puntos_temporadas.map(pt => (
                                                            <li key={pt.temporada_id} className="flex justify-between items-center text-xs font-semibold">
                                                                <span className="text-slate-400 truncate pr-2">{pt.nombre_temporada}</span>
                                                                <span className="text-orange-500 font-extrabold shrink-0 bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10">{pt.puntos} pts</span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="text-[10px] text-slate-600 text-center font-bold py-1">Sin puntos registrados</li>
                                                    )}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <Award className="w-3.5 h-3.5 text-orange-500" />
                                                    Trayectoria
                                                </h4>
                                                <ul className="space-y-1 bg-slate-950/30 p-3 rounded-xl border border-slate-900/50">
                                                    {jugador.trayectoria && jugador.trayectoria.length > 0 ? (
                                                        jugador.trayectoria.slice(0, 3).map((tr, idx) => (
                                                            <li key={idx} className="flex justify-between items-center text-xs font-semibold">
                                                                <span className="text-slate-300 truncate pr-2">{tr.equipo}</span>
                                                                <span className="text-slate-500 text-[10px] shrink-0">{tr.temporada}</span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="text-[10px] text-slate-600 text-center font-bold py-1">Sin historial registrado</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-12 text-center text-slate-500 text-sm font-medium backdrop-blur-md">
                            <HelpCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                            No se encontraron jugadores que coincidan con la búsqueda.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Jugadores;
