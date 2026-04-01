import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/equipos';

const Equipos = () => {
    const [equipos, setEquipos] = useState([]);
    const [nuevoEquipo, setNuevoEquipo] = useState({ nombre: '', entrenador: '' });

    const cargarEquipos = async () => {
        const res = await axios.get(API_URL);
        setEquipos(res.data);
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, nuevoEquipo);
            setNuevoEquipo({ nombre: '', entrenador: '' }); // Limpiar
            cargarEquipos(); // Refrescar lista
            alert("¡Equipo creado!");
        } catch {
            alert("Error al crear");
        }
    };

    const borrarEquipo = async (id) => {
        if (window.confirm("¿Seguro que quieres borrarlo?")) {
            await axios.delete(`${API_URL}/${id}`);
            cargarEquipos();
        }
    };

    useEffect(() => { cargarEquipos(); }, []);

    return (
        <div>
            <h2>Gestión de Equipos</h2>
            
            {/* Formulario */}
            <form onSubmit={manejarSubmit} style={{ marginBottom: '20px' }}>
                <input 
                    type="text" placeholder="Nombre del Equipo" required
                    value={nuevoEquipo.nombre}
                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, nombre: e.target.value})}
                />
                <input 
                    type="text" placeholder="Entrenador" required
                    value={nuevoEquipo.entrenador}
                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, entrenador: e.target.value})}
                />
                <button type="submit">➕ Agregar</button>
            </form>

            {/* Lista con Botones */}
            <ul>
                {equipos.map(eq => (
                    <li key={eq.id}>
                        {eq.nombre} - Coach: {eq.entrenador} 
                        <button onClick={() => borrarEquipo(eq.id)} style={{color: 'red', marginLeft: '10px'}}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Equipos;