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

/** Crea una nueva temporada con validaciones de nombre único, fechas y duración mínima. */
const crear = async (req, res) => {
    const { nombre, fecha_inicio, fecha_fin } = req.body;

    // Validar campos obligatorios
    if (!nombre || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'El nombre, la fecha de inicio y la fecha de fin son obligatorios.' });
    }

    // Validar formato de fechas
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        return res.status(400).json({ error: 'El formato de las fechas no es válido.' });
    }

    // Validar que fecha_inicio < fecha_fin
    if (inicio >= fin) {
        return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha de finalización.' });
    }

    // Validar duración mínima de 5 meses
    const diffMs = fin - inicio;
    const diffDias = diffMs / (1000 * 60 * 60 * 24);
    if (diffDias < 150) { // ~5 meses = 150 días
        return res.status(400).json({ error: 'La temporada debe durar al menos 5 meses.' });
    }

    try {
        // Verificar nombre único (case-insensitive)
        const nombreExiste = await pool.query(
            'SELECT id FROM temporadas WHERE LOWER(nombre) = LOWER($1)',
            [nombre.trim()]
        );
        if (nombreExiste.rows.length > 0) {
            return res.status(400).json({ error: `Ya existe una temporada con el nombre "${nombre}". Los nombres de temporada deben ser únicos (sin importar mayúsculas/minúsculas).` });
        }

        // Verificar duplicidad por fechas exactas
        const fechasDuplicadas = await pool.query(
            'SELECT id, nombre FROM temporadas WHERE fecha_inicio = $1 AND fecha_fin = $2',
            [fecha_inicio, fecha_fin]
        );
        if (fechasDuplicadas.rows.length > 0) {
            return res.status(400).json({
                error: `Ya existe la temporada "${fechasDuplicadas.rows[0].nombre}" con las mismas fechas de inicio y fin.`
            });
        }

        const result = await pool.query(
            'INSERT INTO temporadas (nombre, fecha_inicio, fecha_fin) VALUES ($1, $2, $3) RETURNING *',
            [nombre.trim(), fecha_inicio, fecha_fin]
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

/** Actualiza nombre y fechas de una temporada con las mismas validaciones que crear. */
const actualizar = async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha_inicio, fecha_fin } = req.body;

    // Validar campos obligatorios
    if (!nombre || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'El nombre, la fecha de inicio y la fecha de fin son obligatorios.' });
    }

    // Validar formato de fechas
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        return res.status(400).json({ error: 'El formato de las fechas no es válido.' });
    }

    // Validar que fecha_inicio < fecha_fin
    if (inicio >= fin) {
        return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha de finalización.' });
    }

    // Validar duración mínima de 5 meses
    const diffMs = fin - inicio;
    const diffDias = diffMs / (1000 * 60 * 60 * 24);
    if (diffDias < 150) {
        return res.status(400).json({ error: 'La temporada debe durar al menos 5 meses.' });
    }

    try {
        // Verificar nombre único (case-insensitive), excluyendo la temporada actual
        const nombreExiste = await pool.query(
            'SELECT id FROM temporadas WHERE LOWER(nombre) = LOWER($1) AND id != $2',
            [nombre.trim(), id]
        );
        if (nombreExiste.rows.length > 0) {
            return res.status(400).json({ error: `Ya existe una temporada con el nombre "${nombre}". Los nombres de temporada deben ser únicos (sin importar mayúsculas/minúsculas).` });
        }

        const result = await pool.query(
            'UPDATE temporadas SET nombre = $1, fecha_inicio = $2, fecha_fin = $3 WHERE id = $4 RETURNING *',
            [nombre.trim(), fecha_inicio, fecha_fin, id]
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

/** Asigna un array de equipos a una temporada de forma atómica. */
const asignarEquipos = async (req, res) => {
    const { temporada_id, equipos_ids } = req.body;

    if (!temporada_id || !Array.isArray(equipos_ids) || equipos_ids.length === 0) {
        return res.status(400).json({ error: "Debes enviar la temporada y una lista de equipos." });
    }

    try {
        // Operación atómica: un único INSERT que inserta todos los registros utilizando unnest()
        await pool.query(
            `INSERT INTO temporada_equipos (temporada_id, equipo_id)
             SELECT $1, unnest($2::int[])
             ON CONFLICT DO NOTHING`,
            [temporada_id, equipos_ids]
        );

        res.json({ mensaje: `${equipos_ids.length} equipos asignados correctamente a la temporada.` });
    } catch (error) {
        console.error("Error al asignar equipos:", error);
        res.status(500).json({ error: "Error al asignar los equipos." });
    }
};

/**
 * Desasigna equipos de una temporada de forma atómica.
 * Usa un único DELETE con ANY($2) para evitar bugs de eliminación parcial.
 */
const desasignarEquipos = async (req, res) => {
    const { temporada_id, equipos_ids } = req.body;

    if (!temporada_id || !Array.isArray(equipos_ids) || equipos_ids.length === 0) {
        return res.status(400).json({ error: "Debes enviar la temporada y una lista de equipos." });
    }

    try {
        // Operación atómica: un solo DELETE que elimina todos los registros de una vez
        await pool.query(
            'DELETE FROM temporada_equipos WHERE temporada_id = $1 AND equipo_id = ANY($2::int[])',
            [temporada_id, equipos_ids]
        );

        res.json({ mensaje: `${equipos_ids.length} equipos desasignados correctamente de la temporada.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al desasignar los equipos." });
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

/** Obtiene un resumen de los partidos pendientes, sin resultado y equipos de una temporada. */
const obtenerResumenTemporada = async (req, res) => {
    const { id } = req.params;
    try {
        const tempCheck = await pool.query('SELECT * FROM temporadas WHERE id = $1', [id]);
        if (tempCheck.rows.length === 0) {
            return res.status(404).json({ error: "Temporada no encontrada" });
        }

        const partidosSinResultadoRes = await pool.query(
            "SELECT COUNT(*)::int as cant FROM partidos WHERE temporada_id = $1 AND finalizado = true AND (puntos_local IS NULL OR puntos_visitante IS NULL)",
            [id]
        );

        const partidosSinJugarRes = await pool.query(
            "SELECT COUNT(*)::int as cant FROM partidos WHERE temporada_id = $1 AND finalizado = false",
            [id]
        );

        const partidosTotalesRes = await pool.query(
            "SELECT COUNT(*)::int as cant FROM partidos WHERE temporada_id = $1",
            [id]
        );

        const equiposAsignadosRes = await pool.query(
            "SELECT COUNT(*)::int as cant FROM temporada_equipos WHERE temporada_id = $1",
            [id]
        );

        res.json({
            nombre: tempCheck.rows[0].nombre,
            finalizada: tempCheck.rows[0].finalizada || false,
            partidosSinResultado: partidosSinResultadoRes.rows[0].cant,
            partidosSinJugar: partidosSinJugarRes.rows[0].cant,
            partidosTotales: partidosTotalesRes.rows[0].cant,
            equiposAsignados: equiposAsignadosRes.rows[0].cant
        });
    } catch (error) {
        console.error("Error al obtener resumen de temporada:", error);
        res.status(500).json({ error: "Error al obtener el resumen de la temporada" });
    }
};

/** Finaliza una temporada cambiando su estado a finalizada = true. */
const finalizarTemporada = async (req, res) => {
    const { id } = req.params;
    try {
        const tempCheck = await pool.query('SELECT * FROM temporadas WHERE id = $1', [id]);
        if (tempCheck.rows.length === 0) {
            return res.status(404).json({ error: "Temporada no encontrada" });
        }

        if (tempCheck.rows[0].finalizada) {
            return res.status(400).json({ error: "La temporada ya se encuentra finalizada" });
        }

        const result = await pool.query(
            'UPDATE temporadas SET finalizada = true WHERE id = $1 RETURNING *',
            [id]
        );

        res.json({
            mensaje: "Temporada finalizada correctamente",
            temporada: result.rows[0]
        });
    } catch (error) {
        console.error("Error al finalizar temporada:", error);
        res.status(500).json({ error: "Error al finalizar la temporada" });
    }
};

/** Reabre una temporada finalizada cambiando su estado a finalizada = false. */
const reabrirTemporada = async (req, res) => {
    const { id } = req.params;
    try {
        const tempCheck = await pool.query('SELECT * FROM temporadas WHERE id = $1', [id]);
        if (tempCheck.rows.length === 0) {
            return res.status(404).json({ error: "Temporada no encontrada" });
        }

        if (!tempCheck.rows[0].finalizada) {
            return res.status(400).json({ error: "La temporada no está finalizada" });
        }

        const result = await pool.query(
            'UPDATE temporadas SET finalizada = false WHERE id = $1 RETURNING *',
            [id]
        );

        res.json({
            mensaje: "Temporada reabierta correctamente",
            temporada: result.rows[0]
        });
    } catch (error) {
        console.error("Error al reabrir temporada:", error);
        res.status(500).json({ error: "Error al reabrir la temporada" });
    }
};

module.exports = {
    listar,
    crear,
    eliminar,
    actualizar,
    actual,
    asignarEquipos,
    desasignarEquipos,
    obtenerEquipos,
    obtenerResumenTemporada,
    finalizarTemporada,
    reabrirTemporada
};