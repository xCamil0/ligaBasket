/**
 * detalleEquipo.jsx — Página de detalle de un equipo.
 * Muestra info del equipo, plantilla de jugadores, partidos jugados y pendientes.
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './detalleEquipo.css';

const DetalleEquipo = () => {
    const { id } = useParams();
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [activeTab, setActiveTab] = useState('plantilla');
    const [expandirPlantilla, setExpandirPlantilla] = useState(false);

    // Cargar detalle completo del equipo (info, jugadores, partidos)
    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/equipos/${id}/detalle`);
                setDatos(res.data);
            } catch (error) {
                console.error("Error al cargar el detalle del equipo:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarDetalle();
    }, [id]);

    if (cargando) return <div className="detalle-cargando">Cargando equipo...</div>;
    if (!datos) return <div className="detalle-cargando">No se encontró el equipo.</div>;

    const { equipo, jugadores, jugados, pendientes } = datos;

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return 'Sin fecha';
        return new Date(fechaStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const jugadoresAMostrar = expandirPlantilla ? jugadores : jugadores.slice(0, 10);

    return (
        <div className="detalle-page">
            {/* Zona superior: info del equipo y jugadores */}
            <div className="detalle-top">
                {/* Tarjeta izquierda: Logo + Nombre + Info */}
                <div className="detalle-equipo-card">
                    <div className="detalle-equipo-logo-wrapper">
                        {equipo.logo ? (
                            <img
                                src={`http://localhost:5000${equipo.logo}`}
                                alt={equipo.nombre}
                                className="detalle-equipo-logo"
                            />
                        ) : (
                            <div className="detalle-logo-placeholder">🏀</div>
                        )}
                    </div>
                    
                    <div className="detalle-equipo-text-content">
                        <p className="detalle-equipo-nombre">{equipo.nombre}</p>

                        <div className="detalle-info-rows">
                            <div className="detalle-info-row">
                                <div className="detalle-info-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                                <div className="detalle-info-text">
                                    <span className="detalle-info-label">Entrenador</span>
                                    <span className="detalle-info-value">{equipo.entrenador || 'No asignado'}</span>
                                </div>
                            </div>
                            <div className="detalle-info-row">
                                <div className="detalle-info-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </div>
                                <div className="detalle-info-text">
                                    <span className="detalle-info-label">Estadio</span>
                                    <span className="detalle-info-value">{equipo.estadio || 'No asignado'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher (Visible on Mobile/Tablet) */}
                <div className="detalle-tab-switcher">
                    <button 
                        className={`detalle-tab-btn ${activeTab === 'plantilla' ? 'active' : ''}`}
                        onClick={() => setActiveTab('plantilla')}
                    >
                        PLANTILLA
                    </button>
                    <button 
                        className={`detalle-tab-btn ${activeTab === 'partidos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('partidos')}
                    >
                        PARTIDOS
                    </button>
                    <button 
                        className={`detalle-tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('estadisticas')}
                    >
                        ESTADÍSTICAS
                    </button>
                </div>

                {/* Tabla de Jugadores */}
                <div className={`detalle-jugadores-wrapper ${activeTab === 'plantilla' ? 'active' : 'inactive-mobile'}`}>
                    <div className="detalle-seccion-titulo-movil">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: '#ff521d' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        JUGADORES
                    </div>
                    <table className="detalle-tabla">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th style={{ textAlign: 'center' }}>Categoría</th>
                                <th style={{ textAlign: 'right', color: 'rgb(255, 82, 29)' }}>Dorsal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jugadores.length > 0 ? (
                                jugadoresAMostrar.map(j => (
                                    <tr key={j.id}>
                                        <td>
                                            <div className="tabla-jugador-cell">
                                                <div className="tabla-jugador-avatar">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                </div>
                                                {j.nombre_apellido}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center', color: '#8a99ad' }}>{j.categoria || '—'}</td>
                                        <td className="tabla-dorsal" style={{ textAlign: 'right', fontWeight: '800', color: 'rgb(255, 82, 29)' }}>{j.dorsal ?? '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="tabla-vacia">Sin jugadores registrados</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {jugadores.length > 10 && !expandirPlantilla && (
                        <button className="ver-plantilla-completa-btn" onClick={() => setExpandirPlantilla(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Ver plantilla completa
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Zona inferior: historial de partidos */}
            <div className={`detalle-bottom ${activeTab === 'plantilla' || activeTab === 'partidos' ? 'active' : 'inactive-mobile'}`}>
                {/* Partidos Jugados */}
                <div className="partidos-seccion">
                    <div className="partidos-header">
                        <div className="partidos-header-left">
                            <div className="partidos-header-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            </div>
                            PARTIDOS JUGADOS
                        </div>
                        <a href="/partidos" className="partidos-ver-todos">Ver todos <span style={{ marginLeft: '4px', color: 'rgb(255, 82, 29)' }}>&gt;</span></a>
                    </div>
                    <div className="partidos-lista-detalle">
                        {jugados && jugados.length > 0 ? (
                            jugados.map(p => (
                                <div key={p.id} className="partido-fila-rediseño">
                                    <div className="partido-equipo-local-rediseño">
                                        <div className="partido-mini-logo-rediseño">
                                            {p.logo_local ? (
                                                <img src={`http://localhost:5000${p.logo_local}`} alt={p.local} />
                                            ) : (
                                                <span>🏀</span>
                                            )}
                                        </div>
                                        <span className="partido-nombre-rediseño">{p.local}</span>
                                    </div>
                                    
                                    <div className="partido-score-pill">
                                        {p.puntos_local ?? 0} - {p.puntos_visitante ?? 0}
                                    </div>
                                    
                                    <div className="partido-equipo-visitante-rediseño">
                                        <div className="partido-mini-logo-rediseño">
                                            {p.logo_visitante ? (
                                                <img src={`http://localhost:5000${p.logo_visitante}`} alt={p.visitante} />
                                            ) : (
                                                <span>🏀</span>
                                            )}
                                        </div>
                                        <span className="partido-nombre-rediseño">{p.visitante}</span>
                                    </div>
                                    <span className="partido-fecha-rediseño">{formatearFecha(p.fecha)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="partidos-vacio">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.35}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                Sin partidos jugados
                            </div>
                        )}
                    </div>
                </div>

                {/* Partidos Pendientes */}
                <div className="partidos-seccion">
                    <div className="partidos-header">
                        <div className="partidos-header-left">
                            <div className="partidos-header-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            PARTIDOS PENDIENTES
                        </div>
                        <a href="/partidos" className="partidos-ver-todos">Ver todos <span style={{ marginLeft: '4px', color: 'rgb(255, 82, 29)' }}>&gt;</span></a>
                    </div>
                    <div className="partidos-lista-detalle">
                        {pendientes && pendientes.length > 0 ? (
                            pendientes.map(p => (
                                <div key={p.id} className="partido-fila-rediseño">
                                    <div className="partido-equipo-local-rediseño">
                                        <div className="partido-mini-logo-rediseño">
                                            {p.logo_local ? (
                                                <img src={`http://localhost:5000${p.logo_local}`} alt={p.local} />
                                            ) : (
                                                <span>🏀</span>
                                            )}
                                        </div>
                                        <span className="partido-nombre-rediseño">{p.local}</span>
                                    </div>
                                    
                                    <div className="partido-vs-pill">
                                        VS
                                    </div>
                                    
                                    <div className="partido-equipo-visitante-rediseño">
                                        <div className="partido-mini-logo-rediseño">
                                            {p.logo_visitante ? (
                                                <img src={`http://localhost:5000${p.logo_visitante}`} alt={p.visitante} />
                                            ) : (
                                                <span>🏀</span>
                                            )}
                                        </div>
                                        <span className="partido-nombre-rediseño">{p.visitante}</span>
                                    </div>
                                    <span className="partido-fecha-rediseño">{formatearFecha(p.fecha)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="partidos-vacio">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.35}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                Sin partidos pendientes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Estadísticas Tab Content (Visible only on Mobile when tab active) */}
            {activeTab === 'estadisticas' && (
                <div className="detalle-estadisticas-mobile-card">
                    <div className="detalle-seccion-titulo-movil">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: '#ff521d' }}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        ESTADÍSTICAS DEL EQUIPO
                    </div>
                    <div className="estadistica-mobile-rows">
                        <div className="estadistica-mobile-row">
                            <span className="est-label">Partidos Jugados (PJ)</span>
                            <span className="est-value">{jugados.length}</span>
                        </div>
                        <div className="estadistica-mobile-row">
                            <span className="est-label">Partidos Pendientes</span>
                            <span className="est-value">{pendientes.length}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetalleEquipo;