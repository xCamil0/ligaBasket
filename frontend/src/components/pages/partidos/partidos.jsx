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

    const [jornadasForm, setJornadasForm] = useState([]);
    // Estados de Administración
    const [isAdmin, setIsAdmin] = useState(false);
    const [modalActivo, setModalActivo] = useState(null);
    const [equipos, setEquipos] = useState([]);
    const [jugadoresPartido, setJugadoresPartido] = useState([]);
    const [anotaciones, setAnotaciones] = useState([]);
    const [partidoSeleccionado, setPartidoSeleccionado] = useState('');
    const [formData, setFormData] = useState({
        temporada_id: '',
        jornada: '',
        id_equipo_local: '',
        id_equipo_visitante: '',
        fecha: '',
        horario: '',
        lugar: '',
        puntos_local: '',
        puntos_visitante: ''
    });

    // Cargar temporadas al montar
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setIsAdmin(true);

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

        const cargarEquipos = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/equipos');
                setEquipos(res.data.data || res.data);
            } catch (error) {
                console.error('Error cargando equipos:', error);
            }
        };

        cargarTemporadas();
        cargarEquipos();
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

    // Cargar jornadas para el formulario cuando cambia la temporada seleccionada en el modal
    useEffect(() => {
        if (!formData.temporada_id || formData.temporada_id === 'disabled') {
            setJornadasForm([]);
            return;
        }
        const obtenerJornadasForm = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/partidos/${formData.temporada_id}/jornadas`);
                setJornadasForm(res.data);
            } catch (error) {
                console.error('Error cargando jornadas para el form:', error);
                setJornadasForm([]);
            }
        };
        obtenerJornadasForm();
    }, [formData.temporada_id]);

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

    // Handlers de Formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAnotacionChange = (jugadorId, puntos) => {
        const pts = parseInt(puntos) || 0;
        const existIdx = anotaciones.findIndex(a => a.jugador_id === jugadorId);
        if (existIdx > -1) {
            const newAnot = [...anotaciones];
            newAnot[existIdx].puntos = pts;
            setAnotaciones(newAnot);
        } else {
            setAnotaciones([...anotaciones, { jugador_id: jugadorId, puntos: pts }]);
        }
    };

    const handlePartidoSelect = async (id) => {
        setPartidoSeleccionado(id);
        const p = partidos.find(part => part.id === Number(id));
        if (p) {
            setFormData({
                ...formData,
                temporada_id: p.temporada_id || temporadaId,
                jornada: p.jornada || '',
                id_equipo_local: p.id_equipo_local || '',
                id_equipo_visitante: p.id_equipo_visitante || '',
                fecha: p.fecha ? p.fecha.split('T')[0] : '',
                horario: p.horario || '',
                lugar: p.lugar || '',
                puntos_local: p.puntos_local || '',
                puntos_visitante: p.puntos_visitante || ''
            });

            if (modalActivo === 'finalizar') {
                try {
                    const res = await axios.get(`http://localhost:5000/api/partidos/${id}/jugadores`);
                    setJugadoresPartido(res.data);
                    setAnotaciones(res.data.map(j => ({ jugador_id: j.id, puntos: 0 })));
                } catch (err) {
                    console.error("Error cargando jugadores del partido", err);
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            if (modalActivo === 'crear') {
                await axios.post('http://localhost:5000/api/partidos', formData, { headers });
            } else if (modalActivo === 'actualizar') {
                await axios.put(`http://localhost:5000/api/partidos/${partidoSeleccionado}`, formData, { headers });
            } else if (modalActivo === 'finalizar') {
                // Validar que la suma coincida
                const sumaLocal = anotaciones.filter(a => jugadoresPartido.find(j => j.id === a.jugador_id)?.equipo_id === parseInt(formData.id_equipo_local)).reduce((s, a) => s + a.puntos, 0);
                const sumaVisitante = anotaciones.filter(a => jugadoresPartido.find(j => j.id === a.jugador_id)?.equipo_id === parseInt(formData.id_equipo_visitante)).reduce((s, a) => s + a.puntos, 0);

                if (sumaLocal !== parseInt(formData.puntos_local) || sumaVisitante !== parseInt(formData.puntos_visitante)) {
                    return alert(`La suma de puntos no coincide.\nLocal: ${sumaLocal} (esperado ${formData.puntos_local})\nVisitante: ${sumaVisitante} (esperado ${formData.puntos_visitante})`);
                }

                await axios.put(`http://localhost:5000/api/partidos/${partidoSeleccionado}/finalizar`, {
                    puntos_local: parseInt(formData.puntos_local, 10),
                    puntos_visitante: parseInt(formData.puntos_visitante, 10),
                    anotaciones: anotaciones.filter(a => a.puntos > 0)
                }, { headers });
            }
            window.location.reload();
        } catch (error) {
            console.error('Error en operación de partido:', error);
            alert(error.response?.data?.error || 'Error al procesar la solicitud');
        }
    };

    const eliminarPartido = async () => {
        if (!partidoSeleccionado) return alert('Seleccione un partido');
        if (!window.confirm('¿Está seguro de eliminar este partido?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/partidos/${partidoSeleccionado}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            window.location.reload();
        } catch (error) {
            console.error('Error eliminando partido:', error);
        }
    };

    // Formatear fecha y hora
    const formatearFechaHora = (fecha, horario) => {
        if (!fecha) return 'Fecha por definir';
        const fechaObj = new Date(fecha);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        let resultado = fechaObj.toLocaleDateString('es-ES', opciones);
        if (horario) resultado += ` — ${horario.substring(0, 5)} hs`;
        return resultado;
    };

    return (
        <div className="partidos-page-wrapper">
            {/* Sidebar de Administrador */}
            {isAdmin && (
                <aside className="partidos-sidebar">
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Gestión de Partidos</h3>
                        <ul className="sidebar-list">
                            <li><button onClick={() => { setModalActivo('crear'); setFormData({ ...formData, temporada_id: temporadaId }) }} className="sidebar-link-btn">• Crear Partido</button></li>
                            <li><button onClick={() => setModalActivo('actualizar')} className="sidebar-link-btn">• Actualizar</button></li>
                            <li><button onClick={() => setModalActivo('eliminar')} className="sidebar-link-btn">• Eliminar</button></li>
                            <li><button onClick={() => setModalActivo('finalizar')} className="sidebar-link-btn">• Finalizar</button></li>
                        </ul>
                    </div>
                </aside>
            )}

            <div className="partidos-main-content">
                <div className="partidos-contenedor">
                    <h1 className="partidos-titulo">Partidos</h1>

                    <div className="partidos-selectores">
                        <div className="selector-wrapper">
                            <select className="partidos-selector" value={temporadaId} onChange={(e) => setTemporadaId(e.target.value)}>
                                {temporadas.map(temp => <option key={temp.id} value={temp.id}>{temp.nombre}</option>)}
                            </select>
                        </div>
                        <div className="selector-wrapper">
                            <select className="partidos-selector" value={jornadaSeleccionada} onChange={(e) => setJornadaSeleccionada(e.target.value)} disabled={jornadas.length === 0}>
                                <option value="">Todas las jornadas</option>
                                {jornadas.map(j => <option key={j.jornada} value={j.jornada}>Jornada {j.jornada}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="partidos-lista">
                        {cargando ? (
                            <div className="partidos-loading"><div className="loading-spinner"></div><p>Cargando partidos...</p></div>
                        ) : partidos.length > 0 ? (
                            partidos.map((partido, index) => (
                                <div key={partido.id || index} className="partido-bloque">
                                    <p className="partido-meta">{formatearFechaHora(partido.fecha, partido.horario)}{partido.lugar ? ` — ${partido.lugar}` : ''}</p>
                                    <Link to="/equipos" className="partido-tarjeta">
                                        <div className="partido-equipo partido-equipo--local">
                                            <span className="partido-nombre">{partido.local}</span>
                                            <div className="partido-logo-wrapper">
                                                {partido.logo_local ? <img src={`http://localhost:5000${partido.logo_local}`} alt="" className="partido-logo" /> : <div className="partido-logo-placeholder">🏀</div>}
                                            </div>
                                        </div>
                                        <div className="partido-vs-container">
                                            {partido.finalizado ? (
                                                <div className="partido-marcador">
                                                    {partido.puntos_local !== null ? (
                                                        <><span className="marcador-puntos">{partido.puntos_local}</span><span className="marcador-separador">-</span><span className="marcador-puntos">{partido.puntos_visitante}</span></>
                                                    ) : <span className="marcador-pendiente">Pendiente</span>}
                                                </div>
                                            ) : <div className="partido-vs">VS</div>}
                                        </div>
                                        <div className="partido-equipo partido-equipo--visitante">
                                            <div className="partido-logo-wrapper">
                                                {partido.logo_visitante ? <img src={`http://localhost:5000${partido.logo_visitante}`} alt="" className="partido-logo" /> : <div className="partido-logo-placeholder">🏀</div>}
                                            </div>
                                            <span className="partido-nombre">{partido.visitante}</span>
                                        </div>
                                    </Link>
                                    {partido.finalizado && <div className="partido-estado"><span className="estado-badge finalizado">Finalizado</span></div>}
                                </div>
                            ))
                        ) : (
                            <div className="partidos-vacio"><span className="vacio-icono">📋</span><p>No hay partidos registrados.</p></div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modales de Admin */}
            {modalActivo && (
                <div className="admin-modal-overlay" onClick={() => { setModalActivo(null); setJugadoresPartido([]); setAnotaciones([]); setPartidoSeleccionado(''); }}>
                    <div className={`admin-modal ${modalActivo === 'finalizar' ? 'large' : ''}`} onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => { setModalActivo(null); setJugadoresPartido([]); setAnotaciones([]); setPartidoSeleccionado(''); }}>×</button>
                        <h2>{modalActivo.toUpperCase()} PARTIDO</h2>

                        {(modalActivo === 'actualizar' || modalActivo === 'eliminar' || modalActivo === 'finalizar') && (
                            <div className="form-group">
                                <label>Seleccionar Partido</label>
                                <select className="admin-input" value={partidoSeleccionado} onChange={(e) => handlePartidoSelect(e.target.value)}>
                                    <option value="">-- Elija un partido --</option>
                                    {partidos
                                        .filter(p => {
                                            if (modalActivo === 'finalizar') {
                                                // Oculta los que ya tienen marcador registrado (ya finalizados)
                                                return !(p.finalizado && p.puntos_local !== null);
                                            }
                                            return true;
                                        })
                                        .map(p => {
                                            const estado = p.finalizado && p.puntos_local !== null ? 'Finalizado' : 'Pendiente';
                                            return (
                                                <option key={p.id} value={p.id}>
                                                    {p.local} vs {p.visitante} (J{p.jornada}) - {estado}
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>
                        )}

                        {modalActivo === 'eliminar' ? (
                            <button className="submit-btn delete-btn" onClick={eliminarPartido}>Confirmar Eliminación</button>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {modalActivo !== 'finalizar' && (
                                    <>
                                        <div className="form-group">
                                            <label>Equipo Local</label>
                                            <select name="id_equipo_local" value={formData.id_equipo_local} onChange={handleInputChange} className="admin-input" required>
                                                <option value="">-- Seleccionar --</option>
                                                {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Equipo Visitante</label>
                                            <select name="id_equipo_visitante" value={formData.id_equipo_visitante} onChange={handleInputChange} className="admin-input" required>
                                                <option value="">-- Seleccionar --</option>
                                                {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha</label>
                                            <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} className="admin-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Horario</label>
                                            <input type="time" name="horario" value={formData.horario} onChange={handleInputChange} className="admin-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Lugar</label>
                                            <input type="text" name="lugar" value={formData.lugar} onChange={handleInputChange} className="admin-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Temporada (Opcional)</label>
                                            <select name="temporada_id" value={formData.temporada_id} onChange={handleInputChange} className="admin-input">
                                                <option value="disabled">-- Seleccionar --</option>
                                                {temporadas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Jornada (Opcional)</label>
                                            <select name="jornada" value={formData.jornada} onChange={handleInputChange} className="admin-input">
                                                <option value="">-- Seleccionar --</option>
                                                {jornadasForm.map(j => <option key={j.jornada} value={j.jornada}>Jornada {j.jornada}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {modalActivo === 'finalizar' && (
                                    <>
                                        <div className="form-row-puntos">
                                            <div className="form-group">
                                                <label>Puntos Local</label>
                                                <input type="number" name="puntos_local" value={formData.puntos_local} onChange={handleInputChange} className="admin-input" required />
                                            </div>
                                            <div className="form-group">
                                                <label>Puntos Visitante</label>
                                                <input type="number" name="puntos_visitante" value={formData.puntos_visitante} onChange={handleInputChange} className="admin-input" required />
                                            </div>
                                        </div>

                                        {jugadoresPartido.length > 0 && (
                                            <div className="anotaciones-seccion">
                                                <h3 className="anotaciones-titulo">Anotaciones Individuales</h3>
                                                <div className="anotaciones-grid">
                                                    {/* Local */}
                                                    <div className="anotaciones-col">
                                                        <h4>{partidos.find(p => p.id === Number(partidoSeleccionado))?.local}</h4>
                                                        {jugadoresPartido.filter(j => j.equipo_id === parseInt(formData.id_equipo_local)).map(j => (
                                                            <div key={j.id} className="anotacion-input-group">
                                                                <label>{j.nombre_apellido}</label>
                                                                <input type="number" min="0" value={anotaciones.find(a => a.jugador_id === j.id)?.puntos || ""} onChange={(e) => handleAnotacionChange(j.id, e.target.value)} className="admin-input small" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Visitante */}
                                                    <div className="anotaciones-col">
                                                        <h4>{partidos.find(p => p.id === Number(partidoSeleccionado))?.visitante}</h4>
                                                        {jugadoresPartido.filter(j => j.equipo_id === parseInt(formData.id_equipo_visitante)).map(j => (
                                                            <div key={j.id} className="anotacion-input-group">
                                                                <label>{j.nombre_apellido}</label>
                                                                <input type="number" min="0" value={anotaciones.find(a => a.jugador_id === j.id)?.puntos || ""} onChange={(e) => handleAnotacionChange(j.id, e.target.value)} className="admin-input small" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <button type="submit" className="submit-btn">{modalActivo === 'finalizar' ? 'Finalizar' : 'Guardar'} Partido</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Partidos;