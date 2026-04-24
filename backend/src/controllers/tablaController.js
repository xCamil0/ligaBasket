const pool = require('../config/db');

const obtenerTabla = async (req, res) => {
    const { temporada } = req.query;

    if (!temporada) {
        return res.status(400).json({ error: "Debes especificar una temporada" });
    }

    try {
        const query = `
            WITH stats AS (
                SELECT 
                    e.id,
                    e.nombre,
                    e.logo_url,
                    -- Partidos Jugados
                    COUNT(p.id) FILTER (WHERE p.finalizado = true) as pj,
                    -- Puntos (3 por victoria, 1 empate - ajusta según tu deporte)
                    SUM(
                        CASE 
                            WHEN p.finalizado = true AND (
                                (p.id_local = e.id AND p.puntos_local > p.puntos_visitante) OR 
                                (p.id_visitante = e.id AND p.puntos_visitante > p.puntos_local)
                            ) THEN 3
                            WHEN p.finalizado = true AND p.puntos_local = p.puntos_visitante THEN 1
                            ELSE 0 
                        END
                    ) as puntos
                FROM equipos e
                LEFT JOIN partidos p ON (e.id = p.id_local OR e.id = p.id_visitante)
                WHERE e.temporada_id = $1 -- FILTRO CLAVE
                GROUP BY e.id, e.nombre, e.logo_url
            )
            SELECT * FROM stats ORDER BY puntos DESC;
        `;

        const result = await pool.query(query, [temporada]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al calcular la tabla" });
    }
};

module.exports = { obtenerTabla };