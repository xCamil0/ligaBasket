const pool = require('../config/db');

const obtenerPichichi = async (req, res) => {
    const { temporada_id } = req.query;
    try {

        const existeTemporada = await pool.query('SELECT id FROM temporadas WHERE id = $1', [temporada_id]);

        if (existeTemporada.rows.length === 0) {
            // Si no hay resultados, devolvemos error 404 y cortamos la ejecución
            return res.status(404).json({ 
                error: "Temporada no encontrada",
                mensaje: `El ID ${temporada_id} no corresponde a ninguna temporada registrada.` 
            });
        }

        const query = `
            SELECT 
                j.id,
                j.nombre_apellido,
                e.nombre AS nombre_equipo,
                SUM(a.puntos_anotados) AS total_puntos
            FROM jugadores j
            JOIN anotaciones a ON j.id = a.id_jugador
            LEFT JOIN equipos e ON j.equipo_id = e.id
            WHERE a.temporada_id = $1
            GROUP BY j.id, j.nombre_apellido, e.nombre
            ORDER BY total_puntos DESC
            LIMIT 10;
        `;

        if (!temporada_id) {
            return res.status(400).json({ error: "Falta el parámetro temporada_id" });
        }

        if (isNaN(temporada_id)) {
            return res.status(400).json({ error: "El parámetro temporada_id debe ser un número" });
        }

        const resultado = await pool.query(query, [temporada_id]);
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el ranking de anotadores" });
    }
};

module.exports = { obtenerPichichi };