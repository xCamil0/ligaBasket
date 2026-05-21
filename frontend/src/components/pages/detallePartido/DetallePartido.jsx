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
                    {formatearFechaCompleta(partido.fecha, partido.horario, partido.lugar)}
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
                        {partido.finalizado ? 'FINALIZADO' : 'PENDIENTE'}
                    </span>
                </div>

                {/* Alineaciones y estadísticas de jugadores */}
                <h2 className="seccion-subtitulo">ALINEACIONES Y ESTADÍSTICAS DE JUGADORES</h2>

                <div className="alineaciones-grid-detalle">
                    {/* Alineación Local */}
                    <div className="caja-alineacion">
                        <h3 className="titulo-caja-alineacion">Alineación de {partido.local}</h3>
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
                        <h3 className="titulo-caja-alineacion">Alineación de {partido.visitante}</h3>
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

                {/* Posiciones en la tabla comparativa */}
                {localStats && visitanteStats && (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default DetallePartido;
