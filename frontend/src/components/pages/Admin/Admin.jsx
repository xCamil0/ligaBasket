import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
    const [token] = useState(localStorage.getItem('token'));
    const [currentAdmin] = useState(localStorage.getItem('username'));
    const [activeTab, setActiveTab] = useState('temporadas');

    // Datos generales
    const [temporadas, setTemporadas] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [equiposParticipantes, setEquiposParticipantes] = useState([]);
    const [partidos, setPartidos] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [jugadores, setJugadores] = useState([]); 

    // Filtros de búsqueda
    const [searchAdminQuery, setSearchAdminQuery] = useState('');
    const [searchTeamQuery, setSearchTeamQuery] = useState('');

    // Modales y formularios
    const [modalActivo, setModalActivo] = useState(null);
    const [selectedAdminId, setSelectedAdminId] = useState(null);

    // Estados de los Formularios
    const [formTemporada, setFormTemporada] = useState({
        id: '',
        nombre: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    const [formAdmin, setFormAdmin] = useState({
        username: '',
        password: '',
        Email: ''
    });

    const temporadaActiva = temporadas.find(t => t.actual);
    const temporadaActivaId = temporadaActiva?.id || '';

    // Cargar datos iniciales
    const cargarTemporadas = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/temporadas');
            setTemporadas(res.data);
        } catch (error) {
            console.error("Error al cargar temporadas:", error);
        }
    }, []);

    const cargarEquipos = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/equipos');
            setEquipos(res.data);
        } catch (error) {
            console.error("Error al cargar equipos:", error);
        }
    }, []);

    const cargarAdmins = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5000/api/auth/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAdmins(res.data);
        } catch (error) {
            console.error("Error al cargar administradores:", error);
        }
    }, [token]);

    const cargarJugadores = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5000/api/jugadores', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setJugadores(res.data);
        } catch (error) {
            console.error("Error al cargar jugadores:", error);
        }
    }, [token]);


    // Efecto de carga inicial
    useEffect(() => {
        const cargarInicial = async () => {
            await cargarTemporadas();
            await cargarEquipos();
            await cargarAdmins();
            await cargarJugadores();
        };
        cargarInicial();
    }, [cargarTemporadas, cargarEquipos, cargarAdmins, cargarJugadores]);

    // Cargar equipos participantes y partidos cuando cambia la temporada activa
    useEffect(() => {
        if (!temporadaActivaId) return; // guard: no hacer nada si no hay temporada activa

        const cargarDatosTemporada = async () => {
            try {
                // URL corregida con el ID en el path
                const resEquipos = await axios.get(
                    `http://localhost:5000/api/temporadas/${temporadaActivaId}/equipos`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setEquiposParticipantes(resEquipos.data);

                // Variable corregida: temporadaActivaId en vez de temporada_id
                const resPartidos = await axios.get('http://localhost:5000/api/partidos', {
                    params: { temporada_id: temporadaActivaId }
                });
                setPartidos(resPartidos.data);
            } catch (error) {
                console.error("Error al cargar datos de la temporada:", error);
                setEquiposParticipantes([]);
                setPartidos([]);
            }
        };

        cargarDatosTemporada();
    }, [temporadaActivaId, token]);

    // Pre-rellenar formulario cuando cambia la temporada activa
    useEffect(() => {
        if (!temporadaActivaId) return; 

        const temp = temporadas.find(t => t.id === Number(temporadaActivaId));
        if (temp) {
            setFormTemporada({
                id: temp.id,
                nombre: temp.nombre,
                fecha_inicio: temp.fecha_inicio ? temp.fecha_inicio.split('T')[0] : '',
                fecha_fin: temp.fecha_fin ? temp.fecha_fin.split('T')[0] : ''
            });
        }
    }, [temporadaActivaId, temporadas]);

    // Cambiar la temporada actual: sin setter de estado local, solo actualiza el backend y recarga
    const handleCambiarTemporadaActiva = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/temporadas/actual/${id}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            cargarTemporadas();
            cargarJugadores();
        } catch (error) {
            console.error("Error al establecer temporada actual:", error);
            alert("Error al establecer la temporada como activa");
        }
    };

    // Crear o editar una temporada: sin setter de estado local para el ID activo
    const handleSubmitTemporada = async (e) => {
        e.preventDefault();
        try {
            if (formTemporada.id) {
                // Editar existente
                await axios.put(`http://localhost:5000/api/temporadas/${formTemporada.id}`, {
                    nombre: formTemporada.nombre,
                    fecha_inicio: formTemporada.fecha_inicio,
                    fecha_fin: formTemporada.fecha_fin
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert("Temporada actualizada correctamente");
            } else {
                // Crear nueva
                await axios.post('http://localhost:5000/api/temporadas', {
                    nombre: formTemporada.nombre,
                    fecha_inicio: formTemporada.fecha_inicio,
                    fecha_fin: formTemporada.fecha_fin
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert("Temporada creada correctamente");
                // Sin setTemporadaActivaId: el backend determina cuál es la activa
            }
            setFormTemporada({ id: '', nombre: '', fecha_inicio: '', fecha_fin: '' });
            cargarTemporadas();
        } catch (error) {
            console.error("Error en formulario temporada:", error);
            alert(error.response?.data?.error || "Error al procesar la temporada");
        }
    };

    // Eliminar una temporada: sin setter de estado local
    const handleEliminarTemporada = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta temporada? Se borrarán todos los partidos y asignaciones relacionadas.")) return;
        try {
            await axios.delete(`http://localhost:5000/api/temporadas/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Temporada eliminada correctamente");
            // Al recargar, el valor derivado se recalcula solo sin necesidad de un setter
            cargarTemporadas();
        } catch (error) {
            console.error("Error al eliminar temporada:", error);
            alert("Error al eliminar la temporada");
        }
    };

    // Asignar / remover equipos
    const handleGuardarEquiposAsignados = async (equiposSeleccionados) => {
        try {
            // Calcular diferencias contra el estado inicial
            const idsIniciales    = equiposParticipantes.map(eq => eq.id);
            const equiposAAgregar = equiposSeleccionados.filter(id => !idsIniciales.includes(id));
            const equiposARemover = idsIniciales.filter(id => !equiposSeleccionados.includes(id));

            // Si no hubo cambios, no hacer nada
            if (equiposAAgregar.length === 0 && equiposARemover.length === 0) {
                alert("No se realizaron cambios en los equipos.");
                setModalActivo(null);
                return;
            }

            const promesas = [];

            // Asignar equipos nuevos
            if (equiposAAgregar.length > 0) {
                promesas.push(
                    axios.post('http://localhost:5000/api/temporadas/equipos', {
                        temporada_id: temporadaActivaId,
                        equipos_ids: equiposAAgregar
                    }, { headers: { 'Authorization': `Bearer ${token}` } })
                );
            }

            // Desasignar equipos removidos → nuevo endpoint
            if (equiposARemover.length > 0) {
                promesas.push(
                    axios.delete('http://localhost:5000/api/temporadas/equipos', {
                        headers: { 'Authorization': `Bearer ${token}` },
                        data: {
                            temporada_id: temporadaActivaId,
                            equipos_ids: equiposARemover
                        }
                    })
                );
            }

            await Promise.all(promesas);

            // Mensaje resumen de los cambios realizados
            const partes = [];
            if (equiposAAgregar.length > 0) partes.push(`${equiposAAgregar.length} agregado(s)`);
            if (equiposARemover.length > 0) partes.push(`${equiposARemover.length} removido(s)`);
            alert(`Equipos actualizados: ${partes.join(', ')}.`);

            setModalActivo(null);

            // Recargar la lista de equipos participantes
            const resEquipos = await axios.get(
                `http://localhost:5000/api/temporadas/${temporadaActivaId}/equipos`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setEquiposParticipantes(resEquipos.data);

        } catch (error) {
            console.error("Error al actualizar equipos:", error);
            alert(error.response?.data?.error || "Hubo un error al actualizar los equipos.");
        }
    };

    // Generar calendario
    const handleGenerarCalendario = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/calendario/generar', {
                temporada_id: temporadaActivaId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert(res.data.mensaje || "Calendario generado con éxito");
            const resPartidos = await axios.get('http://localhost:5000/api/partidos', {
                params: { temporada_id: temporadaActivaId }
            });
            setPartidos(resPartidos.data);
        } catch (error) {
            console.error("Error al generar calendario:", error);
            alert(error.response?.data?.error || "Error al generar calendario. Verifique que tenga una cantidad par de equipos.");
        }
    };

    const handleEliminarCalendario = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar TODO el calendario de esta temporada?")) return;
        try {
            const res = await axios.delete('http://localhost:5000/api/calendario/eliminar', {
                headers: { 'Authorization': `Bearer ${token}` },
                data: { temporada_id: temporadaActivaId }
            });
            alert(res.data.mensaje || "Calendario eliminado");
            setPartidos([]);
        } catch (error) {
            console.error("Error al eliminar calendario:", error);
            alert("Error al eliminar calendario");
        }
    };

    // Administradores CRUD
    const handleSubmitAdmin = async (e) => {
        e.preventDefault();
        try {
            if (selectedAdminId) {
                await axios.put(`http://localhost:5000/api/auth/admin/${selectedAdminId}`, formAdmin, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert("Administrador actualizado correctamente");
            } else {
                await axios.post('http://localhost:5000/api/auth/register', formAdmin, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert("Administrador registrado correctamente");
            }
            setModalActivo(null);
            setFormAdmin({ username: '', password: '', Email: '' });
            setSelectedAdminId(null);
            cargarAdmins();
        } catch (error) {
            console.error("Error en formulario de administrador:", error);
            alert(error.response?.data?.error || "Error al procesar administrador");
        }
    };

    const handleEliminarAdmin = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este administrador?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/auth/admin/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Administrador eliminado correctamente");
            cargarAdmins();
        } catch (error) {
            console.error("Error al eliminar administrador:", error);
            alert(error.response?.data?.error || "Error al eliminar administrador");
        }
    };

    const abrirEditarAdmin = (admin) => {
        setSelectedAdminId(admin.id);
        setFormAdmin({
            username: admin.username,
            password: '',
            Email: admin.Email || admin.email || ''
        });
        setModalActivo('editar_admin');
    };

    // Renderizar listado de partidos agrupados por Jornada
    const renderFixture = () => {
        if (partidos.length === 0) {
            return (
                <div className="fixture-vacio">
                    <p>No hay partidos programados. Genera el calendario para crear el fixture.</p>
                </div>
            );
        }

        const jornadasMap = {};
        partidos.forEach(p => {
            if (!jornadasMap[p.jornada]) {
                jornadasMap[p.jornada] = [];
            }
            jornadasMap[p.jornada].push(p);
        });

        const jornadasOrdenadas = Object.keys(jornadasMap).sort((a, b) => Number(a) - Number(b));

        return (
            <div className="jornadas-container">
                {jornadasOrdenadas.map(jornadaNum => {
                    const partidosDeJornada = jornadasMap[jornadaNum];
                    const fechaJornada = partidosDeJornada[0]?.fecha
                        ? new Date(partidosDeJornada[0].fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Fecha por definir';

                    return (
                        <div key={jornadaNum} className="jornada-card">
                            <h4 className="jornada-titulo">Jornada {jornadaNum || "sin-asignar"}: {fechaJornada}</h4>
                            <div className="jornada-partidos-list">
                                {partidosDeJornada.map(p => (
                                    <div key={p.id} className="jornada-partido-item">
                                        <div className="jornada-equipo local">
                                            <span>{p.local}</span>
                                            {p.logo_local ? (
                                                <img src={`http://localhost:5000${p.logo_local}`} alt="" className="jornada-logo" />
                                            ) : (
                                                <span className="jornada-logo-placeholder">🏀</span>
                                            )}
                                        </div>
                                        <span className="jornada-vs">VS</span>
                                        <div className="jornada-equipo visitante">
                                            {p.logo_visitante ? (
                                                <img src={`http://localhost:5000${p.logo_visitante}`} alt="" className="jornada-logo" />
                                            ) : (
                                                <span className="jornada-logo-placeholder">🏀</span>
                                            )}
                                            <span>{p.visitante}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Filtrar administradores según el buscador
    const adminsFiltrados = admins.filter(admin => {
        const query = searchAdminQuery.toLowerCase();
        const username = admin.username ? admin.username.toLowerCase() : '';
        const email = (admin.Email || admin.email || '').toLowerCase();
        return username.includes(query) || email.includes(query);
    });

    // Validar si el usuario tiene permiso (logueado)
    if (!token) {
        return (
            <div className="admin-denied-wrapper">
                <div className="denied-box">
                    <span className="denied-icon"></span>
                    <h2>Acceso Denegado</h2>
                    <p>Debes iniciar sesión como administrador para ver esta sección.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-wrapper">
            {/* Header del Panel */}
            <div className="admin-header-bar">
                <div className="header-info">
                    <h1>Panel de Gestión de Liga</h1>
                    <span className="sub">Administración de Temporadas, Equipos y Usuarios</span>
                </div>
            </div>

            {/* Layout Principal: Sidebar + Contenido */}
            <div className="admin-layout-container">

                {/* Sidebar Izquierdo */}
                <aside className="admin-sidebar">
                    <div className="sidebar-logo-text">
                        <h3>Gestión de Liga</h3>
                    </div>
                    <ul className="sidebar-menu">
                        <li
                            className={`sidebar-menu-item ${activeTab === 'temporadas' ? 'active' : ''}`}
                            onClick={() => setActiveTab('temporadas')}
                        >
                            <span>Gestión de Temporadas</span>
                        </li>
                        <li
                            className={`sidebar-menu-item ${activeTab === 'admins' ? 'active' : ''}`}
                            onClick={() => setActiveTab('admins')}
                        >
                            <span>Gestión de Admins</span>
                        </li>
                    </ul>
                </aside>

                {/* Contenido Principal */}
                <main className="admin-main-content">

                    {/* VISTA 1: GESTIÓN DE TEMPORADAS */}
                    {activeTab === 'temporadas' && (
                        <div className="tab-content-wrapper">
                            <h2 className="section-title">Gestión de Temporadas</h2>

                            <div className="temporadas-config-row">

                                {/* Selector Temporada Activa */}
                                <div className="config-card selector-card">
                                    <h3>Temporada Activa</h3>
                                    <p className="card-desc">Selecciona la temporada que se visualizará por defecto.</p>
                                    <div className="custom-select-wrapper">
                                        <select
                                            value={temporadaActivaId}
                                            onChange={(e) => handleCambiarTemporadaActiva(e.target.value)}
                                            className="admin-input-premium"
                                        >
                                            <option value="">-- Seleccionar Temporada --</option>
                                            {temporadas.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.nombre} {t.actual ? '(Activa)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Formulario Crear/Editar */}
                                <div className="config-card form-card">
                                    <h3>{formTemporada.id ? 'Editar Temporada' : 'Crear Nueva Temporada'}</h3>
                                    <form onSubmit={handleSubmitTemporada} className="admin-form-row">
                                        <div className="input-group-premium">
                                            <label>Nombre de la Temporada</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Temporada 2026"
                                                value={formTemporada.nombre}
                                                onChange={(e) => setFormTemporada({ ...formTemporada, nombre: e.target.value })}
                                                required
                                                className="admin-input-premium"
                                            />
                                        </div>
                                        <div className="input-group-premium">
                                            <label>Fecha de Inicio</label>
                                            <input
                                                type="date"
                                                value={formTemporada.fecha_inicio}
                                                onChange={(e) => setFormTemporada({ ...formTemporada, fecha_inicio: e.target.value })}
                                                required
                                                className="admin-input-premium"
                                            />
                                        </div>
                                        <div className="input-group-premium">
                                            <label>Fecha de Finalización</label>
                                            <input
                                                type="date"
                                                value={formTemporada.fecha_fin}
                                                onChange={(e) => setFormTemporada({ ...formTemporada, fecha_fin: e.target.value })}
                                                required
                                                className="admin-input-premium"
                                            />
                                        </div>
                                        <div className="form-buttons-premium">
                                            <button type="submit" className="btn-premium orange">
                                                {formTemporada.id ? 'Guardar Cambios' : 'Crear Temporada'}
                                            </button>
                                            {formTemporada.id && (
                                                <button
                                                    type="button"
                                                    className="btn-premium secondary"
                                                    onClick={() => setFormTemporada({ id: '', nombre: '', fecha_inicio: '', fecha_fin: '' })}
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Fila intermedia: Equipos y Calendario (solo si hay temporada activa) */}
                            {temporadaActivaId && (
                                <div className="temporadas-details-grid">

                                    {/* Equipos Participantes */}
                                    <div className="details-card teams-card">
                                        <div className="card-header-btn">
                                            <h3>Equipos Participantes</h3>
                                            <button
                                                className="btn-premium orange small-btn"
                                                onClick={() => setModalActivo('asignar_equipos')}
                                            >
                                                Asignar / Remover Equipos
                                            </button>
                                        </div>
                                        <div className="teams-logos-grid">
                                            {equiposParticipantes.length > 0 ? (
                                                equiposParticipantes.map(eq => (
                                                    <div key={eq.id} className="team-circle-logo" title={eq.nombre}>
                                                        <div className="logo-img-wrapper">
                                                            {eq.logo ? (
                                                                <img src={`http://localhost:5000${eq.logo}`} alt={eq.nombre} />
                                                            ) : (
                                                                <span className="logo-placeholder">🏀</span>
                                                            )}
                                                        </div>
                                                        <span className="team-short-name">{eq.nombre}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-data-msg">No hay equipos asignados a esta temporada.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gestión de Calendario */}
                                    <div className="details-card calendar-card">
                                        <div className="card-header-btn">
                                            <h3>Gestión de Calendario</h3>
                                            <div className="actions-buttons">
                                                <button onClick={handleGenerarCalendario} className="btn-premium orange small-btn">
                                                    Generar Calendario
                                                </button>
                                                <button onClick={handleEliminarCalendario} className="btn-premium danger small-btn">
                                                    Eliminar Calendario
                                                </button>
                                            </div>
                                        </div>
                                        <div className="fixture-scroll-box">
                                            {renderFixture()}
                                        </div>
                                    </div>

                                    <div className="secondary-card summary-card">
                                        <h3>Jugadores</h3>
                                        <div className="summary-stats-list">
                                            <div className="summary-stat-item">
                                                <span className="card-title">Total Registrados</span>
                                                <span className="card-subtitle">{jugadores.length}</span>
                                            </div>
                                            <div className="summary-stat-item">
                                                <span className="card-title">Agentes libres</span>
                                                <span className="card-subtitle">{jugadores.filter(j => j.equipo_id === null).length}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="secondary-card summary-card">
                                        <h3>Partidos</h3>
                                        <div className="summary-stats-list">
                                            <div className="summary-stat-item">
                                                <span className="card-title">Total Programados</span>
                                                <span className="card-subtitle">{partidos.length}</span>
                                            </div>
                                            <div className="summary-stat-item">
                                                <span className="card-title">Total jugados</span>
                                                <span className="card-subtitle">{partidos.filter(p => p.finalizado === true).length}</span>
                                            </div>
                                            <div className="summary-stat-item">
                                                <span className="card-title">Total pendientes</span>
                                                <span className="card-subtitle">{partidos.filter(p => p.finalizado === false).length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VISTA 2: GESTIÓN DE ADMINS */}
                    {activeTab === 'admins' && (
                        <div className="tab-content-wrapper">
                            <h2 className="section-title">Gestión de Admins</h2>

                            {/* Tabla de Administradores */}
                            <div className="admin-table-card">
                                <div className="table-header-bar">
                                    <h3>Administradores del Sistema</h3>
                                    <div className="header-actions">
                                        <div className="search-bar-premium">
                                            <input
                                                type="text"
                                                placeholder="Buscar..."
                                                value={searchAdminQuery}
                                                onChange={(e) => setSearchAdminQuery(e.target.value)}
                                                className="search-input-premium"
                                            />
                                        </div>
                                        <button
                                            className="btn-premium orange"
                                            onClick={() => {
                                                setSelectedAdminId(null);
                                                setFormAdmin({ username: '', password: '', Email: '' });
                                                setModalActivo('crear_admin');
                                            }}
                                        >
                                            Crear Nuevo Administrador
                                        </button>
                                    </div>
                                </div>

                                <div className="table-overflow-wrapper">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Perfil</th>
                                                <th>Nombre Completo</th>
                                                <th>Correo Electrónico</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminsFiltrados.length > 0 ? (
                                                adminsFiltrados.map(adm => {
                                                    return (
                                                        <tr key={adm.id}>
                                                            <td>{adm.id}</td>
                                                            <td>
                                                                <div className="user-avatar-circle">
                                                                    <span>{adm.username ? adm.username.substring(0, 2).toUpperCase() : 'AD'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="font-bold">{adm.username}</td>
                                                            <td>{adm.Email || adm.email || '—'}</td>
                                                            <td>
                                                                <span className="status-badge active">Activo</span>
                                                            </td>
                                                            <td>
                                                                <div className="action-icons-row">
                                                                    <button
                                                                        className="action-icon-btn edit"
                                                                        onClick={() => abrirEditarAdmin(adm)}
                                                                        title="Editar"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    {adm.username !== 'camilo' && adm.username !== currentAdmin && (
                                                                        <button
                                                                            className="action-icon-btn delete"
                                                                            onClick={() => handleEliminarAdmin(adm.id)}
                                                                            title="Eliminar"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="table-no-data">No se encontraron administradores.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Panel Secundario */}
                            <div className="admin-secondary-row">

                                {/* Temporadas Existentes */}
                                <div className="secondary-card seasons-list-card">
                                    <h3>Administración de Temporadas</h3>
                                    <div className="seasons-split-container">
                                        <div className="seasons-existing-list">
                                            <h4>Temporadas Existentes</h4>
                                            <div className="existing-items-scroll">
                                                {temporadas.map(t => (
                                                    <div key={t.id} className="season-list-item">
                                                        <div className="item-left">
                                                            <div className="item-meta">
                                                                <span className="item-name">{t.nombre}</span>
                                                                <span className="item-dates">
                                                                    {t.fecha_inicio ? t.fecha_inicio.split('T')[0] : ''} al {t.fecha_fin ? t.fecha_fin.split('T')[0] : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="item-actions">
                                                            <button
                                                                onClick={() => {
                                                                    setFormTemporada({
                                                                        id: t.id,
                                                                        nombre: t.nombre,
                                                                        fecha_inicio: t.fecha_inicio ? t.fecha_inicio.split('T')[0] : '',
                                                                        fecha_fin: t.fecha_fin ? t.fecha_fin.split('T')[0] : ''
                                                                    });
                                                                    setActiveTab('temporadas');
                                                                }}
                                                                className="item-btn edit"
                                                                title="Editar"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleEliminarTemporada(t.id)}
                                                                className="item-btn delete"
                                                                title="Eliminar"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen de Gestión */}
                                <div className="secondary-card summary-card">
                                    <h3>Resumen de Gestión</h3>
                                    <div className="summary-stats-list">
                                        <div className="summary-stat-item">
                                            <span className="stat-label">Total Admins:</span>
                                            <span className="stat-value">{admins.length}</span>
                                        </div>
                                        <div className="summary-stat-item">
                                            <span className="stat-label">Total Temporadas:</span>
                                            <span className="stat-value">{temporadas.length}</span>
                                        </div>
                                        <div className="summary-stat-item">
                                            <span className="stat-label">Admins Activos:</span>
                                            <span className="stat-value active-color">{admins.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* MODALES */}

            {/* 1. Modal Asignar Equipos a Temporada */}
            {modalActivo === 'asignar_equipos' && (
                <div className="admin-modal-overlay-premium" onClick={() => setModalActivo(null)}>
                    <div className="admin-modal-premium large" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn-premium" onClick={() => setModalActivo(null)}>×</button>
                        <h2>Asignar Equipos a la Temporada</h2>
                        <p className="modal-desc">
                            Selecciona los equipos que participarán en la temporada. Escribe en el buscador para filtrar.
                        </p>
                        <div className="modal-search-box">
                            <input
                                type="text"
                                placeholder="Buscar equipo por nombre..."
                                value={searchTeamQuery}
                                onChange={(e) => setSearchTeamQuery(e.target.value)}
                                className="search-input-premium"
                            />
                        </div>
                        <TeamAssignmentList
                            allTeams={equipos}
                            initiallySelected={equiposParticipantes.map(eq => eq.id)}
                            filterQuery={searchTeamQuery}
                            onSave={handleGuardarEquiposAsignados}
                            onCancel={() => setModalActivo(null)}
                        />
                    </div>
                </div>
            )}

            {/* 2. Modal Crear / Editar Administrador */}
            {(modalActivo === 'crear_admin' || modalActivo === 'editar_admin') && (
                <div className="admin-modal-overlay-premium" onClick={() => setModalActivo(null)}>
                    <div className="admin-modal-premium" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn-premium" onClick={() => setModalActivo(null)}>×</button>
                        <h2>{modalActivo === 'crear_admin' ? 'Crear Nuevo Administrador' : 'Editar Administrador'}</h2>
                        <form onSubmit={handleSubmitAdmin} className="modal-form">
                            <div className="form-group-premium">
                                <label>Nombre de Usuario *</label>
                                <input
                                    type="text"
                                    value={formAdmin.username}
                                    onChange={(e) => setFormAdmin({ ...formAdmin, username: e.target.value })}
                                    required
                                    disabled={modalActivo === 'editar_admin'}
                                    className="admin-input-premium"
                                />
                            </div>
                            <div className="form-group-premium">
                                <label>Contraseña *</label>
                                <input
                                    type="password"
                                    value={formAdmin.password}
                                    onChange={(e) => setFormAdmin({ ...formAdmin, password: e.target.value })}
                                    required={modalActivo === 'crear_admin'}
                                    placeholder={modalActivo === 'editar_admin' ? 'Nueva contraseña' : ''}
                                    className="admin-input-premium"
                                />
                            </div>
                            <div className="form-group-premium">
                                <label>Correo Electrónico *</label>
                                <input
                                    type="email"
                                    value={formAdmin.Email}
                                    onChange={(e) => setFormAdmin({ ...formAdmin, Email: e.target.value })}
                                    required
                                    className="admin-input-premium"
                                />
                            </div>
                            <div className="modal-buttons-premium">
                                <button type="button" onClick={() => setModalActivo(null)} className="btn-premium secondary">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-premium orange">
                                    {modalActivo === 'crear_admin' ? 'Registrar' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente secundario para la asignación de equipos
const TeamAssignmentList = ({ allTeams, initiallySelected, filterQuery, onSave, onCancel }) => {
    const [selectedIds, setSelectedIds] = useState(initiallySelected);

    const filteredTeams = allTeams.filter(team =>
        team.nombre.toLowerCase().includes(filterQuery.toLowerCase())
    );

    const handleToggleTeam = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="assignment-wrapper">
            <div className="assignment-grid">
                {filteredTeams.length > 0 ? (
                    filteredTeams.map(team => {
                        const isChecked = selectedIds.includes(team.id);
                        return (
                            <div
                                key={team.id}
                                className={`assignment-item-card ${isChecked ? 'selected' : ''}`}
                                onClick={() => handleToggleTeam(team.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="assignment-checkbox"
                                />
                                <div className="team-card-logo">
                                    {team.logo ? (
                                        <img src={`http://localhost:5000${team.logo}`} alt="" />
                                    ) : (
                                        <span className="logo-placeholder">🏀</span>
                                    )}
                                </div>
                                <span className="team-card-name">{team.nombre}</span>
                            </div>
                        );
                    })
                ) : (
                    <p className="no-results-teams">No se encontraron equipos para la búsqueda.</p>
                )}
            </div>
            <div className="modal-buttons-premium inline">
                <button type="button" onClick={onCancel} className="btn-premium secondary">
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={() => onSave(selectedIds)}
                    className="btn-premium orange"
                >
                    Confirmar Cambios
                </button>
            </div>
        </div>
    );
};

export default Admin;