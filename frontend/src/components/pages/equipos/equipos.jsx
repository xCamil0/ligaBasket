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
        <div className="equipos-page-container">
            {/* Sidebar Izquierdo Naranja */}
            <aside className="equipos-sidebar">
                <div className="sidebar-section">
                    <h3 className="sidebar-title">Equipos</h3>
                    <ul className="sidebar-list">
                        <li>
                            <button
                                onClick={() => setTemporadaSeleccionada(null)}
                                className={`sidebar-link ${temporadaSeleccionada === null ? 'active' : ''}`}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit' }}
                            >
                                • Todos
                            </button>
                        </li>
                        {temporadas.map(temp => (
                            <li key={temp.id}>
                                <button
                                    onClick={() => setTemporadaSeleccionada(temp.id)}
                                    className={`sidebar-link ${temporadaSeleccionada === temp.id ? 'active' : ''}`}
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit' }}
                                >
                                    • {temp.nombre}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-section">
                    {isAdmin ? (
                        <ul className="sidebar-list">
                            <h3 className="sidebar-title">Gestion de Equipos</h3>
                            <li><button onClick={() => setModalActivo('crear')} className="sidebar-link admin-btn-link">• Crear</button></li>
                            <li><button onClick={() => setModalActivo('actualizar')} className="sidebar-link admin-btn-link">• Actualizar</button></li>
                            <li><button onClick={() => setModalActivo('eliminar')} className="sidebar-link admin-btn-link">• Eliminar</button></li>
                        </ul>
                    ) : null}
                </div>
            </aside>

            <main className="equipos-main-content">
                <div className="equipos-grid">
                    {equipos.length > 0 ? (
                        equipos.map((equipo) => (
                            <Link to={`/equipos/${equipo.id}/detalle`} key={equipo.id} className="equipo-card" style={{ textDecoration: 'none' }}>
                                <div className="equipo-card-image-placeholder">
                                    {equipo.logo ? (
                                        <img src={`http://localhost:5000${equipo.logo}`} alt={equipo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="placeholder-art">🌄</div>
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
                                    <input type="file" name="foto" onChange={inputDatos} className="admin-input" accept="image/*" />
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
