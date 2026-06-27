import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, Trophy, BarChart3, ListOrdered, ShieldAlert, ArrowLeft, Check, Users } from 'lucide-react';

const DetallePartido = () => {
    const { id } = useParams();
    const [partido, setPartido] = useState(null);
    const [jugadores, setJugadores] = useState([]);
    const [standings, setStandings] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [activeTab, setActiveTab] = useState('alineaciones');

    useEffect(() => {
        const cargarDetalles = async () => {
            try {
                setCargando(true);
                // 1. Obtener detalles del partido
                const resPartido = await axios.get(`http://localhost:5000/api/partidos/detalle/${id}`);
                const partidoData = resPartido.data;
                setPartido(partidoData);

                // 2. Obtener jugadores y sus anotaciones
                const resJugadores = await axios.get(`http://localhost:5000/api/partidos/${id}/jugadores`);
                setJugadores(resJugadores.data);

                // 3. Obtener tabla de posiciones de la temporada correspondiente
                if (partidoData.temporada_id) {
                    const resTabla = await axios.get('http://localhost:5000/api/tabla', {
                        params: { temporada_id: partidoData.temporada_id }
                    });
                    setStandings(resTabla.data);
                }
            } catch (error) {
                console.error("Error al cargar detalles del partido:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarDetalles();
    }, [id]);

    if (cargando) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                    <p className="text-slate-400 font-medium">Cargando detalles del partido...</p>
                </div>
            </div>
        );
    }

    if (!partido) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="text-center bg-slate-950/40 border border-slate-900 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm">
                    <ShieldAlert className="w-12 h-12 text-orange-500 mx-auto mb-4 opacity-80" />
                    <p className="text-white text-lg font-bold mb-2">No se encontró el partido</p>
                    <p className="text-slate-400 text-sm mb-6">El partido que estás buscando no existe o ha sido eliminado.</p>
                    <Link to="/partidos" className="inline-flex items-center justify-center px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20">
                        Volver a Partidos
                    </Link>
                </div>
            </div>
        );
    }

    // Separar jugadores por equipo
    const jugadoresLocal = jugadores.filter(j => j.equipo_id === partido.id_equipo_local);
    const jugadoresVisitante = jugadores.filter(j => j.equipo_id === partido.id_equipo_visitante);

    // Obtener estadísticas de standings para ambos equipos
    const localStats = standings.find(t => t.id === partido.id_equipo_local);
    const visitanteStats = standings.find(t => t.id === partido.id_equipo_visitante);

    const posLocal = standings.findIndex(t => t.id === partido.id_equipo_local) + 1;
    const posVisitante = standings.findIndex(t => t.id === partido.id_equipo_visitante) + 1;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 pb-28 lg:pb-12 text-slate-100">
            {/* Botón retroceso */}
            <div className="mb-6">
                <Link 
                    to="/partidos" 
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Partidos
                </Link>
            </div>

            <h1 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">Detalles del Partido</h1>

            {/* Cabecera del encuentro (Fecha, hora y estadio) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-6 bg-slate-900/30 rounded-xl p-4 border border-slate-800/40">
                {partido.fecha && (
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {new Date(partido.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                    </span>
                )}
                {partido.horario && <span className="text-slate-700 hidden sm:inline">•</span>}
                {partido.horario && (
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {partido.horario.substring(0, 5)} HS
                    </span>
                )}
                {partido.lugar && <span className="text-slate-700 hidden sm:inline">•</span>}
                {partido.lugar && (
                    <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        {partido.lugar.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Marcador / Tarjeta principal del partido */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 md:p-8 flex items-center justify-between shadow-xl shadow-black/35 mb-6">
                
                {/* Equipo Local */}
                <div className="flex flex-col md:flex-row items-center gap-4 w-5/12 text-center md:text-left">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-950/60 p-2 md:p-3.5 border border-slate-800 flex items-center justify-center shadow-md flex-shrink-0">
                        {partido.logo_local ? (
                            <img src={`http://localhost:5000${partido.logo_local}`} alt={partido.local} className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                        ) : (
                            <div className="text-3xl">🏀</div>
                        )}
                    </div>
                    <span className="font-extrabold text-sm md:text-lg text-white uppercase tracking-wide truncate max-w-full">
                        {partido.local}
                    </span>
                </div>

                {/* Score / VS Center Area */}
                <div className="flex flex-col items-center justify-center w-2/12 px-2 flex-shrink-0">
                    {partido.finalizado && partido.puntos_local !== null ? (
                        <div className="flex items-center justify-center gap-2 md:gap-4 select-none">
                            <span className="text-2xl md:text-4xl font-black text-white">{partido.puntos_local}</span>
                            <span className="text-slate-500 font-bold">-</span>
                            <span className="text-2xl md:text-4xl font-black text-white">{partido.puntos_visitante}</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full font-black text-xs uppercase tracking-widest select-none">
                            VS
                        </div>
                    )}
                </div>

                {/* Equipo Visitante */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-4 w-5/12 text-center md:text-right">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-950/60 p-2 md:p-3.5 border border-slate-800 flex items-center justify-center shadow-md flex-shrink-0">
                        {partido.logo_visitante ? (
                            <img src={`http://localhost:5000${partido.logo_visitante}`} alt={partido.visitante} className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                        ) : (
                            <div className="text-3xl">🏀</div>
                        )}
                    </div>
                    <span className="font-extrabold text-sm md:text-lg text-white uppercase tracking-wide truncate max-w-full">
                        {partido.visitante}
                    </span>
                </div>

            </div>

            {/* Estado del Partido */}
            <div className="flex justify-center mb-8">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${partido.finalizado ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                    {partido.finalizado ? (
                        <>
                            Finalizado
                            <Check className="w-3.5 h-3.5" />
                        </>
                    ) : 'Pendiente'}
                </span>
            </div>

            {/* TAB SWITCHER */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-1.5 border border-slate-850 flex gap-2 mb-6">
                <button 
                    className={`flex-1 py-3 px-4 text-xs font-bold uppercase rounded-lg transition-all duration-200 ${activeTab === 'alineaciones' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
                    onClick={() => setActiveTab('alineaciones')}
                >
                    Alineaciones
                </button>
                <button 
                    className={`flex-1 py-3 px-4 text-xs font-bold uppercase rounded-lg transition-all duration-200 ${activeTab === 'estadisticas' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
                    onClick={() => setActiveTab('estadisticas')}
                >
                    Estadísticas
                </button>
                {localStats && visitanteStats && (
                    <button 
                        className={`flex-1 py-3 px-4 text-xs font-bold uppercase rounded-lg transition-all duration-200 ${activeTab === 'posiciones' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
                        onClick={() => setActiveTab('posiciones')}
                    >
                        Posiciones
                    </button>
                )}
            </div>

            {/* CONTENIDO DE PESTAÑAS */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl shadow-black/30 min-h-[350px]">
                
                {/* TAB 1: ALINEACIONES Y PUNTOS */}
                {activeTab === 'alineaciones' && (
                    <div>
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-800/60 pb-4">
                            <Users className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Alineación y Anotaciones</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Local Team */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2.5 text-md font-extrabold text-white pb-2.5 border-b border-slate-800/40">
                                    <div className="w-6 h-6 rounded-full bg-white p-0.5 flex-shrink-0 flex items-center justify-center">
                                        {partido.logo_local ? (
                                            <img src={`http://localhost:5000${partido.logo_local}`} alt="" className="w-4 h-4 object-contain" />
                                        ) : (
                                            <span className="text-xs">🏀</span>
                                        )}
                                    </div>
                                    <span>{partido.local}</span>
                                </h3>

                                <div className="space-y-2">
                                    {jugadoresLocal.length > 0 ? (
                                        jugadoresLocal.map(j => (
                                            <div key={j.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-slate-850 hover:bg-slate-800/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 font-extrabold text-xs border border-orange-500/10">
                                                        {j.dorsal ?? '—'}
                                                    </span>
                                                    <span className="font-semibold text-sm text-slate-200">{j.nombre_apellido}</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-400">
                                                    {partido.finalizado ? `${j.puntos} pts` : '—'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 italic py-4">No hay jugadores registrados en este equipo</p>
                                    )}
                                </div>
                            </div>

                            {/* Visitante Team */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2.5 text-md font-extrabold text-white pb-2.5 border-b border-slate-800/40">
                                    <div className="w-6 h-6 rounded-full bg-white p-0.5 flex-shrink-0 flex items-center justify-center">
                                        {partido.logo_visitante ? (
                                            <img src={`http://localhost:5000${partido.logo_visitante}`} alt="" className="w-4 h-4 object-contain" />
                                        ) : (
                                            <span className="text-xs">🏀</span>
                                        )}
                                    </div>
                                    <span>{partido.visitante}</span>
                                </h3>

                                <div className="space-y-2">
                                    {jugadoresVisitante.length > 0 ? (
                                        jugadoresVisitante.map(j => (
                                            <div key={j.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-slate-850 hover:bg-slate-800/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 font-extrabold text-xs border border-blue-500/10">
                                                        {j.dorsal ?? '—'}
                                                    </span>
                                                    <span className="font-semibold text-sm text-slate-200">{j.nombre_apellido}</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-400">
                                                    {partido.finalizado ? `${j.puntos} pts` : '—'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 italic py-4">No hay jugadores registrados en este equipo</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: ESTADÍSTICAS COMPARATIVAS */}
                {activeTab === 'estadisticas' && (
                    <div>
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-800/60 pb-4">
                            <BarChart3 className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Comparación de Rendimiento</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Puntos en partido */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                                    <span>{partido.local}</span>
                                    <span>Puntos Partido</span>
                                    <span>{partido.visitante}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="w-8 text-center text-sm font-black text-white">{partido.puntos_local ?? 0}</span>
                                    <div className="h-2.5 w-full bg-slate-950/60 rounded-full overflow-hidden flex border border-slate-800/40">
                                        {(() => {
                                            const total = (partido.puntos_local ?? 0) + (partido.puntos_visitante ?? 0);
                                            const localPct = total > 0 ? ((partido.puntos_local ?? 0) / total) * 100 : 50;
                                            const visitPct = 100 - localPct;
                                            return (
                                                <>
                                                    <div className="bg-orange-500 rounded-l-full transition-all duration-500" style={{ width: `${localPct}%` }}></div>
                                                    <div className="bg-blue-500 rounded-r-full transition-all duration-500" style={{ width: `${visitPct}%` }}></div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <span className="w-8 text-center text-sm font-black text-white">{partido.puntos_visitante ?? 0}</span>
                                </div>
                            </div>

                            {localStats && visitanteStats && (
                                <>
                                    {/* Puntos en Tabla */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                                            <span>{localStats.pts}</span>
                                            <span>Puntos Tabla</span>
                                            <span>{visitanteStats.pts}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 text-center text-sm font-black text-orange-500">{localStats.pts}</span>
                                            <div className="h-2.5 w-full bg-slate-950/60 rounded-full overflow-hidden flex border border-slate-800/40">
                                                {(() => {
                                                    const total = localStats.pts + visitanteStats.pts;
                                                    const localPct = total > 0 ? (localStats.pts / total) * 100 : 50;
                                                    const visitPct = 100 - localPct;
                                                    return (
                                                        <>
                                                            <div className="bg-orange-500 rounded-l-full" style={{ width: `${localPct}%` }}></div>
                                                            <div className="bg-blue-500 rounded-r-full" style={{ width: `${visitPct}%` }}></div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <span className="w-8 text-center text-sm font-black text-blue-400">{visitanteStats.pts}</span>
                                        </div>
                                    </div>

                                    {/* PG */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                                            <span>{localStats.g}</span>
                                            <span>Partidos Ganados</span>
                                            <span>{visitanteStats.g}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 text-center text-sm font-black text-orange-500">{localStats.g}</span>
                                            <div className="h-2.5 w-full bg-slate-950/60 rounded-full overflow-hidden flex border border-slate-800/40">
                                                {(() => {
                                                    const total = localStats.g + visitanteStats.g;
                                                    const localPct = total > 0 ? (localStats.g / total) * 100 : 50;
                                                    const visitPct = 100 - localPct;
                                                    return (
                                                        <>
                                                            <div className="bg-orange-500 rounded-l-full" style={{ width: `${localPct}%` }}></div>
                                                            <div className="bg-blue-500 rounded-r-full" style={{ width: `${visitPct}%` }}></div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <span className="w-8 text-center text-sm font-black text-blue-400">{visitanteStats.g}</span>
                                        </div>
                                    </div>

                                    {/* PP */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                                            <span>{localStats.p}</span>
                                            <span>Partidos Perdidos</span>
                                            <span>{visitanteStats.p}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 text-center text-sm font-black text-orange-500">{localStats.p}</span>
                                            <div className="h-2.5 w-full bg-slate-950/60 rounded-full overflow-hidden flex border border-slate-800/40">
                                                {(() => {
                                                    const total = localStats.p + visitanteStats.p;
                                                    const localPct = total > 0 ? (localStats.p / total) * 100 : 50;
                                                    const visitPct = 100 - localPct;
                                                    return (
                                                        <>
                                                            <div className="bg-orange-500 rounded-l-full" style={{ width: `${localPct}%` }}></div>
                                                            <div className="bg-blue-500 rounded-r-full" style={{ width: `${visitPct}%` }}></div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <span className="w-8 text-center text-sm font-black text-blue-400">{visitanteStats.p}</span>
                                        </div>
                                    </div>

                                    {/* Rendimiento */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                                            <span>{localStats.pj > 0 ? ((localStats.g / localStats.pj) * 100).toFixed(0) : 0}%</span>
                                            <span>Rendimiento PG/PJ</span>
                                            <span>{visitanteStats.pj > 0 ? ((visitanteStats.g / visitanteStats.pj) * 100).toFixed(0) : 0}%</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 text-center text-sm font-black text-orange-500">{localStats.pj > 0 ? ((localStats.g / localStats.pj) * 100).toFixed(0) : 0}%</span>
                                            <div className="h-2.5 w-full bg-slate-950/60 rounded-full overflow-hidden flex border border-slate-800/40">
                                                {(() => {
                                                    const localWr = localStats.pj > 0 ? (localStats.g / localStats.pj) * 100 : 0;
                                                    const visitWr = visitanteStats.pj > 0 ? (visitanteStats.g / visitanteStats.pj) * 100 : 0;
                                                    const totalWr = localWr + visitWr;
                                                    const localPct = totalWr > 0 ? (localWr / totalWr) * 100 : 50;
                                                    const visitPct = 100 - localPct;
                                                    return (
                                                        <>
                                                            <div className="bg-orange-500 rounded-l-full" style={{ width: `${localPct}%` }}></div>
                                                            <div className="bg-blue-500 rounded-r-full" style={{ width: `${visitPct}%` }}></div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <span className="w-8 text-center text-sm font-black text-blue-400">{visitanteStats.pj > 0 ? ((visitanteStats.g / visitanteStats.pj) * 100).toFixed(0) : 0}%</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: POSICIONES EN LA TABLA */}
                {activeTab === 'posiciones' && localStats && visitanteStats && (
                    <div>
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-800/60 pb-4">
                            <ListOrdered className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Posición en la Tabla</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                                        <th className="p-3 px-4 text-center w-16">Pos</th>
                                        <th className="p-3 px-4">Equipo</th>
                                        <th className="p-3 px-4 text-center">PJ</th>
                                        <th className="p-3 px-4 text-center">PG</th>
                                        <th className="p-3 px-4 text-center">PP</th>
                                        <th className="p-3 px-4 text-center">PE</th>
                                        <th className="p-3 px-4 text-center text-orange-500">PTS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {/* Local row */}
                                    <tr className="hover:bg-slate-800/10 transition-colors">
                                        <td className="py-4 px-4 text-center font-bold text-slate-400">{posLocal}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-white p-1 flex-shrink-0 flex items-center justify-center">
                                                    <img src={`http://localhost:5000${localStats.logo}`} alt="" className="w-5 h-5 object-contain" />
                                                </div>
                                                <span className="font-extrabold text-slate-200">{localStats.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center text-slate-300 font-semibold">{localStats.pj}</td>
                                        <td className="py-4 px-4 text-center text-slate-300 font-semibold">{localStats.g}</td>
                                        <td className="py-4 px-4 text-center text-slate-300 font-semibold">{localStats.p}</td>
                                        <td className="py-4 px-4 text-center text-slate-300 font-semibold">{localStats.e}</td>
                                        <td className="py-4 px-4 text-center text-orange-500 font-black text-md">{localStats.pts}</td>
                                    </tr>
                                    {/* Visitor row */}
                                    <tr className="hover:bg-slate-800/10 transition-colors">
                                        <td className="py-4 px-4 text-center font-bold text-slate-400">{posVisitante}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-white p-1 flex-shrink-0 flex items-center justify-center">
                                                    <img src={`http://localhost:5000${visitanteStats.logo}`} alt="" className="w-5 h-5 object-contain" />
                                                </div>
                                                <span className="font-extrabold text-slate-200">{visitanteStats.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center text-slate-300 font-semibold">{visitanteStats.pj}</td>
                                        <td className="py-4 px-4 text-center text-slate-300 font-semibold">{visitanteStats.g}</td>
                                        <td className="py-4 px-4 text-center text-slate-300 font-semibold">{visitanteStats.p}</td>
                                        <td className="py-4 px-4 text-center text-slate-300 font-semibold">{visitanteStats.e}</td>
                                        <td className="py-4 px-4 text-center text-orange-500 font-black text-md">{visitanteStats.pts}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DetallePartido;
