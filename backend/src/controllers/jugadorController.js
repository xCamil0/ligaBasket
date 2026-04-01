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
    const { nombre_apellido, categoria, equipo_id } = req.body;
    try {
        const nuevo = await pool.query(
            'INSERT INTO jugadores (nombre_apellido, categoria, equipo_id) VALUES ($1, $2, $3) RETURNING *',
            [nombre_apellido, categoria, equipo_id]
        );
        res.status(201).json(nuevo.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al registrar jugador" });
    }
};

const actualizarJugador = async (req, res) => {
    const { id } = req.params;
    const { nombre_apellido, categoria, equipo_id } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE jugadores SET nombre_apellido = $1, categoria = $2, equipo_id = $3 WHERE id = $4 RETURNING *',
            [nombre_apellido, categoria, equipo_id, id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ error: "Jugador no encontrado" });
        res.json({ mensaje: "Jugador actualizado", jugador: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar jugador" });
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

module.exports = { obtenerJugadoresPorEquipo, crearJugador, actualizarJugador, eliminarJugador };