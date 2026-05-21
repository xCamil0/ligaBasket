/**
 * tablaController.js — Controlador de la tabla de posiciones.
 * Calcula estadísticas (PJ, G, E, P, PF, PC, DP, PTS) para cada equipo en una temporada.
 */
const pool = require('../config/db');

/** Calcula y devuelve la tabla de posiciones para la temporada indicada (?temporada_id=X). */
const obtenerTabla = async (req, res) => {
    const { temporada_id } = req.query;

    if (!temporada_id) {
        return res.status(400).json({ error: "Debes especificar una temporada" });
    }

    try {
        const result = await pool.query(`
            WITH stats AS (
                SELECT 
                    e.id,
                    e.nombre,
                    e.logo,
                    COUNT(p.id) FILTER (WHERE p.finalizado = true) as pj,
                    COUNT(p.id) FILTER (WHERE p.finalizado = true AND (
                        (p.id_equipo_local = e.id AND p.puntos_local > p.puntos_visitante) OR 
                        (p.id_equipo_visitante = e.id AND p.puntos_visitante > p.puntos_local)
                    )) as g,
                    COUNT(p.id) FILTER (WHERE p.finalizado = true AND p.puntos_local = p.puntos_visitante) as e,
                    COUNT(p.id) FILTER (WHERE p.finalizado = true AND (
                        (p.id_equipo_local = e.id AND p.puntos_local < p.puntos_visitante) OR 
                        (p.id_equipo_visitante = e.id AND p.puntos_visitante < p.puntos_local)
                    )) as p,
                    SUM(CASE 
                        WHEN p.id_equipo_local = e.id THEN COALESCE(p.puntos_local, 0)
                        WHEN p.id_equipo_visitante = e.id THEN COALESCE(p.puntos_visitante, 0)
                        ELSE 0 END) as pf,
                    SUM(CASE 
                        WHEN p.id_equipo_local = e.id THEN COALESCE(p.puntos_visitante, 0) 
                        WHEN p.id_equipo_visitante = e.id THEN COALESCE(p.puntos_local, 0)
                        ELSE 0 END) as pc
                FROM equipos e
                JOIN temporada_equipos te ON e.id = te.equipo_id
                LEFT JOIN partidos p ON (e.id = p.id_equipo_local OR e.id = p.id_equipo_visitante) AND p.temporada_id = $1 AND p.finalizado = true
                WHERE te.temporada_id = $1
                GROUP BY e.id, e.nombre, e.logo
            )
            SELECT 
                id, nombre, logo,
                pj, g, e, p, pf, pc,
                (pf - pc) as dp,
                ((g * 3) + (e * 1)) as pts
            FROM stats 
            ORDER BY pts DESC, dp DESC, pf DESC;
        `, [temporada_id]);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al calcular la tabla" });
    }
};

module.exports = { obtenerTabla };