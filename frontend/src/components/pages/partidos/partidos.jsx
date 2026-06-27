import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Clock, CheckCircle2, Search, X } from 'lucide-react';

const Partidos = () => {
    const [temporadas, setTemporadas] = useState([]);
    const [temporadaId, setTemporadaId] = useState('');
    const [partidos, setPartidos] = useState([]);
    const [jornadas, setJornadas] = useState([]);
    const [jornadaSeleccionada, setJornadaSeleccionada] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    // Filtrar partidos dinámicamente por nombre de equipo local o visitante
    const partidosFiltrados = partidos.filter(p => {
        const query = busqueda.toLowerCase();
        const local = p.local ? p.local.toLowerCase() : '';
        const visitante = p.visitante ? p.visitante.toLowerCase() : '';
        return local.includes(query) || visitante.includes(query);
    });

    // Cargar temporadas al montar
    useEffect(() => {
        const cargarTemporadas = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/temporadas');
                setTemporadas(res.data);
                if (res.data.length > 0) {
                    setTemporadaId(res.data[res.data.length - 1].id);
                }
            } catch (error) {
                console.error('Error cargando temporadas:', error);
            }
        };

        cargarTemporadas();
    }, []);

    // Cargar jornadas cuando cambia la temporada
    useEffect(() => {
        if (!temporadaId) return;
        setJornadaSeleccionada('');
        const obtenerJornadas = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/partidos/${temporadaId}/jornadas`);
                setJornadas(res.data);
            } catch (error) {
                console.error('Error cargando jornadas:', error);
                setJornadas([]);
            }
        };
        obtenerJornadas();
    }, [temporadaId]);

    // Cargar partidos cuando cambia la temporada o la jornada
    useEffect(() => {
        if (!temporadaId) {
            setPartidos([]);
            return;
        }
        const obtenerPartidos = async () => {
            try {
                setCargando(true);
                const params = { temporada_id: temporadaId };
                if (jornadaSeleccionada) params.jornada = jornadaSeleccionada;
                const res = await axios.get('http://localhost:5000/api/partidos', { params });
                setPartidos(res.data);
            } catch (error) {
                console.error('Error al traer los partidos:', error);
                setPartidos([]);
            } finally {
                setCargando(false);
            }
        };
        obtenerPartidos();
    }, [temporadaId, jornadaSeleccionada]);

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha por definir';
        const fechaObj = new Date(fecha);
        fechaObj.setMinutes(fechaObj.getMinutes() + fechaObj.getTimezoneOffset());
        const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        return fechaObj.toLocaleDateString('es-ES', opciones).toUpperCase();
    };

    const formatearHora = (horario) => {
        if (!horario) return null;
        return `${horario.substring(0, 5)} HS`;
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 pb-28 lg:pb-12">
            {/* Mobile Filters Bar */}
            <div className="lg:hidden w-full bg-slate-950/40 border border-slate-900 rounded-2xl p-4 mb-6 backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                    <button 
                        className={`flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider py-1 cursor-pointer`}
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        {mostrarFiltros ? 'Ocultar Temp' : 'Temp: Ver Filtros'}
                    </button>
                    
                    <div className="relative flex-grow max-w-xs">
                        <select 
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none pr-10 cursor-pointer" 
                            value={jornadaSeleccionada} 
                            onChange={(e) => setJornadaSeleccionada(e.target.value)} 
                            disabled={jornadas.length === 0}
                        >
                            <option value="">Todas las jornadas</option>
                            {jornadas.map(j => <option key={j.jornada} value={j.jornada}>Jornada {j.jornada}</option>)}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
                
                {mostrarFiltros && (
                    <div className="relative mt-3">
                        <select 
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none pr-10 cursor-pointer" 
                            value={temporadaId} 
                            onChange={(e) => setTemporadaId(e.target.value)}
                        >
                            {temporadas.map(temp => (
                                <option key={temp.id} value={temp.id}>{temp.nombre}</option>
                            ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Izquierdo: Filtros */}
                <aside className="hidden lg:block w-64 shrink-0 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 h-fit backdrop-blur-md">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" /> Temporadas
                    </h2>
                    <ul className="space-y-1.5">
                        {temporadas.map(temp => (
                            <li key={temp.id}>
                                <button 
                                    className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-xl transition-all cursor-pointer truncate ${
                                        temporadaId == temp.id 
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/10' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                    }`}
                                    onClick={() => setTemporadaId(temp.id)}
                                >
                                    {temp.nombre}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-900 pb-5">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Fixture y Calendario</h1>
                            <p className="text-slate-400 text-xs mt-0.5">Programación y resultados oficiales</p>
                        </div>
                        
                        {/* Desktop jornada selector */}
                        <div className="hidden lg:block relative w-56">
                            <select 
                                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none pr-10 cursor-pointer" 
                                value={jornadaSeleccionada} 
                                onChange={(e) => setJornadaSeleccionada(e.target.value)} 
                                disabled={jornadas.length === 0}
                            >
                                <option value="">Todas las jornadas</option>
                                {jornadas.map(j => <option key={j.jornada} value={j.jornada}>Jornada {j.jornada}</option>)}
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Buscador dinámico de partidos */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Buscar partidos por nombre de equipo local o visitante..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-500"
                        />
                        <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        {busqueda && (
                            <button
                                onClick={() => setBusqueda('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {cargando ? (
                            <div className="py-12 text-center text-slate-500 text-sm font-semibold">
                                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                Cargando fixture...
                            </div>
                        ) : partidosFiltrados.length > 0 ? (
                            partidosFiltrados.map((partido, index) => (
                                <div key={partido.id || index} className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

                                    {/* Card header: fecha + estadio */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-[10px] font-bold text-slate-500 tracking-wide border-b border-slate-900/55 pb-3">
                                        <div className="flex items-center gap-1.5 uppercase">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{formatearFecha(partido.fecha)}</span>
                                        </div>
                                        {formatearHora(partido.horario) && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{formatearHora(partido.horario)}</span>
                                            </div>
                                        )}
                                        {partido.lugar && (
                                            <div className="flex items-center gap-1.5 uppercase truncate max-w-[200px]">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                <span className="truncate">{partido.lugar}</span>
                                            </div>
                                        )}
                                        <span className="ml-auto bg-slate-950 px-2 py-0.5 rounded-md border border-slate-900 text-slate-400 font-extrabold uppercase">
                                            Jornada {partido.jornada || '—'}
                                        </span>
                                    </div>

                                    {/* Teams and score */}
                                    <Link to={`/partido/${partido.id}`} className="flex items-center justify-between gap-4 py-2 hover:opacity-95 transition-opacity">
                                        {/* Local */}
                                        <div className="flex items-center gap-3 flex-1 justify-end text-right overflow-hidden">
                                            <span className="text-sm font-extrabold text-slate-200 group-hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none">{partido.local}</span>
                                            <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-inner">
                                                {partido.logo_local ? (
                                                    <img src={`http://localhost:5000${partido.logo_local}`} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <div className="text-sm">🏀</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Score / VS */}
                                        <div className="shrink-0 flex items-center justify-center min-w-[80px]">
                                            {partido.finalizado ? (
                                                <div className="flex items-center gap-2 bg-orange-500/5 border border-orange-500/10 px-4 py-1.5 rounded-xl shadow-inner">
                                                    <span className={`text-base font-black ${partido.puntos_local > partido.puntos_visitante ? 'text-orange-500 font-black' : 'text-slate-400 font-bold'}`}>
                                                        {partido.puntos_local}
                                                    </span>
                                                    <span className="text-xs text-slate-600 font-extrabold">-</span>
                                                    <span className={`text-base font-black ${partido.puntos_visitante > partido.puntos_local ? 'text-orange-500 font-black' : 'text-slate-400 font-bold'}`}>
                                                        {partido.puntos_visitante}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="text-xs font-black text-slate-500 tracking-wider bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-xl">
                                                    VS
                                                </div>
                                            )}
                                        </div>

                                        {/* Visitante */}
                                        <div className="flex items-center gap-3 flex-1 justify-start text-left overflow-hidden">
                                            <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-inner">
                                                {partido.logo_visitante ? (
                                                    <img src={`http://localhost:5000${partido.logo_visitante}`} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <div className="text-sm">🏀</div>
                                                )}
                                            </div>
                                            <span className="text-sm font-extrabold text-slate-200 group-hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none">{partido.visitante}</span>
                                        </div>
                                    </Link>

                                    {/* Status badge */}
                                    {partido.finalizado && (
                                        <div className="mt-4 pt-3 border-t border-slate-900/55 flex justify-end">
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Finalizado
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-12 text-center text-slate-500 text-sm font-medium backdrop-blur-md">
                                <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                {partidos.length > 0 ? "No se encontraron partidos que coincidan con la búsqueda." : "No hay partidos programados."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Partidos;