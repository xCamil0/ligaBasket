const pool = require('../config/db');

const listar = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM temporadas ORDER BY fecha_inicio DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar temporadas:', error);
        res.status(500).json({ error: 'Error al listar temporadas' });
    }
};

const crear = async (req, res) => {
    const { nombre, fecha_inicio, fecha_fin } = req.body;
    try {
        const result = await pool.query('INSERT INTO temporadas (nombre, fecha_inicio, fecha_fin) VALUES ($1, $2, $3) RETURNING *', [nombre, fecha_inicio, fecha_fin]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear temporada:', error);
        res.status(500).json({ error: 'Error al crear temporada' });
    }
};

const eliminar = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM partidos WHERE temporada_id = $1', [id]);

        await pool.query('DELETE FROM equipos WHERE temporada_id = $1', [id]);

        await pool.query('DELETE FROM temporadas WHERE id = $1', [id]);
        res.json({ message: 'Temporada eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar temporada:', error);
        res.status(500).json({ error: 'Error al eliminar temporada' });
    }
};

const actualizar = async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha_inicio, fecha_fin } = req.body;
    try {
        const result = await pool.query('UPDATE temporadas SET nombre = $1, fecha_inicio = $2, fecha_fin = $3 WHERE id = $4 RETURNING *', [nombre, fecha_inicio, fecha_fin, id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar temporada:', error);
        res.status(500).json({ error: 'Error al actualizar temporada' });
    }
};


module.exports = { listar, crear, eliminar, actualizar };