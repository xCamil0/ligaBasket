import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

// --- COMPONENTES DE PÁGINAS ---

// 1. TABLA DE POSICIONES
const TablaPosiciones = () => {
    const [tabla, setTabla] = useState([]);

    const cargarTabla = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tabla');
            setTabla(res.data);
        } catch (error) {
            console.error("Error al cargar la tabla:", error);
        }
    };

    useEffect(() => { cargarTabla(); }, []);

    return (
        <div>
            <h2>🏆 Tabla de Posiciones</h2>
            <table border="1" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#eee' }}>
                        <th>Pos</th>
                        <th>Equipo</th>
                        <th>PTS</th>
                        <th>PJ</th>
                        <th>PG</th>
                        <th>PE</th>
                        <th>PP</th>
                        <th>TF</th>
                        <th>TC</th>
                        <th>DIF</th>
                    </tr>
                </thead>
                <tbody>
                    {tabla.map((f) => (
                        <tr key={f.equipo}>
                            <td>{f.posicion}</td>
                            <td><strong>{f.equipo}</strong></td>
                            <td>{f.puntos}</td>
                            <td>{f.pj}</td>
                            <td>{f.pg}</td>
                            <td>{f.pe}</td>
                            <td>{f.pp}</td>
                            <td>{f.tf}</td>
                            <td>{f.tc}</td>
                            <td>{f.dif}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// 2. GESTIÓN DE EQUIPOS
const Equipos = () => {
    const [equipos, setEquipos] = useState([]);
    const [nuevo, setNuevo] = useState({ nombre: '', entrenador: '' });

    const cargarEquipos = async () => {
        const res = await axios.get('http://localhost:5000/api/equipos');
        setEquipos(res.data);
    };

    const crearEquipo = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/api/equipos', nuevo);
        setNuevo({ nombre: '', entrenador: '' });
        cargarEquipos();
    };

    const eliminar = async (id) => {
        if (window.confirm("¿Eliminar equipo?")) {
            await axios.delete(`http://localhost:5000/api/equipos/${id}`);
            cargarEquipos();
        }
    };

    useEffect(() => { cargarEquipos(); }, []);

    return (
        <div>
            <h2>🏀 Equipos</h2>
            <form onSubmit={crearEquipo} style={{ marginBottom: '20px' }}>
                <input placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} required />
                <input placeholder="Entrenador" value={nuevo.entrenador} onChange={e => setNuevo({...nuevo, entrenador: e.target.value})} required />
                <button type="submit">Agregar</button>
            </form>
            <ul>
                {equipos.map(e => (
                    <li key={e.id}>
                        {e.nombre} ({e.entrenador}) 
                        <button onClick={() => eliminar(e.id)} style={{ marginLeft: '10px', color: 'red' }}>x</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// 3. PARTIDOS Y RESULTADOS (Aquí incluí tu cambio del useEffect)
const Partidos = () => {
    const [partidos, setPartidos] = useState([]);

    const cargarPartidos = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/partidos');
            setPartidos(res.data);
        } catch (error) {
            console.error("Error al cargar partidos:", error);
        }
    };

    const finalizar = async (id) => {
        const pL = prompt("Puntos Local:");
        const pV = prompt("Puntos Visitante:");
        if (pL !== null && pV !== null) {
            await axios.put(`http://localhost:5000/api/partidos/${id}/finalizar`, {
                puntos_local: parseInt(pL),
                puntos_visitante: parseInt(pV)
            });
            cargarPartidos(); // Refrescamos después de finalizar
        }
    };

    useEffect(() => {
        cargarPartidos();
    }, []);

    return (
        <div>
            <h2>📅 Calendario y Resultados</h2>
            {partidos.map(p => (
                <div key={p.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                    <p>
                        {p.equipo_local} <strong>{p.puntos_local}</strong> - <strong>{p.puntos_visitante}</strong> {p.equipo_visitante}
                    </p>
                    <small>{p.fecha} | {p.lugar}</small> <br />
                    {!p.finalizado ? (
                        <button onClick={() => finalizar(p.id)}>Cerrar Partido</button>
                    ) : (
                        <span style={{ color: 'green' }}> ✅ Finalizado</span>
                    )}
                </div>
            ))}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL CON RUTAS ---
function App() {
    return (
        <Router>
            <nav style={{ padding: '20px', background: '#2c3e50', color: 'white', display: 'flex', gap: '20px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>TABLA</Link>
                <Link to="/equipos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>EQUIPOS</Link>
                <Link to="/partidos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>PARTIDOS</Link>
            </nav>

            <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
                <Routes>
                    <Route path="/" element={<TablaPosiciones />} />
                    <Route path="/equipos" element={<Equipos />} />
                    <Route path="/partidos" element={<Partidos />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;