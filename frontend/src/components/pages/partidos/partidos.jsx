import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './partidos.css';
import axios from 'axios';

const Partidos = () => {
    const [temporadas, setTemporadas] = useState([]);
    const [temporadaId, setTemporadaId] = useState('');
    const [partidos, setPartidos] = useState([]);
    const [jornadas, setJornadas] = useState([]);
    const [jornadaSeleccionada, setJornadaSeleccionada] = useState('');
    const [cargando, setCargando] = useState(false);

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
        const obtenerJornadas = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/partidos/${temporadaId}/jornadas`);
                setJornadas(res.data);
                setJornadaSeleccionada('');
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

    // Formatear fecha y hora
    const formatearFechaHora = (fecha, horario) => {
        if (!fecha) return 'Fecha por definir';

        const fechaObj = new Date(fecha);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        let resultado = fechaObj.toLocaleDateString('es-ES', opciones);

        if (horario) {
            resultado += ` — ${horario.substring(0, 5)} hs`;
        }

        return resultado;
    };

    return (
        <div className="partidos-pagina">
            <div className="partidos-contenedor">

                {/* Título */}
                <h1 className="partidos-titulo">Partidos</h1>

                {/* Selectores */}
                <div className="partidos-selectores">
                    <div className="selector-wrapper">
                        <select
                            id="selector-temporada"
                            className="partidos-selector"
                            value={temporadaId}
                            onChange={(e) => setTemporadaId(e.target.value)}
                        >
                            <option value="" disabled>Seleccione temporada</option>
                            {temporadas.map(temp => (
                                <option key={temp.id} value={temp.id}>{temp.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="selector-wrapper">
                        <select
                            id="selector-jornada"
                            className="partidos-selector"
                            value={jornadaSeleccionada}
                            onChange={(e) => setJornadaSeleccionada(e.target.value)}
                            disabled={jornadas.length === 0}
                        >
                            <option value="">Seleccione jornada</option>
                            {jornadas.map(j => (
                                <option key={j.jornada} value={j.jornada}>Jornada {j.jornada}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Lista de partidos */}
                <div className="partidos-lista">
                    {cargando ? (
                        <div className="partidos-loading">
                            <div className="loading-spinner"></div>
                            <p>Cargando partidos...</p>
                        </div>
                    ) : partidos.length > 0 ? (
                        partidos.map((partido, index) => (
                            <div key={partido.id || index} className="partido-bloque">
                                {/* Fecha, hora y lugar */}
                                <p className="partido-meta">
                                    {formatearFechaHora(partido.fecha, partido.horario)}
                                    {partido.lugar ? ` — ${partido.lugar}` : ''}
                                </p>

                                {/* Tarjeta del partido - Ahora clicable */}
                                <Link to="/equipos" className="partido-tarjeta">
                                    {/* Equipo local */}
                                    <div className="partido-equipo partido-equipo--local">
                                        <span className="partido-nombre">{partido.local || 'Equipo local'}</span>
                                        <div className="partido-logo-wrapper">
                                            {partido.logo_local ? (
                                                <img
                                                    src={`http://localhost:5000${partido.logo_local}`}
                                                    alt={partido.local}
                                                    className="partido-logo"
                                                />
                                            ) : (
                                                <div className="partido-logo-placeholder">
                                                    <span>🏀</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* VS */}
                                    <div className="partido-vs-container">
                                        {partido.finalizado ? (
                                            <div className="partido-marcador">
                                                <span className="marcador-puntos">{partido.puntos_local}</span>
                                                <span className="marcador-separador">-</span>
                                                <span className="marcador-puntos">{partido.puntos_visitante}</span>
                                            </div>
                                        ) : (
                                            <div className="partido-vs">VS</div>
                                        )}
                                    </div>

                                    {/* Equipo visitante */}
                                    <div className="partido-equipo partido-equipo--visitante">
                                        <div className="partido-logo-wrapper">
                                            {partido.logo_visitante ? (
                                                <img
                                                    src={`http://localhost:5000${partido.logo_visitante}`}
                                                    alt={partido.visitante}
                                                    className="partido-logo"
                                                />
                                            ) : (
                                                <div className="partido-logo-placeholder">
                                                    <span>🏀</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="partido-nombre">{partido.visitante || 'Equipo visitante'}</span>
                                    </div>
                                </Link>

                                {/* Badge de estado */}
                                {
                                    partido.finalizado && (
                                        <div className="partido-estado">
                                            <span className="estado-badge finalizado">Finalizado</span>
                                        </div>
                                    )
                                }
                            </div>
                        ))
                    ) : (
                        <div className="partidos-vacio">
                            <span className="vacio-icono">📋</span>
                            <p>No hay partidos registrados para esta selección.</p>
                        </div>
                    )}
                </div>

            </div>
        </div >
    );
};

export default Partidos;