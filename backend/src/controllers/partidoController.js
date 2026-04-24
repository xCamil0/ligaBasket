const pool = require('../config/db');


// Obtener todos los partidos con los nombres de los equipos
const obtenerCalendarioFiltrado = async (req, res) => {
    const { temporada_id } = req.params;
    const { jornada } = req.query; // Se saca de la URL: ?jornada=1

    try {
        const query = `
            SELECT 
                p.*, 
                e1.nombre AS local, 
                e1.logo_url AS logo_local,
                e2.nombre AS visitante, 
                e2.logo_url AS logo_visitante
            FROM partidos p
            JOIN equipos e1 ON p.id_equipo_local = e1.id
            JOIN equipos e2 ON p.id_equipo_visitante = e2.id
            WHERE p.temporada_id = $1 AND p.jornada = $2
            ORDER BY p.fecha ASC, p.horario ASC
        `;
        
        const result = await pool.query(query, [temporada_id, jornada]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el calendario" });
    }
};

// Registrar un nuevo partido
const crearPartido = async (req, res) => {
    const { id_equipo_local, id_equipo_visitante, fecha, horario, temporada_id } = req.body;
    try {

        if (!id_equipo_local || !id_equipo_visitante || !fecha || !horario || !temporada_id) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const equipoLocal = await pool.query('SELECT estadio FROM equipos WHERE id = $1', [id_local]);
        
        if (equipoLocal.rows.length === 0) {
            return res.status(404).json({ error: "El equipo local no existe" });
        }

        const lugarAutomatico = equipoLocal.rows[0].estadio || 'Estadio por definir';

        const nuevoPartido = await pool.query(
            'INSERT INTO partidos (id_equipo_local, id_equipo_visitante, fecha, horario, lugar, temporada_id, finalizado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id_equipo_local, id_equipo_visitante, fecha, horario, lugarAutomatico, temporada_id, false]
        );
        res.status(201).json({ mensaje: "Partido creado exitosamente", partido: nuevoPartido.rows[0] });

        if (nuevoPartido.rows.length > 0) {
            return res.status(400).json({ error: "Uno de los equipos ya tiene un partido programado en esa fecha y hora" });
        }
    }
        catch (error) {
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

        if (puntos_local === undefined || puntos_visitante === undefined) {
            return res.status(400).json({ error: "Debes proporcionar los puntos finales de ambos equipos" });
        }

        //Actualizar el resultado del partido y marcar como finalizado
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
        
        //Lógica de puntos para la tabla de posiciones
        let idGanador = null;
        if (puntos_local > puntos_visitante) {
            idGanador = partido.id_equipo_local;
        } else if (puntos_visitante > puntos_local) {
            idGanador = partido.id_equipo_visitante;
        }

        //Sumar puntos al equipo ganador
        if (idGanador) {
            await client.query(
                'UPDATE equipos SET puntos_totales = puntos_totales + 3 WHERE id = $1',
                [idGanador]
            );
        } else {
            await client.query(
                'UPDATE equipos SET puntos_totales = puntos_totales + 1 WHERE id IN ($1, $2)',
                [partido.id_equipo_local, partido.id_equipo_visitante]
            );
        }

        //Guardar puntos individuales de los jugadores (Pichichi)
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
    const { temporada_id } = req.query;
    try {
        const resultado = await pool.query('DELETE FROM partidos WHERE id = $1 AND temporada_id = $2 RETURNING *', [id, temporada_id]);
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

const listarPartidosPorTemporada = async (req, res) => {
    const { temporada_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT p.*, e1.nombre as local, e2.nombre as visitante 
             FROM partidos p
             JOIN equipos e1 ON p.id_local = e1.id
             JOIN equipos e2 ON p.id_visitante = e2.id
             WHERE p.temporada_id = $1
             ORDER BY p.fecha DESC, p.hora DESC`,
            [temporada_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener historial" });
    }
};

const generarCalendario = async (req, res) => {
    const { temporada_id, fecha_inicio } = req.body;

    if (!temporada_id || !fecha_inicio)
        return res.status(400).json({ error: "Debes especificar una temporada y una fecha de inicio" });

    try {
        // 1. Obtener todos los equipos de esa temporada
        const equiposRes = await pool.query(
            'SELECT id, estadio FROM equipos WHERE temporada_id = $1', 
            [temporada_id]
        );
        const equipos = equiposRes.rows;

        if (equipos.length < 2) return res.status(400).json({ error: "Mínimo 2 equipos" });

        // 2. Limpiar partidos NO finalizados antes de re-generar
        await pool.query(
            'DELETE FROM partidos WHERE temporada_id = $1 AND finalizado = false', 
            [temporada_id]
        );

        // 3. Algoritmo para cruces (Todos contra todos)
        let partidosCreados = [];
        let jornadaActual = 1;

        for (let i = 0; i < equipos.length; i++) {
            for (let j = i + 1; j < equipos.length; j++) {
                const local = equipos[i];
                const visitante = equipos[j];

                const nuevoPartido = await pool.query(
                    `INSERT INTO partidos 
                    (id_equipo_local, id_equipo_visitante, lugar, temporada_id, jornada, finalizado, fecha, horario) 
                    VALUES ($1, $2, $3, $4, $5, false, $6, '20:00') RETURNING *`,
                    [local.id, visitante.id, local.estadio, temporada_id, jornadaActual, fecha_inicio]
                );
                
                partidosCreados.push(nuevoPartido.rows[0]);
                // Esto es una lógica simple: cada 2 partidos subimos la jornada
                if (partidosCreados.length % Math.floor(equipos.length / 2) === 0) {
                    jornadaActual++;
                }
            }
        }

        res.json({ mensaje: "Calendario generado", jornadas: jornadaActual - 1 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar calendario" });
    }
};

module.exports = { obtenerCalendarioFiltrado, crearPartido, finalizarPartido, actualizarPartido, eliminarPartido, obtenerJugadoresDelPartido, listarPartidosPorTemporada, generarCalendario};