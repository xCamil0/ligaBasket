import { useState, useEffect } from 'react';
import axios from 'axios';
import './Jugadores.css';

const Jugadores = () => {
    // Datos generales
    const [jugadores, setJugadores] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [temporadas, setTemporadas] = useState([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState('todos'); // 'todos', 'agentes-libres', o equipo_id
    const [cargando, setCargando] = useState(true);

    // buscador de jugadores por nombre
    const [busqueda, setBusqueda] = useState('');

    // Estado del Admin
    const [isAdmin, setIsAdmin] = useState(false);
    const [modalActivo, setModalActivo] = useState(null); // 'crear', 'actualizar', 'fichar', 'eliminar'

    // Formulario de datos
    const [formData, setFormData] = useState({
        id: '', // Para editar / fichar / eliminar
        nombre_apellido: '',
        categoria: 'Profesional',
        dorsal: '',
        equipo_id: '',
        temporada_id: ''
    });

    const headers = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [resJugadores, resEquipos, resTemporadas] = await Promise.all([
                axios.get('http://localhost:5000/api/jugadores'),
                axios.get('http://localhost:5000/api/equipos'),
                axios.get('http://localhost:5000/api/temporadas')
            ]);
            setJugadores(resJugadores.data);
            setEquipos(resEquipos.data);
            setTemporadas(resTemporadas.data);
        } catch (error) {
            console.error("Error al cargar datos de jugadores:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        const token = localStorage.getItem('token');
        if (token) setIsAdmin(true);
    }, []);

    // Limpiar formulario al abrir modal
    const abrirModal = (tipo, jugador = null) => {
        setModalActivo(tipo);
        if (jugador) {
            setFormData({
                id: jugador.id,
                nombre_apellido: jugador.nombre_apellido,
                categoria: jugador.categoria || 'Profesional',
                dorsal: jugador.dorsal || '',
                equipo_id: jugador.equipo_id || '',
                temporada_id: temporadas[0]?.id || ''
            });
        } else {
            setFormData({
                id: '',
                nombre_apellido: '',
                categoria: 'Profesional',
                dorsal: '',
                equipo_id: '',
                temporada_id: temporadas[0]?.id || ''
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Registrar Jugador
    const registrarJugador = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/jugadores', {
                nombre_apellido: formData.nombre_apellido,
                categoria: formData.categoria,
                dorsal: formData.dorsal ? parseInt(formData.dorsal, 10) : null,
                equipo_id: formData.equipo_id ? parseInt(formData.equipo_id, 10) : null
            }, headers());
            setModalActivo(null);
            cargarDatos();
        } catch (error) {
            console.error("Error al registrar jugador:", error);
            alert(error.response?.data?.error || "Error al registrar jugador");
        }
    };

    // Actualizar Datos de Jugador
    const actualizarJugador = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/jugadores/${formData.id}`, {
                nombre_apellido: formData.nombre_apellido,
                categoria: formData.categoria,
                dorsal: formData.dorsal ? parseInt(formData.dorsal, 10) : null,
                equipo_id: formData.equipo_id ? parseInt(formData.equipo_id, 10) : null
            }, headers());
            setModalActivo(null);
            cargarDatos();
        } catch (error) {
            console.error("Error al actualizar jugador:", error);
            alert(error.response?.data?.error || "Error al actualizar jugador");
        }
    };

    // Asignar Equipo (Fichar / Liberar)
    const gestionarFichaje = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/equipos/fichar', {
                jugador_id: parseInt(formData.id, 10),
                equipo_id: formData.equipo_id ? parseInt(formData.equipo_id, 10) : null,
                temporada_id: parseInt(formData.temporada_id, 10)
            }, headers());
            setModalActivo(null);
            cargarDatos();
        } catch (error) {
            console.error("Error al gestionar fichaje:", error);
            alert(error.response?.data?.error || "Error al gestionar fichaje");
        }
    };

    // Eliminar Jugador
    const eliminarJugador = async (e) => {
        e.preventDefault();
        if (!window.confirm("¿Estas seguro de que deseas eliminar este jugador de forma permanente?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/jugadores/${formData.id}`, headers());
            setModalActivo(null);
            cargarDatos();
        } catch (error) {
            console.error("Error al eliminar jugador:", error);
            alert(error.response?.data?.error || "Error al eliminar jugador");
        }
    };

    // Rellenar formulario cuando cambia el jugador seleccionado en Editar/Fichar/Eliminar modals
    const handleJugadorSelectChange = (e) => {
        const id = e.target.value;
        const jugador = jugadores.find(j => j.id === parseInt(id, 10));
        if (jugador) {
            setFormData(prev => ({
                ...prev,
                id: jugador.id,
                nombre_apellido: jugador.nombre_apellido,
                categoria: jugador.categoria || 'Profesional',
                dorsal: jugador.dorsal || '',
                equipo_id: jugador.equipo_id || '',
                temporada_id: temporadas[0]?.id || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                id: '',
                nombre_apellido: '',
                categoria: 'Profesional',
                dorsal: '',
                equipo_id: ''
            }));
        }
    };

    // Filtrar la lista principal
    const jugadoresFiltrados = jugadores.filter(j => {
        const query = busqueda.toLowerCase();
        const nombreCompleto = j.nombre_apellido ? j.nombre_apellido.toLowerCase() : '';
        const nombreEquipo = j.nombre_equipo ? j.nombre_equipo.toLowerCase() : '';
        if (filtroSeleccionado === 'agentes-libres') return j.equipo_id === null;
        return (filtroSeleccionado === 'todos' || j.equipo_id === parseInt(filtroSeleccionado, 10)) &&
               (nombreCompleto.includes(query) || nombreEquipo.includes(query));
    });

    // buscador de jugadores por nombre
    return (
        <div className="jugadores-page-wrapper">
            {/* Barra de Opciones Admin*/}
            {isAdmin && (
                <div className="admin-options-bar">
                    <span className="admin-bar-label">OPCIONES ADMIN:</span>
                    <div className="admin-bar-buttons">
                        <button onClick={() => abrirModal('crear')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Crear Jugador
                        </button>
                        <button onClick={() => abrirModal('actualizar')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                            Actualizar Jugador
                        </button>
                        <button onClick={() => abrirModal('fichar')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            Asignar Equipo
                        </button>
                        <button onClick={() => abrirModal('eliminar')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Eliminar Jugador
                        </button>
                    </div>
                </div>
            )}

            <div className="jugadores-main-container">
                {/* Sidebar Izquierdo: Filtros */}
                <aside className="jugadores-sidebar">
                    <h2 className="sidebar-titulo">Filtros</h2>
                    
                    <h3 className="sidebar-seccion-titulo">Equipos</h3>
                    <ul className="sidebar-filter-list">
                        <li 
                            className={`sidebar-filter-item ${filtroSeleccionado === 'todos' ? 'active' : ''}`}
                            onClick={() => setFiltroSeleccionado('todos')}
                        >
                            {filtroSeleccionado === 'todos' && <span className="checkmark">✓</span>} Todos
                        </li>
                        <li 
                            className={`sidebar-filter-item ${filtroSeleccionado === 'agentes-libres' ? 'active' : ''}`}
                            onClick={() => setFiltroSeleccionado('agentes-libres')}
                        >
                            {filtroSeleccionado === 'agentes-libres' && <span className="checkmark">✓</span>} Agentes Libres
                        </li>
                        {equipos.map(eq => (
                            <li 
                                key={eq.id}
                                className={`sidebar-filter-item ${filtroSeleccionado == eq.id ? 'active' : ''}`}
                                onClick={() => setFiltroSeleccionado(eq.id)}
                            >
                                {filtroSeleccionado == eq.id && <span className="checkmark">✓</span>} {eq.nombre}
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Contenido Principal: Grilla de Jugadores */}

                <main className="jugadores-content">
                    <h1 className="content-titulo">Estadísticas de Jugadores</h1>
                    <p className="content-subtitulo">Puntos Totales por Temporada y Trayectoria</p>

                    <div className="jugadores-buscador">
                        <input 
                            type="text" 
                            placeholder="Buscar Jugador" 
                            value={busqueda} 
                            onChange= {e => setBusqueda(e.target.value)}
                            className="buscador-input"
                        />
                    </div>

                    {cargando ? (
                        <div className="jugadores-cargando">
                            <div className="spinner"></div>
                            <p>Cargando lista de jugadores...</p>
                        </div>
                    ) : jugadoresFiltrados.length > 0 ? (
                        <div className="jugadores-cards-grid">
                            {jugadoresFiltrados.map(jugador => (
                                <div key={jugador.id} className="jugador-card-premium">
                                    <div className="jugador-card-header">
                                        <div className="jugador-identidad">
                                            <h3 className="jugador-nombre">{jugador.nombre_apellido}</h3>
                                            <p className="jugador-team-dorsal">
                                                {jugador.nombre_equipo || 'Agente Libre'} | #{jugador.dorsal ?? '—'}
                                            </p>
                                        </div>
                                        <div className="jugador-card-logo-wrapper">
                                            {jugador.logo_equipo ? (
                                                <img 
                                                    src={`http://localhost:5000${jugador.logo_equipo}`} 
                                                    alt={jugador.nombre_equipo} 
                                                    className="jugador-card-team-logo"
                                                />
                                            ) : (
                                                <div className="jugador-card-team-logo placeholder"></div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="jugador-card-body">
                                        <div className="stats-section">
                                            <h4 className="stats-section-title">Puntos por Temporada</h4>
                                            <ul className="stats-list">
                                                {jugador.puntos_temporadas && jugador.puntos_temporadas.length > 0 ? (
                                                    jugador.puntos_temporadas.map(pt => (
                                                        <li key={pt.temporada_id} className="stats-item">
                                                            <span className="bullet">•</span>
                                                            <span className="temp-name">{pt.nombre_temporada}</span>
                                                            <span className="temp-value">{pt.puntos} pts</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="stats-item vacio">Sin puntos registrados</li>
                                                )}
                                            </ul>
                                        </div>

                                        <div className="stats-section trayectoria">
                                            <h4 className="stats-section-title">Trayectoria</h4>
                                            <ul className="stats-list">
                                                {jugador.trayectoria && jugador.trayectoria.length > 0 ? (
                                                    jugador.trayectoria.slice(0, 3).map((tr, idx) => (
                                                        <li key={idx} className="stats-item">
                                                            <span className="bullet">•</span>
                                                            <span className="temp-name">{tr.equipo}</span>
                                                            <span className="temp-value small">{tr.temporada}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="stats-item vacio">Sin historial registrado</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="jugadores-grid-vacia">
                            <p>Debes elegir un filtro para ver los jugadores por equipo.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Modales de Administración */}
            {modalActivo && (
                <div className="admin-modal-overlay" onClick={() => setModalActivo(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        
                        {/* MODAL CREAR */}
                        {modalActivo === 'crear' && (
                            <form onSubmit={registrarJugador}>
                                <h2>Registrar Nuevo Jugador</h2>
                                <label>Nombre y Apellido *</label>
                                <input 
                                    type="text" 
                                    name="nombre_apellido" 
                                    value={formData.nombre_apellido} 
                                    onChange={handleInputChange} 
                                    className="admin-input" 
                                    required 
                                />

                                <label>Dorsal (Número de Camiseta)</label>
                                <input 
                                    type="number" 
                                    name="dorsal" 
                                    value={formData.dorsal} 
                                    onChange={handleInputChange} 
                                    className="admin-input" 
                                    min="0" 
                                    max="99" 
                                />

                                <div className="admin-modal-actions">
                                    <button type="button" onClick={() => setModalActivo(null)} className="admin-btn cancel">Cancelar</button>
                                    <button type="submit" className="admin-btn submit">Registrar</button>
                                </div>
                            </form>
                        )}

                        {/* MODAL ACTUALIZAR */}
                        {modalActivo === 'actualizar' && (
                            <form onSubmit={actualizarJugador}>
                                <h2>Editar Datos de Jugador</h2>
                                <label>Selecciona Jugador *</label>
                                <select 
                                    value={formData.id} 
                                    onChange={handleJugadorSelectChange}
                                    className="admin-input" 
                                    required
                                >
                                    <option value="">-- Selecciona un Jugador --</option>
                                    {jugadores.map(j => (
                                        <option key={j.id} value={j.id}>{j.nombre_apellido} ({j.nombre_equipo || 'Agente Libre'})</option>
                                    ))}
                                </select>

                                {formData.id && (
                                    <>
                                        <label>Nombre y Apellido *</label>
                                        <input 
                                            type="text" 
                                            name="nombre_apellido" 
                                            value={formData.nombre_apellido} 
                                            onChange={handleInputChange} 
                                            className="admin-input" 
                                            required 
                                        />

                                        <label>Dorsal (Número de Camiseta)</label>
                                        <input 
                                            type="number" 
                                            name="dorsal" 
                                            value={formData.dorsal} 
                                            onChange={handleInputChange} 
                                            className="admin-input" 
                                            min="0" 
                                            max="99" 
                                        />
                                    </>
                                )}

                                <div className="admin-modal-actions">
                                    <button type="button" onClick={() => setModalActivo(null)} className="admin-btn cancel">Cancelar</button>
                                    <button type="submit" disabled={!formData.id} className="admin-btn submit">Guardar Cambios</button>
                                </div>
                            </form>
                        )}

                        {/* MODAL FICHAJE (ASIGNAR EQUIPO) */}
                        {modalActivo === 'fichar' && (
                            <form onSubmit={gestionarFichaje}>
                                <h2>Asignar / Cambiar Equipo</h2>
                                <label>Selecciona Jugador *</label>
                                <select 
                                    value={formData.id} 
                                    onChange={handleJugadorSelectChange} 
                                    className="admin-input" 
                                    required
                                >
                                    <option value="">-- Selecciona un Jugador --</option>
                                    {jugadores.map(j => (
                                        <option key={j.id} value={j.id}>{j.nombre_apellido} ({j.nombre_equipo || 'Agente Libre'})</option>
                                    ))}
                                </select>

                                <label>Nuevo Equipo (Selecciona vacío para Agente Libre)</label>
                                <select 
                                    name="equipo_id" 
                                    value={formData.equipo_id} 
                                    onChange={handleInputChange} 
                                    className="admin-input"
                                >
                                    <option value="">-- Agente Libre --</option>
                                    {equipos.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                                    ))}
                                </select>

                                <label>Temporada de Fichaje / Movimiento *</label>
                                <select 
                                    name="temporada_id" 
                                    value={formData.temporada_id} 
                                    onChange={handleInputChange} 
                                    className="admin-input" 
                                    required
                                >
                                    <option value="">-- Selecciona Temporada --</option>
                                    {temporadas.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>

                                <div className="admin-modal-actions">
                                    <button type="button" onClick={() => setModalActivo(null)} className="admin-btn cancel">Cancelar</button>
                                    <button type="submit" disabled={!formData.id || !formData.temporada_id} className="admin-btn submit">Ejecutar Fichaje</button>
                                </div>
                            </form>
                        )}

                        {/* MODAL ELIMINAR */}
                        {modalActivo === 'eliminar' && (
                            <form onSubmit={eliminarJugador}>
                                <h2>Eliminar Jugador</h2>
                                <p style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                    ⚠️ ADVERTENCIA: Esta acción eliminará permanentemente al jugador de la base de datos y borrará sus estadísticas vinculadas.
                                </p>

                                <label>Selecciona Jugador a Eliminar *</label>
                                <select 
                                    value={formData.id} 
                                    onChange={handleJugadorSelectChange} 
                                    className="admin-input" 
                                    required
                                >
                                    <option value="">-- Selecciona un Jugador --</option>
                                    {jugadores.map(j => (
                                        <option key={j.id} value={j.id}>{j.nombre_apellido} ({j.nombre_equipo || 'Agente Libre'})</option>
                                    ))}
                                </select>

                                <div className="admin-modal-actions">
                                    <button type="button" onClick={() => setModalActivo(null)} className="admin-btn cancel">Cancelar</button>
                                    <button type="submit" disabled={!formData.id} className="admin-btn submit delete-btn">Confirmar Eliminación</button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default Jugadores;
