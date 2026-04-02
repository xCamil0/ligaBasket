import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DetalleEquipo = () => {
    const { id } = useParams();
    const [datos, setDatos] = useState(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            const res = await axios.get(`http://localhost:5000/api/equipos/${id}/detalle`);
            setDatos(res.data);
        };
        cargarDetalle();
    }, [id]);

    if (!datos) return <p>Cargando datos del equipo...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>🏀 {datos.equipo.nombre}</h1>
            <p><strong>Entrenador:</strong> {datos.equipo.entrenador}</p>
            <p><strong>Puntos en la Liga:</strong> {datos.equipo.puntos_totales}</p>

            <hr />

            <h3>👥 Plantilla de Jugadores</h3>
            <ul>
                {datos.jugadores.map(j => <li key={j.id}>{j.nombre_apellido} ({j.categoria})</li>)}
            </ul>

            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                    <h3>✅ Resultados (Jugados)</h3>
                    {datos.jugados.map(p => (
                        <div key={p.id} style={{ borderBottom: '1px solid #ddd', padding: '5px' }}>
                            {p.local} <strong>{p.puntos_local} - {p.puntos_visitante}</strong> {p.visitante}
                        </div>
                    ))}
                </div>

                <div style={{ flex: 1 }}>
                    <h3>⏳ Próximos Partidos (Pendientes)</h3>
                    {datos.pendientes.map(p => (
                        <div key={p.id} style={{ borderBottom: '1px solid #ddd', padding: '5px' }}>
                            {p.local} vs {p.visitante} <br />
                            <small>📅 {new Date(p.fecha).toLocaleDateString()} | 📍 {p.lugar}</small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DetalleEquipo;