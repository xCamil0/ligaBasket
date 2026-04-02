import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';

// --- COMPONENTES DE PÁGINAS ---

// 1. TABLA DE POSICIONES
const TablaPosiciones = () => {
    const [tabla, setTabla] = useState([]);
    useEffect(() => {
        const cargarTabla = async () => {
            const res = await axios.get('http://localhost:5000/api/tabla');
            setTabla(res.data);
        };
        cargarTabla();
    }, []);

    return (
        <div>
            <h2>🏆 Tabla de Posiciones</h2>
            <table border="1" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#eee' }}>
                        <th>Pos</th><th>Equipo</th><th>PTS</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>TF</th><th>TC</th><th>DIF</th>
                    </tr>
                </thead>
                <tbody>
                    {tabla.map((f) => (
                        <tr key={f.equipo}>
                            <td>{f.posicion}</td>
                            {/* Link para ir al detalle del equipo */}
                            <td><Link to={`/equipos/${f.id_equipo || f.equipo}`}>{f.equipo}</Link></td>
                            <td>{f.puntos}</td><td>{f.pj}</td><td>{f.pg}</td><td>{f.pe}</td><td>{f.pp}</td><td>{f.tf}</td><td>{f.tc}</td><td>{f.dif}</td>
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
                        {/* Hacemos que el nombre sea un link al detalle */}
                        <Link to={`/equipos/${e.id}`}><strong>{e.nombre}</strong></Link> ({e.entrenador})
                    </li>
                ))}
            </ul>
        </div>
    );
};

// 3. DETALLE DE EQUIPO (LO NUEVO)
const DetalleEquipo = () => {
    const { id } = useParams();
    const [datos, setDatos] = useState(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/equipos/${id}/detalle`);
                setDatos(res.data);
            } catch (error) {
                console.error("Error al cargar detalle", error);
            }
        };
        cargarDetalle();
    }, [id]);

    if (!datos) return <p>Cargando perfil del equipo...</p>;

    return (
        <div>
            <h1>🏀 {datos.equipo.nombre}</h1>
            <p><strong>Entrenador:</strong> {datos.equipo.entrenador}</p>
            <hr />
            <h3>👥 Plantilla</h3>
            <ul>{datos.jugadores.map(j => <li key={j.id}>{j.nombre_apellido}</li>)}</ul>
            
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <h3>✅ Resultados</h3>
                    {datos.jugados.map(p => <div key={p.id}>{p.local} {p.puntos_local}-{p.puntos_visitante} {p.visitante}</div>)}
                </div>
                <div style={{ flex: 1 }}>
                    <h3>⏳ Pendientes</h3>
                    {datos.pendientes.map(p => <div key={p.id}>{p.local} vs {p.visitante}</div>)}
                </div>
            </div>
        </div>
    );
};

// 4. TABLA DE ANOTADORES (PICHICHI)
const Pichichi = () => {
    const [anotadores, setAnotadores] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5000/api/stats/pichichi').then(res => setAnotadores(res.data));
    }, []);

    return (
        <div>
            <h2>🔥 Top Anotadores (Pichichi)</h2>
            <ol>
                {anotadores.map(a => (
                    <li key={a.jugador}>{a.jugador} ({a.equipo}) - <strong>{a.total_puntos} pts</strong></li>
                ))}
            </ol>
        </div>
    );
};

// 5. PARTIDOS (Igual que el tuyo)
const Partidos = () => {
    const [partidos, setPartidos] = useState([]);
    const cargarPartidos = async () => {
        const res = await axios.get('http://localhost:5000/api/partidos');
        setPartidos(res.data);
    };
    useEffect(() => { cargarPartidos(); }, []);

    return (
        <div>
            <h2>📅 Calendario</h2>
            {partidos.map(p => (
                <div key={p.id} style={{ border: '1px solid #ccc', margin: '5px', padding: '10px' }}>
                    {p.equipo_local} vs {p.equipo_visitante} {p.finalizado && <strong>({p.puntos_local}-{p.puntos_visitante})</strong>}
                </div>
            ))}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
function App() {
    return (
        <Router>
            <nav style={{ padding: '20px', background: '#2c3e50', color: 'white', display: 'flex', gap: '20px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>TABLA</Link>
                <Link to="/equipos" style={{ color: 'white', textDecoration: 'none' }}>EQUIPOS</Link>
                <Link to="/partidos" style={{ color: 'white', textDecoration: 'none' }}>PARTIDOS</Link>
                <Link to="/pichichi" style={{ color: 'white', textDecoration: 'none' }}>PICHICHI</Link>
            </nav>

            <div style={{ padding: '30px' }}>
                <Routes>
                    <Route path="/" element={<TablaPosiciones />} />
                    <Route path="/equipos" element={<Equipos />} />
                    <Route path="/equipos/:id" element={<DetalleEquipo />} />
                    <Route path="/partidos" element={<Partidos />} />
                    <Route path="/pichichi" element={<Pichichi />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;