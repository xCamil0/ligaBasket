/**
 * jugadorController.js — Controlador de jugadores.
 * CRUD, listado general, agentes libres y trayectoria de fichajes.
 */
const pool = require('../config/db');

/** Devuelve los jugadores de un equipo específico. */
const obtenerJugadoresPorEquipo = async (req, res) => {
    const { equipo_id } = req.params;
    try {
        const resultado = await pool.query(
            'SELECT * FROM jugadores WHERE equipo_id = $1',
            [equipo_id]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener jugadores:", error);
        res.status(500).json({ error: "Error al obtener jugadores" });
    }
};

/** Registra un nuevo jugador con nombre, categoría, equipo y dorsal. */
const crearJugador = async (req, res) => {
    const { nombre_apellido, categoria, equipo_id, dorsal } = req.body;
    try {
        const nuevo = await pool.query(
            'INSERT INTO jugadores (nombre_apellido, categoria, equipo_id, dorsal) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre_apellido, categoria, equipo_id, dorsal]
        );
        res.status(201).json(nuevo.rows[0]);
    } catch (error) {
        console.error("Error al registrar jugador:", error);
        res.status(500).json({ error: "Error al registrar jugador" });
    }
};

/** Actualiza los datos de un jugador existente. */
const actualizarJugador = async (req, res) => {
    const { id } = req.params;
    const { nombre_apellido, categoria, equipo_id, dorsal } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE jugadores SET nombre_apellido = $1, categoria = $2, equipo_id = $3, dorsal = $4 WHERE id = $5 RETURNING *',
            [nombre_apellido, categoria, equipo_id, dorsal, id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ error: "Jugador no encontrado" });
        res.json({ mensaje: "Jugador actualizado", jugador: resultado.rows[0] });
    } catch (error) {
        console.error("Error al actualizar jugador:", error);
        res.status(500).json({ error: "Error al actualizar jugador" });
    }
};

/** Elimina un jugador por ID. */
const eliminarJugador = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('DELETE FROM jugadores WHERE id = $1 RETURNING *', [id]);
        if (resultado.rows.length === 0) return res.status(404).json({ error: "Jugador no existe" });
        res.json({ mensaje: "Jugador eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar jugador:", error);
        res.status(500).json({ error: "Error al eliminar jugador" });
    }
};

/** Lista todos los jugadores con nombre de equipo, puntos por temporada y trayectoria consolidada. */
const obtenerTodosLosJugadores = async (req, res) => {
    try {
        // 1. Obtener todos los jugadores
        const jugadoresRes = await pool.query(`
            SELECT 
                j.id, 
                j.nombre_apellido, 
                j.categoria, 
                j.dorsal, 
                j.equipo_id,
                e.nombre AS nombre_equipo,
                e.logo AS logo_equipo
            FROM jugadores j
            LEFT JOIN equipos e ON j.equipo_id = e.id
            ORDER BY j.nombre_apellido ASC
        `);
        const jugadores = jugadoresRes.rows;

        // 2. Obtener puntos por temporada de todos los jugadores
        const puntosRes = await pool.query(`
            SELECT 
                a.id_jugador,
                t.id AS temporada_id,
                t.nombre AS nombre_temporada,
                SUM(a.puntos_anotados) AS puntos_totales
            FROM anotaciones a
            JOIN temporadas t ON a.temporada_id = t.id
            GROUP BY a.id_jugador, t.id, t.nombre
            ORDER BY t.fecha_inicio DESC
        `);
        const puntosRows = puntosRes.rows;

        // 3. Obtener trayectoria (historial de fichajes) de todos los jugadores
        const trayectoriaRes = await pool.query(`
            SELECT 
                hf.jugador_id,
                COALESCE(e.nombre, 'Agente Libre') AS nombre_equipo,
                t.nombre AS nombre_temporada,
                hf.fecha_fichaje
            FROM historial_fichajes hf
            LEFT JOIN equipos e ON hf.equipo_id = e.id
            JOIN temporadas t ON hf.temporada_id = t.id
            ORDER BY hf.fecha_fichaje DESC
        `);
        const trayectoriaRows = trayectoriaRes.rows;

        // Agrupar por jugador
        const puntosPorJugador = {};
        puntosRows.forEach(row => {
            if (!puntosPorJugador[row.id_jugador]) {
                puntosPorJugador[row.id_jugador] = [];
            }
            puntosPorJugador[row.id_jugador].push({
                temporada_id: row.temporada_id,
                nombre_temporada: row.nombre_temporada,
                puntos: parseInt(row.puntos_totales, 10)
            });
        });

        const trayectoriaPorJugador = {};
        trayectoriaRows.forEach(row => {
            if (!trayectoriaPorJugador[row.jugador_id]) {
                trayectoriaPorJugador[row.jugador_id] = [];
            }
            trayectoriaPorJugador[row.jugador_id].push({
                equipo: row.nombre_equipo,
                temporada: row.nombre_temporada,
                fecha: row.fecha_fichaje
            });
        });

        // Consolidar
        const resultado = jugadores.map(j => ({
            ...j,
            puntos_temporadas: puntosPorJugador[j.id] || [],
            trayectoria: trayectoriaPorJugador[j.id] || []
        }));

        res.json(resultado);
    } catch (error) {
        console.error("Error al obtener jugadores consolidado:", error);
        res.status(500).json({ error: "Error al obtener jugadores consolidado" });
    }
};

/** Devuelve jugadores sin equipo asignado (agentes libres). */
const obtenerAgentesLibres = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM jugadores WHERE equipo_id IS NULL ORDER BY nombre_apellido ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener agentes libres:", error);
        res.status(500).json({ error: "Error al obtener agentes libres" });
    }
};

/** Devuelve el historial de fichajes de un jugador (equipos y temporadas). */
const obtenerTrayectoriaJugador = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                e.nombre AS equipo, 
                t.nombre AS temporada, 
                hf.fecha_fichaje
            FROM historial_fichajes hf
            JOIN equipos e ON hf.equipo_id = e.id 
            JOIN temporadas t ON hf.temporada_id = t.id
            WHERE hf.jugador_id = $1
            ORDER BY hf.fecha_fichaje DESC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener trayectoria:", error);
        res.status(500).json({ error: "Error al obtener historial" });
    }
};

module.exports = {
    obtenerJugadoresPorEquipo,
    crearJugador,
    actualizarJugador,
    eliminarJugador,
    obtenerTodosLosJugadores,
    obtenerAgentesLibres,
    obtenerTrayectoriaJugador
};