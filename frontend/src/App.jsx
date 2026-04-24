import React, { useState, useEffect } from 'react';
import Login from './components/login';
import RutaPrivada from './components/RutaPrivada';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- COMPONENTES DE PÁGINAS ---

// TABLA DE POSICIONES
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
            <h2> Tabla </h2>
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
                            <td><Link to={`/equipos/${f.id_equipo || f.equipo}`}>{f.equipo}</Link></td>
                            <td>{f.puntos}</td><td>{f.pj}</td><td>{f.pg}</td><td>{f.pe}</td><td>{f.pp}</td><td>{f.tf}</td><td>{f.tc}</td><td>{f.dif}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// GESTIÓN DE EQUIPOS
const Equipos = () => {
    const [equipos, setEquipos] = useState([]);
    const [nuevo, setNuevo] = useState({ nombre: '', entrenador: '' });
    const [mostrarFormEliminar, setMostrarFormEliminar] = useState(false);
    const [datosEliminar, setDatosEliminar] = useState({ id: ''});

    const cargarEquipos = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/equipos');
            setEquipos(res.data);
        } catch (error) {
            console.error("Error al cargar equipos:", error);
        }
    };

    const crearEquipo = async (e) => {
        e.preventDefault();

        // VALIDACIONES DE FRONTEND
        if (nuevo.nombre.trim().length < 3) {
            alert("El nombre del equipo debe tener al menos 3 caracteres");
            return;
        }

        if (nuevo.entrenador.trim() === "") {
            alert("El nombre del entrenador es obligatorio");
            return;
        }

        const token = localStorage.getItem('token');

        try {
            // Enviamos los datos al backend
            await axios.post('http://localhost:5000/api/equipos', nuevo, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNuevo({ nombre: '', entrenador: '' });
            cargarEquipos();
            alert("Equipo creado con éxito");
            window.location.reload();

        } catch (error) {
            alert(error.response?.data?.error || "Error al crear equipo");
        }
    };

    const eliminarEquipo = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const token = localStorage.getItem('token');

    // Validación básica
    if (!datosEliminar.id || !datosEliminar.nombre) {
        alert("Debes completar ambos campos para eliminar");
        return;
    }

    try {
        // Enviamos el DELETE al ID que el usuario escribió
        await axios.delete(`http://localhost:5000/api/equipos/${datosEliminar.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Si sale bien:
        alert(`Equipo "${datosEliminar.nombre}" eliminado correctamente`);
        setDatosEliminar({ id: '', nombre: '' }); // Limpiar campos
        setMostrarFormEliminar(false); // Ocultar formulario
        cargarEquipos(); // Refrescar lista
    } catch (error) {
        alert(error.response?.data?.error || "El ID no coincide o el equipo no existe");
    }};

    useEffect(() => { cargarEquipos(); }, []);

    return (
        <div>
            <h2> Gestión de Equipos</h2>
                {localStorage.getItem('token') ? (
                    <form onSubmit={crearEquipo} style={{ marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            placeholder="Nombre del equipo" 
                            value={nuevo.nombre} 
                            onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} 
                            required
                            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                        />
                        <input 
                            type="text" 
                            placeholder="Nombre del entrenador" 
                            value={nuevo.entrenador} 
                            onChange={e => setNuevo({ ...nuevo, entrenador: e.target.value })} 
                            required
                            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                        />
                        <button type="submit" style={{ padding: '8px 15px', background: '#2980b9', color: 'white', border: 'none', borderRadius: '4px' }}>
                            Crear Equipo
                        </button>
                    </form>
                ) : (<p>Inicia sesión para gestionar equipos</p>)}
                    {/* Botón para abrir/cerrar el mini formulario */}
                    {localStorage.getItem('token') && (
                        <button 
                            onClick={() => setMostrarFormEliminar(!mostrarFormEliminar)}
                            style={{ marginTop: '10px', background: '#d9534f', color: 'white' , border: 'none', padding: '8px 15px', borderRadius: '4px' }}
                        >
                            {mostrarFormEliminar ? "Cancelar Eliminación" : "🗑️ Eliminar por ID"}
                        </button>
                    )}

                    {/* Mini Formulario de Eliminación */}
                    {mostrarFormEliminar && (
                        <div style={{ margin: '15px 15px', padding: '15px', border: '2px solid red', borderRadius: '8px' }}>
                            <h4>Confirmar Eliminación</h4>
                            <form onSubmit={eliminarEquipo} style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                <input 
                                    type="number" 
                                    placeholder="ID del equipo" 
                                    value={datosEliminar.id} 
                                    onChange={(e) => setDatosEliminar({...datosEliminar, id: e.target.value})} 
                                    required 
                                />
                                <button type="submit" style={{ background: 'red', color: 'white' }}>Confirmar Borrado Permanente</button>
                            </form>
                        </div>
                    )}      
            {/* Lista de equipos */}
            <ul>
                {equipos.map(e => (
                    <li key={e.id}>
                        <Link to={`/equipos/${e.id}`}><strong>{e.nombre}</strong></Link> - {e.entrenador}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// DETALLE DE EQUIPO
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
            <h1>{datos.equipo.nombre}</h1>
            <p><strong>Entrenador:</strong> {datos.equipo.entrenador}</p>
            <hr />
            <h3>Plantilla</h3>
            <ul>{datos.jugadores.map(j => <li key={j.id}>{j.nombre_apellido}</li>)}</ul>
            
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <h3>Resultados</h3>
                    {datos.jugados.map(p => <div key={p.id}>{p.local} {p.puntos_local}-{p.puntos_visitante} {p.visitante}</div>)}
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Pendientes</h3>
                    {datos.pendientes.map(p => <div key={p.id}>{p.local} vs {p.visitante}</div>)}
                </div>
            </div>
        </div>
    );
};

// TABLA DE ANOTADORES (PICHICHI)
const Pichichi = () => {
    const [anotadores, setAnotadores] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5000/api/stats/pichichi').then(res => setAnotadores(res.data));
    }, []);

    return (
        <div>
            <h2>Top Anotadores (Pichichi)</h2>
            <ol>
                {anotadores.map(a => (
                    <li key={a.jugador}>{a.jugador} ({a.equipo}) - <strong>{a.total_puntos} pts</strong></li>
                ))}
            </ol>
        </div>
    );
};

// PARTIDOS
const Partidos = () => {
    const [partidos, setPartidos] = useState([]);
    const cargarPartidos = async () => {
        const res = await axios.get('http://localhost:5000/api/partidos');
        setPartidos(res.data);
    };
    useEffect(() => { cargarPartidos(); }, []);

    return (
        <div>
            <h2>Calendario</h2>
            {partidos.map(p => (
                <div key={p.id} style={{ border: '1px solid #ccc', margin: '5px', padding: '10px' }}>
                    {p.equipo_local} vs {p.equipo_visitante} {p.finalizado && <strong>({p.puntos_local}-{p.puntos_visitante})</strong>}
                </div>
            ))}
        </div>
    );
};

const Navbar = () => {
    const navigate = useNavigate();
    
    // 1. Inicializamos el estado directamente desde localStorage para que sea rápido
    const [auth, setAuth] = useState(localStorage.getItem('token'));
    const [nombreUsuario, setNombreUsuario] = useState(localStorage.getItem('usuario'));

    // 2. Efecto para sincronizar si el componente se monta/desmonta
    useEffect(() => {
        setAuth(localStorage.getItem('token'));
        setNombreUsuario(localStorage.getItem('usuario'));
    }, []);

    const cerrarSesion = () => {
        // Limpiamos los datos del navegador
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        // Actualizamos el estado para que React redibuje el menú sin el botón de salir
        setAuth(null);
        setNombreUsuario(null);

        alert("Has cerrado sesión");
        
        // Redirigimos al inicio y forzamos recarga para limpiar estados de Axios
        window.location.href = '/'; 
    };

    return (
        <nav style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 20px', 
            background: '#2c3e50', // El azul que te gustaba
            color: 'white',
            height: '60px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
            {/* LADO IZQUIERDO: Navegación pública */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Tabla</Link>
                <Link to="/pichichi" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Pichichi</Link>
                <Link to="/partidos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Calendario</Link>
                <Link to="/equipos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Equipos</Link>
            </div>

            {/* LADO DERECHO: Login / Logout */}
            <div>
                {auth ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#ecf0f1' }}>
                            Bienvenido, <strong>{nombreUsuario}</strong>
                        </span>
                        <button 
                            onClick={cerrarSesion} 
                            style={{ 
                                background: '#e74c3c', 
                                color: 'white', 
                                border: 'none', 
                                padding: '8px 15px', 
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <Link 
                        to="/login" 
                        style={{ 
                            background: '#27ae60', 
                            color: 'white', 
                            padding: '8px 15px', 
                            borderRadius: '4px', 
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Entrar
                    </Link>
                )}
            </div>
        </nav>
    );
};

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- COMPONENTE PRINCIPAL ---
function App() {
    return (
        <Router>
            <Navbar />
            <div style={{ padding: '30px' }}>
                <Routes>
                    <Route path="/" element={<TablaPosiciones />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/equipos" element={<RutaPrivada><Equipos /></RutaPrivada>} />
                    <Route path="/equipos/:id" element={<DetalleEquipo />} />
                    <Route path="/partidos" element={<Partidos />} />
                    <Route path="/pichichi" element={<Pichichi />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;