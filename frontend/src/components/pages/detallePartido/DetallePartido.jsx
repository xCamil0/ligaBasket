import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './DetallePartido.css';

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
            <div className="detalle-partido-loading">
                <div className="loading-spinner"></div>
                <p>Cargando detalles del partido...</p>
            </div>
        );
    }

    if (!partido) {
        return (
            <div className="detalle-partido-loading">
                <p>No se encontró el partido o hubo un error al cargar.</p>
            </div>
        );
    }

    // Formatear la cabecera (Fecha — Hora — Lugar)
    const formatearFechaCompleta = (fechaStr, horarioStr, lugarStr) => {
        if (!fechaStr) return '';
        const date = new Date(fechaStr);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        const fechaFormateada = date.toLocaleDateString('es-ES', opciones).toUpperCase();
        
        let res = fechaFormateada;
        if (horarioStr) {
            res += ` — ${horarioStr.substring(0, 5)} HS`;
        }
        if (lugarStr) {
            res += ` — ${lugarStr.toUpperCase()}`;
        }
        return res;
    };

    // Separar jugadores por equipo
    const jugadoresLocal = jugadores.filter(j => j.equipo_id === partido.id_equipo_local);
    const jugadoresVisitante = jugadores.filter(j => j.equipo_id === partido.id_equipo_visitante);

    // Obtener estadísticas de standings para ambos equipos
    const localStats = standings.find(t => t.id === partido.id_equipo_local);
    const visitanteStats = standings.find(t => t.id === partido.id_equipo_visitante);

    const posLocal = standings.findIndex(t => t.id === partido.id_equipo_local) + 1;
    const posVisitante = standings.findIndex(t => t.id === partido.id_equipo_visitante) + 1;

    return (
        <div className="contenedor-pagina">
            <div className="contenedor-central">
                <h1 className="titulo-detalle-partido">Detalles del Partido</h1>

                {/* Cabecera del encuentro (Fecha, hora y estadio) */}
                <div className="meta-partido">
                    {partido.fecha && (
                        <span className="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            {new Date(partido.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                        </span>
                    )}
                    {partido.horario && <span className="meta-dot">•</span>}
                    {partido.horario && (
                        <span className="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {partido.horario.substring(0, 5)} HS
                        </span>
                    )}
                    {partido.lugar && <span className="meta-dot">•</span>}
                    {partido.lugar && (
                        <span className="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            {partido.lugar.toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Marcador / Tarjeta principal del partido */}
                <div className="tarjeta-principal-partido">
                    <div className="equipo-detalle local">
                        <span className="nombre-equipo-detalle">{partido.local}</span>
                        <div className="logo-equipo-detalle-wrapper">
                            {partido.logo_local ? (
                                <img src={`http://localhost:5000${partido.logo_local}`} alt={partido.local} className="logo-equipo-detalle-img" />
                            ) : (
                                <div className="logo-equipo-detalle-placeholder">🏀</div>
                            )}
                        </div>
                    </div>

                    <div className="vs-marcador-detalle-container">
                        {partido.finalizado && partido.puntos_local !== null ? (
                            <div className="marcador-detalle-numeros">
                                <span>{partido.puntos_local}</span>
                                <span className="separador">-</span>
                                <span>{partido.puntos_visitante}</span>
                            </div>
                        ) : (
                            <div className="vs-badge-detalle">VERSUS</div>
                        )}
                    </div>

                    <div className="equipo-detalle visitante">
                        <div className="logo-equipo-detalle-wrapper">
                            {partido.logo_visitante ? (
                                <img src={`http://localhost:5000${partido.logo_visitante}`} alt={partido.visitante} className="logo-equipo-detalle-img" />
                            ) : (
                                <div className="logo-equipo-detalle-placeholder">🏀</div>
                            )}
                        </div>
                        <span className="nombre-equipo-detalle">{partido.visitante}</span>
                    </div>
                </div>

                {/* Estado del Partido (Pendiente/Finalizado) */}
                <div className="contenedor-estado-badge">
                    <span className={`estado-badge-detalle ${partido.finalizado ? 'finalizado' : 'pendiente'}`}>
                        {partido.finalizado ? (
                            <>
                                FINALIZADO
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </>
                        ) : 'PENDIENTE'}
                    </span>
                </div>

                {/* Tab Switcher (Visible on Mobile/Tablet) */}
                <div className="detalle-partido-tab-switcher">
                    <button 
                        className={`detalle-partido-tab-btn ${activeTab === 'alineaciones' ? 'active' : ''}`}
                        onClick={() => setActiveTab('alineaciones')}
                    >
                        ALINEACIONES
                    </button>
                    <button 
                        className={`detalle-partido-tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('estadisticas')}
                    >
                        ESTADÍSTICAS
                    </button>
                    <button 
                        className={`detalle-partido-tab-btn ${activeTab === 'posiciones' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posiciones')}
                    >
                        POSICIONES
                    </button>
                </div>

                {/* Alineaciones y estadísticas de jugadores */}
                <div className={`seccion-detalle-tab-content ${activeTab === 'alineaciones' ? 'active-mobile' : 'inactive-mobile'}`}>
                    <h2 className="seccion-subtitulo desktop-only">ALINEACIONES Y ESTADÍSTICAS DE JUGADORES</h2>

                    <div className="alineaciones-grid-detalle">
                        {/* Alineación Local */}
                        <div className="caja-alineacion">
                            <h3 className="titulo-caja-alineacion">
                                {partido.logo_local ? (
                                    <img src={`http://localhost:5000${partido.logo_local}`} alt="" className="logo-alineacion-header" />
                                ) : (
                                    <span className="logo-alineacion-placeholder">🏀</span>
                                )}
                                <span>{partido.local}</span>
                            </h3>
                            <div className="lista-jugadores-detalle">
                                {jugadoresLocal.length > 0 ? (
                                    jugadoresLocal.map(j => (
                                        <div key={j.id} className="fila-jugador-detalle">
                                            <div className="dorsal-nombre-detalle">
                                                <span className="dorsal-detalle">{j.dorsal ?? '—'}</span>
                                                <span className="nombre-detalle">{j.nombre_apellido}</span>
                                            </div>
                                            <span className="puntos-detalle">
                                                {partido.finalizado ? `${j.puntos} pts` : '—'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="lista-vacia-detalle">No hay jugadores registrados en este equipo</div>
                                )}
                            </div>
                        </div>

                        {/* Alineación Visitante */}
                        <div className="caja-alineacion">
                            <h3 className="titulo-caja-alineacion">
                                {partido.logo_visitante ? (
                                    <img src={`http://localhost:5000${partido.logo_visitante}`} alt="" className="logo-alineacion-header" />
                                ) : (
                                    <span className="logo-alineacion-placeholder">🏀</span>
                                )}
                                <span>{partido.visitante}</span>
                            </h3>
                            <div className="lista-jugadores-detalle">
                                {jugadoresVisitante.length > 0 ? (
                                    jugadoresVisitante.map(j => (
                                        <div key={j.id} className="fila-jugador-detalle">
                                            <div className="dorsal-nombre-detalle">
                                                <span className="dorsal-detalle">{j.dorsal ?? '—'}</span>
                                                <span className="nombre-detalle">{j.nombre_apellido}</span>
                                            </div>
                                            <span className="puntos-detalle">
                                                {partido.finalizado ? `${j.puntos} pts` : '—'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="lista-vacia-detalle">No hay jugadores registrados en este equipo</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas de comparación */}
                <div className={`seccion-detalle-tab-content ${activeTab === 'estadisticas' ? 'active-mobile' : 'inactive-mobile'} comparacion-estadisticas-seccion`}>
                    <h2 className="seccion-subtitulo">COMPARACIÓN DE EQUIPOS</h2>
                    <div className="estadisticas-comparacion-container">
                        {/* 1. Score / Puntos */}
                        <div className="fila-comparacion-stat">
                            <div className="stat-etiqueta">PUNTOS EN PARTIDO</div>
                            <div className="stat-valores-barra">
                                <span className="stat-valor local">{partido.puntos_local ?? 0}</span>
                                <div className="stat-barra-progreso">
                                    <div className="progreso-local" style={{ width: `${(partido.puntos_local ?? 0) + (partido.puntos_visitante ?? 0) > 0 ? ((partido.puntos_local ?? 0) / ((partido.puntos_local ?? 0) + (partido.puntos_visitante ?? 0))) * 100 : 50}%` }}></div>
                                    <div className="progreso-visitante" style={{ width: `${(partido.puntos_local ?? 0) + (partido.puntos_visitante ?? 0) > 0 ? ((partido.puntos_visitante ?? 0) / ((partido.puntos_local ?? 0) + (partido.puntos_visitante ?? 0))) * 100 : 50}%` }}></div>
                                </div>
                                <span className="stat-valor visitante">{partido.puntos_visitante ?? 0}</span>
                            </div>
                        </div>

                        {/* 2. Puntos en la tabla */}
                        {localStats && visitanteStats && (
                            <>
                                <div className="fila-comparacion-stat">
                                    <div className="stat-etiqueta">PUNTOS EN LA TABLA</div>
                                    <div className="stat-valores-barra">
                                        <span className="stat-valor local">{localStats.pts}</span>
                                        <div className="stat-barra-progreso">
                                            <div className="progreso-local" style={{ width: `${(localStats.pts + visitanteStats.pts) > 0 ? (localStats.pts / (localStats.pts + visitanteStats.pts)) * 100 : 50}%` }}></div>
                                            <div className="progreso-visitante" style={{ width: `${(localStats.pts + visitanteStats.pts) > 0 ? (visitanteStats.pts / (localStats.pts + visitanteStats.pts)) * 100 : 50}%` }}></div>
                                        </div>
                                        <span className="stat-valor visitante">{visitanteStats.pts}</span>
                                    </div>
                                </div>

                                {/* 3. Partidos Ganados */}
                                <div className="fila-comparacion-stat">
                                    <div className="stat-etiqueta">PARTIDOS GANADOS</div>
                                    <div className="stat-valores-barra">
                                        <span className="stat-valor local">{localStats.g}</span>
                                        <div className="stat-barra-progreso">
                                            <div className="progreso-local" style={{ width: `${(localStats.g + visitanteStats.g) > 0 ? (localStats.g / (localStats.g + visitanteStats.g)) * 100 : 50}%` }}></div>
                                            <div className="progreso-visitante" style={{ width: `${(localStats.g + visitanteStats.g) > 0 ? (visitanteStats.g / (localStats.g + visitanteStats.g)) * 100 : 50}%` }}></div>
                                        </div>
                                        <span className="stat-valor visitante">{visitanteStats.g}</span>
                                    </div>
                                </div>

                                {/* 4. Partidos Perdidos */}
                                <div className="fila-comparacion-stat">
                                    <div className="stat-etiqueta">PARTIDOS PERDIDOS</div>
                                    <div className="stat-valores-barra">
                                        <span className="stat-valor local">{localStats.p}</span>
                                        <div className="stat-barra-progreso">
                                            <div className="progreso-local" style={{ width: `${(localStats.p + visitanteStats.p) > 0 ? (localStats.p / (localStats.p + visitanteStats.p)) * 100 : 50}%` }}></div>
                                            <div className="progreso-visitante" style={{ width: `${(localStats.p + visitanteStats.p) > 0 ? (visitanteStats.p / (localStats.p + visitanteStats.p)) * 100 : 50}%` }}></div>
                                        </div>
                                        <span className="stat-valor visitante">{visitanteStats.p}</span>
                                    </div>
                                </div>

                                {/* 5. Rendimiento (Win Rate %) */}
                                <div className="fila-comparacion-stat">
                                    <div className="stat-etiqueta">RENDIMIENTO (%)</div>
                                    <div className="stat-valores-barra">
                                        <span className="stat-valor local">
                                            {localStats.pj > 0 ? ((localStats.g / localStats.pj) * 100).toFixed(0) : 0}%
                                        </span>
                                        <div className="stat-barra-progreso">
                                            {(() => {
                                                const localWr = localStats.pj > 0 ? (localStats.g / localStats.pj) * 100 : 0;
                                                const visitWr = visitanteStats.pj > 0 ? (visitanteStats.g / visitanteStats.pj) * 100 : 0;
                                                const totalWr = localWr + visitWr;
                                                return (
                                                    <>
                                                        <div className="progreso-local" style={{ width: `${totalWr > 0 ? (localWr / totalWr) * 100 : 50}%` }}></div>
                                                        <div className="progreso-visitante" style={{ width: `${totalWr > 0 ? (visitWr / totalWr) * 100 : 50}%` }}></div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <span className="stat-valor visitante">
                                            {visitanteStats.pj > 0 ? ((visitanteStats.g / visitanteStats.pj) * 100).toFixed(0) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Posiciones en la tabla comparativa */}
                {localStats && visitanteStats && (
                    <div className={`seccion-detalle-tab-content ${activeTab === 'posiciones' ? 'active-mobile' : 'inactive-mobile'}`}>
                        <h2 className="seccion-subtitulo">POSICIONES EN LA TABLA</h2>
                        <div className="contenedor-tabla-detalle">
                            <table className="tabla-posiciones-detalle">
                                <thead className="cabecera-columnas-detalle">
                                    <tr>
                                        <th className="celda-cabecera-detalle text-center">Pos</th>
                                        <th className="celda-cabecera-detalle">Equipo</th>
                                        <th className="celda-cabecera-detalle text-center">PJ</th>
                                        <th className="celda-cabecera-detalle text-center">PG</th>
                                        <th className="celda-cabecera-detalle text-center">PP</th>
                                        <th className="celda-cabecera-detalle text-center">PE</th>
                                        <th className="celda-cabecera-detalle text-center">PTS</th>
                                    </tr>
                                </thead>
                                <tbody className="cuerpo-tabla-detalle">
                                    {/* Local row */}
                                    <tr className="fila-tabla-detalle">
                                        <td className="celda-posicion-detalle">{posLocal}</td>
                                        <td className="celda-equipo-detalle">
                                            <div className="equipo-tabla-logo-nombre">
                                                <img src={`http://localhost:5000${localStats.logo}`} alt="" className="logo-equipo-tabla-detalle" />
                                                <span>{localStats.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="celda-estadistica-detalle">{localStats.pj}</td>
                                        <td className="celda-estadistica-detalle">{localStats.g}</td>
                                        <td className="celda-estadistica-detalle">{localStats.p}</td>
                                        <td className="celda-estadistica-detalle">{localStats.e}</td>
                                        <td className="celda-puntos-detalle">{localStats.pts}</td>
                                    </tr>
                                    {/* Visitor row */}
                                    <tr className="fila-tabla-detalle">
                                        <td className="celda-posicion-detalle">{posVisitante}</td>
                                        <td className="celda-equipo-detalle">
                                            <div className="equipo-tabla-logo-nombre">
                                                <img src={`http://localhost:5000${visitanteStats.logo}`} alt="" className="logo-equipo-tabla-detalle" />
                                                <span>{visitanteStats.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="celda-estadistica-detalle">{visitanteStats.pj}</td>
                                        <td className="celda-estadistica-detalle">{visitanteStats.g}</td>
                                        <td className="celda-estadistica-detalle">{visitanteStats.p}</td>
                                        <td className="celda-estadistica-detalle">{visitanteStats.e}</td>
                                        <td className="celda-puntos-detalle">{visitanteStats.pts}</td>
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
