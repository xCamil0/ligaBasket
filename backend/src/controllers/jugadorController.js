const pool = require('../config/db');

const obtenerJugadoresPorEquipo = async (req, res) => {
    const { equipo_id } = req.params;
    try {
        const resultado = await pool.query(
            'SELECT * FROM jugadores WHERE equipo_id = $1', 
            [equipo_id]
        );
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener jugadores" });
    }
};

const crearJugador = async (req, res) => {
    const { nombre_apellido, categoria, equipo_id, dorsal} = req.body;
    try {
        const nuevo = await pool.query(
            'INSERT INTO jugadores (nombre_apellido, categoria, equipo_id, dorsal) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre_apellido, categoria, equipo_id, dorsal]
        );
        res.status(201).json(nuevo.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al registrar jugador" });
    }
};

const actualizarJugador = async (req, res) => {
    const { id } = req.params;
    const { nombre_apellido, categoria, equipo_id, dorsal } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE jugadores SET nombre_apellido = $1, categoria = $2,  equipo_id = $3, dorsal = $4 WHERE id = $5 RETURNING *',
            [nombre_apellido, categoria, equipo_id, dorsal, id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ error: "Jugador no encontrado" });
        res.json({ mensaje: "Jugador actualizado", jugador: resultado.rows[0] });
    } catch (error) {
        res.status(500).json(error);
    }
};

const eliminarJugador = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('DELETE FROM jugadores WHERE id = $1 RETURNING *', [id]);
        if (resultado.rows.length === 0) return res.status(404).json({ error: "Jugador no existe" });
        res.json({ mensaje: "Jugador eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar jugador" });
    }
};

const obtenerTodosLosJugadores = async (req, res) => {
    try {
        const query = `
            SELECT 
                j.id, 
                j.nombre_apellido, 
                j.categoria, 
                j.dorsal, 
                j.equipo_id,
                e.nombre AS nombre_equipo 
            FROM jugadores j
            LEFT JOIN equipos e ON j.equipo_id = e.id
            ORDER BY j.nombre_apellido ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("DETALLE DEL ERROR:", error.message);
        res.status(500).json({ error: "Error en la consulta SQL", detalle: error.message });
    }
};

const obtenerAgentesLibres = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM jugadores WHERE equipo_id IS NULL ORDER BY nombre_apellido ASC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerTrayectoriaJugador = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                e.nombre AS equipo, 
                t.nombre AS temporada, 
                hf.fecha_fichaje
            FROM historial_fichajes hf
            JOIN equipos e ON hf.equipo_id = e.id
            JOIN temporadas t ON hf.temporada_id = t.id
            WHERE hf.jugador_id = $1
            ORDER BY hf.fecha_fichaje DESC
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener historial" });
    }
};

module.exports = { obtenerJugadoresPorEquipo, crearJugador, actualizarJugador, eliminarJugador, obtenerTodosLosJugadores, obtenerAgentesLibres, obtenerTrayectoriaJugador };