const pool = require('../config/db');

// Obtener todos los partidos con los nombres de los equipos
const obtenerPartidos = async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                   e1.nombre AS equipo_local, 
                   e2.nombre AS equipo_visitante
            FROM partidos p
            JOIN equipos e1 ON p.id_equipo_local = e1.id
            JOIN equipos e2 ON p.id_equipo_visitante = e2.id
            ORDER BY p.fecha DESC;
        `;
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los partidos" });
    }
};

// Registrar un nuevo partido
const crearPartido = async (req, res) => {
    const { id_equipo_local, id_equipo_visitante, fecha, horario, lugar } = req.body;
    try {
        const choque = await pool.query(
            `SELECT * FROM partidos 
             WHERE fecha = $1 AND horario = $2 
             AND (id_equipo_local IN ($3, $4) OR id_equipo_visitante IN ($3, $4))`,
            [fecha, horario, id_equipo_local, id_equipo_visitante]
        );

        if (choque.rows.length > 0) {
            return res.status(400).json({ error: "Uno de los equipos ya tiene un partido programado en esa fecha y hora" });
        }

        const nuevo = await pool.query(
            'INSERT INTO partidos (id_equipo_local, id_equipo_visitante, fecha, horario, lugar) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id_equipo_local, id_equipo_visitante, fecha, horario, lugar]
        );
        res.status(201).json(nuevo.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el partido" });
    }
};

const finalizarPartido = async (req, res) => {
    const { id } = req.params; 
    const { puntos_local, puntos_visitante, anotaciones } = req.body; 

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        // 1. Actualizar el resultado del partido y marcar como finalizado
        const actualizarRes = await client.query(
            `UPDATE partidos 
             SET puntos_local = $1, puntos_visitante = $2, finalizado = true 
             WHERE id = $3 RETURNING *`,
            [puntos_local, puntos_visitante, id]
        );

        if (actualizarRes.rows.length === 0) {
            throw new Error("Partido no encontrado");
        }

        const partido = actualizarRes.rows[0];
        
        // 2. Lógica de puntos para la tabla de posiciones
        let idGanador = null;
        if (puntos_local > puntos_visitante) {
            idGanador = partido.id_equipo_local;
        } else if (puntos_visitante > puntos_local) {
            idGanador = partido.id_equipo_visitante;
        }

        // 3. Sumar puntos al equipo ganador
        if (idGanador) {
            await client.query(
                'UPDATE equipos SET puntos_totales = puntos_totales + 3 WHERE id = $1',
                [idGanador]
            );
        } else {
            // OPCIONAL: Si quieres manejar empates (1 punto a cada uno)
            await client.query(
                'UPDATE equipos SET puntos_totales = puntos_totales + 1 WHERE id IN ($1, $2)',
                [partido.id_equipo_local, partido.id_equipo_visitante]
            );
        }

        // 4. NUEVO: Guardar puntos individuales de los jugadores (Pichichi)
        if (anotaciones && anotaciones.length > 0) {
            for (let nota of anotaciones) {
                await client.query(
                    'INSERT INTO anotaciones (id_partido, id_jugador, puntos_anotados) VALUES ($1, $2, $3)',
                    [id, nota.jugador_id, nota.puntos]
                );
            }
        }

        await client.query('COMMIT'); 
        res.json({ mensaje: "Partido y estadísticas de jugadores guardados", partido });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error("Error en transacción:", error);
        res.status(500).json({ error: "Error al procesar el final del partido" });
    } finally {
        client.release(); 
    }
};

const actualizarPartido = async (req, res) => {
    const { id } = req.params;
    const { id_equipo_local, id_equipo_visitante, puntos_local, puntos_visitante, fecha, horario, lugar } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE partidos SET id_equipo_local = $1, id_equipo_visitante = $2, puntos_local = $3, puntos_visitante = $4, fecha = $5, horario = $6, lugar = $7 WHERE id = $8 RETURNING *',
            [id_equipo_local, id_equipo_visitante, puntos_local, puntos_visitante, fecha, horario, lugar, id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ error: "Partido no encontrado" });
        res.json({ mensaje: "Partido actualizado", partido: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar partido" });
    }
};

const eliminarPartido = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('DELETE FROM partidos WHERE id = $1 RETURNING *', [id]);
        if (resultado.rows.length === 0) return res.status(404).json({ error: "Partido no existe" });
        res.json({ mensaje: "Partido eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar partido" });
    }
};

const obtenerJugadoresDelPartido = async (req, res) => {
    const { id } = req.params; // ID del partido
    try {
        const query = `
            SELECT j.id, j.nombre_apellido, j.equipo_id, e.nombre as nombre_equipo
            FROM partidos p
            JOIN jugadores j ON (j.equipo_id = p.id_equipo_local OR j.equipo_id = p.id_equipo_visitante)
            JOIN equipos e ON j.equipo_id = e.id
            WHERE p.id = $1;
        `;
        const resultado = await pool.query(query, [id]);
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener jugadores del encuentro" });
    }
};

module.exports = { obtenerPartidos, crearPartido, finalizarPartido, actualizarPartido, eliminarPartido, obtenerJugadoresDelPartido};