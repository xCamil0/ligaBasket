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
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

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

    // Formatear fecha
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
        <div className="partidos-page-wrapper">
            {/* Admin bar */}
            {isAdmin && (
                <div className="admin-options-bar">
                    <span className="admin-bar-label">OPCIONES DEL ADMIN:</span>
                    <div className="admin-bar-buttons">
                        <button onClick={() => { setModalActivo('crear'); setFormData({ ...formData, temporada_id: temporadaId }) }} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Crear Partido
                        </button>
                        <button onClick={() => setModalActivo('actualizar')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                            Actualizar
                        </button>
                        <button onClick={() => setModalActivo('eliminar')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Eliminar
                        </button>
                        <button onClick={() => setModalActivo('finalizar')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            Finalizar
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Filters Bar */}
            <div className="partidos-mobile-filtros">
                <div className="partidos-filtros-bar">
                    <span className="partidos-filtros-label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                        FILTROS
                    </span>
                    <button className={`partidos-filtrar-btn ${mostrarFiltros ? 'active' : ''}`} onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                        {mostrarFiltros ? 'Cerrar' : 'Filtrar'}
                    </button>
                </div>
                
                {mostrarFiltros && (
                    <div className="selector-wrapper mobile-temporada-selector">
                        <svg className="selector-calendar-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                        <select className="partidos-selector" value={temporadaId} onChange={(e) => setTemporadaId(e.target.value)}>
                            {temporadas.map(temp => (
                                <option key={temp.id} value={temp.id}>{temp.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="selector-wrapper">
                    <svg className="selector-calendar-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    <select className="partidos-selector" value={jornadaSeleccionada} onChange={(e) => setJornadaSeleccionada(e.target.value)} disabled={jornadas.length === 0}>
                        <option value="">Todas las jornadas</option>
                        {jornadas.map(j => <option key={j.jornada} value={j.jornada}>Jornada {j.jornada}</option>)}
                    </select>
                </div>
            </div>

            <div className="partidos-layout-container">
                {/* Sidebar Izquierdo: Filtros */}
                <aside className="partidos-sidebar">
                    <h2 className="sidebar-titulo">Filtros</h2>
                    <h3 className="sidebar-seccion-titulo">Temporadas</h3>
                    <ul className="sidebar-filter-list">
                        {temporadas.map(temp => (
                            <li 
                                key={temp.id}
                                className={`sidebar-filter-item ${temporadaId == temp.id ? 'active' : ''}`}
                                onClick={() => setTemporadaId(temp.id)}
                            >
                                {temporadaId == temp.id && <span className="checkmark">✓</span>} {temp.nombre}
                            </li>
                        ))}
                    </ul>
                </aside>

                <div className="partidos-main-content">
                    <div className="partidos-contenedor">
                        <h1 className="partidos-titulo">Partidos</h1>

                        {/* Desktop jornada selector */}
                        <div className="partidos-selectores">
                            <div className="selector-wrapper">
                                <svg className="selector-calendar-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
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
                                        {/* Card header: fecha + estadio */}
                                        <div className="partido-meta">
                                            <div className="partido-meta-fecha">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                                                {formatearFecha(partido.fecha)}{formatearHora(partido.horario) ? ` — ${formatearHora(partido.horario)}` : ''}
                                            </div>
                                            {partido.lugar && (
                                                <div className="partido-meta-estadio">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
                                                    {partido.lugar.toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Teams and score */}
                                        <Link to={`/partido/${partido.id}`} className="partido-tarjeta">
                                            <div className="partido-equipo partido-equipo--local">
                                                <div className="partido-logo-wrapper">
                                                    {partido.logo_local ? <img src={`http://localhost:5000${partido.logo_local}`} alt="" className="partido-logo" /> : <div className="partido-logo-placeholder">🏀</div>}
                                                </div>
                                                <span className="partido-nombre">{partido.local}</span>
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

                                        {/* Status badge */}
                                        {partido.finalizado && (
                                            <div className="partido-estado">
                                                <span className="estado-badge">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    FINALIZADO
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="partidos-vacio"><span className="vacio-icono">📋</span><p>No hay partidos registrados.</p></div>
                            )}
                        </div>
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