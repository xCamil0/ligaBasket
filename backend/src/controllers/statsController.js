const pool = require('../config/db');

const obtenerPichichi = async (req, res) => {
    try {
        const query = `
            SELECT 
                j.nombre_apellido AS jugador,
                e.nombre AS equipo,
                SUM(a.puntos_anotados) AS total_puntos,
                COUNT(DISTINCT a.id_partido) AS partidos_jugados,
                ROUND(AVG(a.puntos_anotados), 2) AS promedio_por_partido
            FROM anotaciones a
            JOIN jugadores j ON a.id_jugador = j.id
            JOIN equipos e ON j.equipo_id = e.id
            GROUP BY j.id, j.nombre_apellido, e.nombre
            ORDER BY total_puntos DESC
            LIMIT 10;
        `;
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener la tabla de anotadores" });
    }
};

module.exports = { obtenerPichichi };