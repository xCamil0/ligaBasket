import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './detalleEquipo.css';

const DetalleEquipo = () => {
    const { id } = useParams();
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                // Un solo endpoint que devuelve todo: equipo, jugadores, partidos jugados y pendientes
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

    return (
        <div className="detalle-page">
            {/* ===== ZONA SUPERIOR ===== */}
            <div className="detalle-top">
                {/* Tarjeta del Equipo */}
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
                    <p className="detalle-equipo-nombre">{equipo.nombre}</p>
                </div>

                {/* Info Central: Entrenador y Temporada */}
                <div className="detalle-info-central">
                    <div className="info-pill-group">
                        <span className="info-pill">Entrenador</span>
                        <ul className="info-list">
                            <li>• {equipo.entrenador || 'No asignado'}</li>
                        </ul>
                    </div>
                    <div className="info-pill-group">
                        <span className="info-pill">Estadio</span>
                        <ul className="info-list">
                            <li>• {equipo.estadio || 'No asignado'}</li>
                        </ul>
                    </div>
                </div>

                {/* Tabla de Jugadores */}
                <div className="detalle-jugadores-wrapper">
                    <table className="detalle-tabla">
                        <thead>
                            <tr>
                                <th>Jugadores</th>
                                <th>Categoría</th>
                                <th>Dorsal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jugadores.length > 0 ? (
                                jugadores.map(j => (
                                    <tr key={j.id}>
                                        <td>{j.nombre_apellido}</td>
                                        <td>{j.categoria || '—'}</td>
                                        <td>{j.dorsal ?? '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="tabla-vacia">Sin jugadores registrados</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== ZONA INFERIOR: Partidos ===== */}
            <div className="detalle-bottom">

                {/* Partidos Jugados */}
                <div className="partidos-seccion">
                    <div className="partidos-header">Partidos jugados</div>
                    <div className="partidos-lista">
                        {jugados && jugados.length > 0 ? (
                            jugados.map(p => (
                                <div key={p.id} className="partido-fila">
                                    <span>{p.local}</span>
                                    <span className="marcador">{p.puntos_local ?? 0} - {p.puntos_visitante ?? 0}</span>
                                    <span>{p.visitante}</span>
                                    <span className="partido-fecha">{formatearFecha(p.fecha)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="partidos-vacio">Sin partidos jugados</div>
                        )}
                    </div>
                </div>

                {/* Partidos Pendientes */}
                <div className="partidos-seccion">
                    <div className="partidos-header">Partidos pendientes</div>
                    <div className="partidos-lista">
                        {pendientes && pendientes.length > 0 ? (
                            pendientes.map(p => (
                                <div key={p.id} className="partido-fila">
                                    <span>{p.local}</span>
                                    <span className="vs">vs</span>
                                    <span>{p.visitante}</span>
                                    <span className="partido-fecha">{formatearFecha(p.fecha)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="partidos-vacio">Sin partidos pendientes</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DetalleEquipo;