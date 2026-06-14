import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './equipos.css';

const Equipos = () => {
    const [equipos, setEquipos] = useState([]);
    const [temporadas, setTemporadas] = useState([]);
    const [temporadaSeleccionada, setTemporadaSeleccionada] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Estados para Modales de Administración
    const [modalActivo, setModalActivo] = useState(null);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
    const [formData, setFormData] = useState({
        nombre: '', entrenador: '', estadio: '', temporada_id: '', foto: null
    });

    const inputDatos = (e) => {
        const { name, value, files } = e.target;
        if (name === 'foto') {
            setFormData({ ...formData, foto: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const cargarDatosEquipoSeleccionado = (id) => {
        setEquipoSeleccionado(id);
        const eq = equipos.find(e => e.id === Number(id));
        if (eq) {
            setFormData({
                nombre: eq.nombre,
                entrenador: eq.entrenador || '',
                estadio: eq.estadio || '',
                temporada_id: '', // Se deja vacío para forzar la selección de la nueva temporada
                foto: null
            });
        }
    };

    const CrearEquipo = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('nombre', formData.nombre);
        data.append('entrenador', formData.entrenador);
        data.append('estadio', formData.estadio);
        data.append('temporada_id', formData.temporada_id);
        if (formData.foto) data.append('foto', formData.foto);

        try {
            await axios.post('http://localhost:5000/api/equipos', data, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setModalActivo(null);
            window.location.reload();
        } catch (error) {
            console.error("Error al crear equipo", error);
            alert("Hubo un error al crear el equipo");
        }
    };

    const ActualizarEquipo = async (e) => {
        e.preventDefault();
        if (!equipoSeleccionado) return alert("Selecciona un equipo");
        const data = new FormData();
        data.append('nombre', formData.nombre);
        data.append('entrenador', formData.entrenador);
        data.append('estadio', formData.estadio);
        if (formData.temporada_id) data.append('temporada_id', formData.temporada_id);
        if (formData.foto) data.append('foto', formData.foto);

        try {
            await axios.put(`http://localhost:5000/api/equipos/${equipoSeleccionado}`, data, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setModalActivo(null);
            window.location.reload();
        } catch (error) {
            console.error("Error al actualizar equipo", error);
            alert("Hubo un error al actualizar el equipo");
        }
    };

    const EliminarEquipo = async () => {
        if (!equipoSeleccionado) return alert("Selecciona un equipo");
        if (!window.confirm("¿Seguro que deseas eliminar este equipo?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/equipos/${equipoSeleccionado}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setModalActivo(null);
            window.location.reload();
        } catch (error) {
            console.error("Error al eliminar equipo", error);
            alert("Hubo un error al eliminar el equipo");
        }
    };

    useEffect(() => {
        // Verificar si el usuario es admin basado en localStorage
        const token = localStorage.getItem('token');
        if (token) {
            setIsAdmin(true);
        }
        const cargarTemporadas = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/temporadas');
                // Filtramos la temporada 1 que es exclusiva para amistosos
                const temporadasFiltradas = res.data.filter(temp => Number(temp.id) !== 1);
                setTemporadas(temporadasFiltradas);
            } catch (error) {
                console.error("Error al cargar las temporadas:", error);
            }
        };

        cargarTemporadas();
    }, []);

    useEffect(() => {
        // Cargar equipos reales desde la base de datos
        const cargarEquipos = async () => {
            try {
                let url = 'http://localhost:5000/api/equipos';
                if (temporadaSeleccionada) {
                    url = `http://localhost:5000/api/equipos/por-temporada?temporada_id=${temporadaSeleccionada}`;
                }
                const res = await axios.get(url);

                // Manejar tanto array directo como objeto con data: []
                if (res.data.data && Array.isArray(res.data.data)) {
                    setEquipos(res.data.data);
                } else if (Array.isArray(res.data)) {
                    setEquipos(res.data);
                } else {
                    setEquipos([]);
                }
            } catch (error) {
                console.error("Error al cargar los equipos:", error);
                setEquipos([]);
            }
        };

        cargarEquipos();
    }, [temporadaSeleccionada]);

    return (
        <div className="equipos-page-wrapper">
            {/* Barra de Opciones Admin directamente debajo del navbar */}
            {isAdmin && (
                <div className="admin-options-bar">
                    <span className="admin-bar-label">Opciones del Admin:</span>
                    <div className="admin-bar-buttons">
                        <button onClick={() => setModalActivo('crear')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Crear Equipo
                        </button>
                        <button onClick={() => setModalActivo('actualizar')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L2 18h3l3.5-3.5L18.5 2.5z"></path></svg>
                            Actualizar Equipo
                        </button>
                        <button onClick={() => setModalActivo('eliminar')} className="admin-bar-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><polyline points="3,6 5,6 21,6"></polyline><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h8a2,2,0,0,1,2,2v2"></path></svg>
                            Eliminar Equipo
                        </button>
                    </div>
                </div>
            )}

            <div className="equipos-page-container">
                {/* Mobile Filters Bar */}
                <div className="mobile-filters-container">
                    <div className="mobile-filters-header">
                        <span className="mobile-filters-title">FILTROS</span>
                        <div className="mobile-filters-btn">
                            <svg className="filter-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgb(255, 82, 29)' }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                            <span style={{ color: 'rgb(255, 82, 29)' }}>Filtrar</span>
                        </div>
                    </div>
                    <div className="mobile-filter-group">
                        <label className="mobile-filter-label">TEMPORADAS</label>
                        <div className="mobile-select-wrapper">
                            <svg className="calendar-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            <select 
                                className="mobile-season-select"
                                value={temporadaSeleccionada === null ? "" : temporadaSeleccionada}
                                onChange={(e) => setTemporadaSeleccionada(e.target.value === "" ? null : Number(e.target.value))}
                            >
                                <option value="">Todos</option>
                                {temporadas.map(temp => (
                                    <option key={temp.id} value={temp.id}>{temp.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sidebar Izquierdo: Filtros */}
                <aside className="equipos-sidebar">
                    <h2 className="sidebar-titulo">Filtros</h2>
                    <h3 className="sidebar-seccion-titulo">Temporadas</h3>
                    <ul className="sidebar-filter-list">
                        <li 
                            className={`sidebar-filter-item ${temporadaSeleccionada === null ? 'active' : ''}`}
                            onClick={() => setTemporadaSeleccionada(null)}
                        >
                            {temporadaSeleccionada === null && <span className="checkmark">✓</span>} Todos
                        </li>
                        {temporadas.map(temp => (
                            <li 
                                key={temp.id}
                                className={`sidebar-filter-item ${temporadaSeleccionada === temp.id ? 'active' : ''}`}
                                onClick={() => setTemporadaSeleccionada(temp.id)}
                            >
                                {temporadaSeleccionada === temp.id && <span className="checkmark">✓</span>} {temp.nombre}
                            </li>
                        ))}
                    </ul>
                </aside>

            <main className="equipos-main-content">
                <div className="equipos-grid">
                    {equipos.length > 0 ? (
                        equipos.map((equipo) => (
                            <Link to={`/equipos/${equipo.id}/detalle`} key={equipo.id} className="equipo-card">
                                <div className="equipo-card-image-placeholder">
                                    {equipo.logo ? (
                                        <img src={`http://localhost:5000${equipo.logo}`} alt={equipo.nombre} />
                                    ) : (
                                        <div className="placeholder-art">🏀</div>
                                    )}
                                </div>
                                <p className="equipo-card-name">{equipo.nombre}</p>
                            </Link>
                        ))
                    ) : (
                        <p style={{ color: 'white', gridColumn: '1 / -1' }}>No hay equipos en esta temporada.</p>
                    )}
                </div>
            </main>
            </div>

            {/* Modales de Administración */}
            {modalActivo && (
                <div className="admin-modal-overlay" onClick={() => setModalActivo(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setModalActivo(null)}>×</button>
                        <h2>
                            {modalActivo === 'crear' && 'Crear Nuevo Equipo'}
                            {modalActivo === 'actualizar' && 'Actualizar Equipo'}
                            {modalActivo === 'eliminar' && 'Eliminar Equipo'}
                        </h2>

                        {(modalActivo === 'actualizar' || modalActivo === 'eliminar') && (
                            <div className="form-group">
                                <label>Seleccionar Equipo</label>
                                <select
                                    className="admin-input"
                                    value={equipoSeleccionado}
                                    onChange={(e) => cargarDatosEquipoSeleccionado(e.target.value)}
                                >
                                    <option value="">-- Elige un equipo --</option>
                                    {equipos.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {modalActivo === 'eliminar' ? (
                            <button className="submit-btn delete-btn" onClick={EliminarEquipo}>Confirmar Eliminación</button>
                        ) : (
                            <form onSubmit={modalActivo === 'crear' ? CrearEquipo : ActualizarEquipo}>
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input type="text" name="nombre" value={formData.nombre} onChange={inputDatos} className="admin-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Entrenador</label>
                                    <input type="text" name="entrenador" value={formData.entrenador} onChange={inputDatos} className="admin-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Estadio</label>
                                    <input type="text" name="estadio" value={formData.estadio} onChange={inputDatos} className="admin-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Temporada</label>
                                    <select name="temporada_id" value={formData.temporada_id} onChange={inputDatos} className="admin-input" required={modalActivo === 'crear'}>
                                        <option value="">-- Selecciona Temporada --</option>
                                        {temporadas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Logo (Opcional)</label>
                                    <input type="file" name="foto" onChange={inputDatos} className="admin-input" accept="image/*"/>
                                </div>
                                <button type="submit" className="submit-btn">{modalActivo === 'crear' ? 'Crear' : 'Actualizar'} Equipo</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
        
    );
};

export default Equipos;
