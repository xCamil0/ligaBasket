import { useState, useEffect } from 'react';
import axios from 'axios';

const Partidos = () => {
    const [partidos, setPartidos] = useState([]);

    const cargarPartidos = async () => {
        const res = await axios.get('http://localhost:5000/api/partidos');
        setPartidos(res.data);
    };

    const finalizar = async (id) => {
        const pLocal = prompt("Puntos Local:");
        const pVisit = prompt("Puntos Visitante:");

        if (pLocal && pVisit) {
            await axios.put(`http://localhost:5000/api/partidos/${id}/finalizar`, {
                puntos_local: parseInt(pLocal),
                puntos_visitante: parseInt(pVisit)
            });
            cargarPartidos();
        }
    };

    useEffect(() => { cargarPartidos(); }, []);

    return (
        <div>
            <h2>Próximos Partidos / Resultados</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
                {partidos.map(p => (
                    <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
                        <p>
                            <strong>{p.equipo_local}</strong> {p.puntos_local} vs {p.puntos_visitante} <strong>{p.equipo_visitante}</strong>
                        </p>
                        {!p.finalizado ? (
                            <button onClick={() => finalizar(p.id)}>🏆 Finalizar Partido</button>
                        ) : (
                            <span style={{color: 'green'}}>✔️ Terminado</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Partidos;