/**
 * temporadasController.js — Controlador de temporadas.
 * CRUD de temporadas, definir temporada actual y asignar equipos.
 */
const pool = require('../config/db');

/** Lista todas las temporadas ordenadas por fecha de inicio descendente. */
const listar = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM temporadas ORDER BY fecha_inicio DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar temporadas:', error);
        res.status(500).json({ error: 'Error al listar temporadas' });
    }
};

/** Crea una nueva temporada con nombre y rango de fechas. */
const crear = async (req, res) => {
    const { nombre, fecha_inicio, fecha_fin } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO temporadas (nombre, fecha_inicio, fecha_fin) VALUES ($1, $2, $3) RETURNING *',
            [nombre, fecha_inicio, fecha_fin]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear temporada:', error);
        res.status(500).json({ error: 'Error al crear temporada' });
    }
};

/** Elimina una temporada y sus datos relacionados (partidos y vínculos con equipos). */
const eliminar = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('SELECT id FROM temporadas WHERE id = $1', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "Temporada no encontrada" });
        }

        await pool.query('DELETE FROM partidos WHERE temporada_id = $1', [id]);
        await pool.query('DELETE FROM temporada_equipos WHERE temporada_id = $1', [id]);
        await pool.query('DELETE FROM temporadas WHERE id = $1', [id]);

        res.json({ message: 'Temporada eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar temporada:', error);
        res.status(500).json({ error: 'Error al eliminar temporada' });
    }
};

/** Actualiza nombre y fechas de una temporada. */
const actualizar = async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha_inicio, fecha_fin } = req.body;
    try {
        const result = await pool.query(
            'UPDATE temporadas SET nombre = $1, fecha_inicio = $2, fecha_fin = $3 WHERE id = $4 RETURNING *',
            [nombre, fecha_inicio, fecha_fin, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar temporada:', error);
        res.status(500).json({ error: 'Error al actualizar temporada' });
    }
};

/** Define una temporada como la actual (usa transacción para desactivar las demás). */
const actual = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('BEGIN');
        await pool.query('UPDATE temporadas SET actual = false');
        const resultado = await pool.query(
            'UPDATE temporadas SET actual = true WHERE id = $1 RETURNING *',
            [id]
        );
        await pool.query('COMMIT');

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "Temporada no encontrada" });
        }

        res.json({ mensaje: "Temporada actual actualizada", temporada: resultado.rows[0] });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Error al definir temporada actual" });
    }
};

/** Asigna un array de equipos a una temporada (ON CONFLICT para evitar duplicados). */
const asignarEquipos = async (req, res) => {
    const { temporada_id, equipos_ids } = req.body;

    if (!temporada_id || !Array.isArray(equipos_ids) || equipos_ids.length === 0) {
        return res.status(400).json({ error: "Debes enviar la temporada y una lista de equipos." });
    }

    try {
        await pool.query('BEGIN');

        const consultas = equipos_ids.map(equipo_id =>
            pool.query(
                'INSERT INTO temporada_equipos (temporada_id, equipo_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [temporada_id, equipo_id]
            )
        );

        await Promise.all(consultas);
        await pool.query('COMMIT');

        res.json({ mensaje: `${equipos_ids.length} equipos asignados correctamente a la temporada.` });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Error al asignar los equipos." });
    }
};

/** Devuelve los equipos activos inscritos en una temporada específica (por param). */
const obtenerEquipos = async (req, res) => {
    const { temporada_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT e.id, e.nombre, e.logo, e.estadio, te.puntos_totales
             FROM equipos e
             JOIN temporada_equipos te ON e.id = te.equipo_id
             WHERE te.temporada_id = $1 AND e.activo = true
             ORDER BY e.nombre ASC`,
            [temporada_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener equipos:", error);
        res.status(500).json({ error: "Error al obtener equipos" });
    }
};

module.exports = { listar, crear, eliminar, actualizar, actual, asignarEquipos, obtenerEquipos };