const pool = require('../config/db');

const obtenerTodosLosPartidos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM partidos');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener partidos" });
    }
};

// Obtener todos los partidos con los nombres de los equipos
const obtenerCalendarioFiltrado = async (req, res) => {
    const { temporada_id } = req.params;
    const { jornada } = req.query; // Se saca de la URL: ?jornada=1

    try {
        const query = `
            SELECT 
                p.*, 
                e1.nombre AS local, 
                e1.logo AS logo_local,
                e2.nombre AS visitante, 
                e2.logo AS logo_visitante
            FROM partidos p
            JOIN equipos e1 ON p.id_equipo_local = e1.id
            JOIN equipos e2 ON p.id_equipo_visitante = e2.id
            WHERE temporada_id = $1 AND p.jornada = $2
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
        let temporadaParaRegistrar;

        // 1. Lógica de Selección de Temporada
        if (temporada_id) {
            // Si el admin envía ID, usamos ese estrictamente
            const resTemp = await pool.query('SELECT id, fecha_inicio, fecha_fin FROM temporadas WHERE id = $1', [temporada_id]);
            if (resTemp.rows.length === 0) {
                return res.status(404).json({ error: "La temporada manual enviada no existe." });
            }
            temporadaParaRegistrar = resTemp.rows[0];
        } else {
            // Si no envía ID, buscamos la actual
            const resActual = await pool.query('SELECT id, fecha_inicio, fecha_fin FROM temporadas WHERE actual = true LIMIT 1');
            if (resActual.rows.length === 0) {
                return res.status(400).json({ error: "No enviaste temporada_id y no hay ninguna temporada marcada como 'Actual'." });
            }
            temporadaParaRegistrar = resActual.rows[0];
        }

        const tempId = temporadaParaRegistrar.id;
        console.log(`Intentando registrar partido en Temporada ID: ${tempId}`);

        // 2. Validación de Rango de Fecha (Comparación de strings para evitar líos de zona horaria)
        // SQL suele devolver YYYY-MM-DD, el 'fecha' del body también debería ser YYYY-MM-DD
        if (fecha < temporadaParaRegistrar.fecha_inicio || fecha > temporadaParaRegistrar.fecha_fin) {
            return res.status(400).json({ 
                error: `La fecha ${fecha} está fuera del rango de esta temporada.`,
                rango: `${temporadaParaRegistrar.fecha_inicio} a ${temporadaParaRegistrar.fecha_fin}`
            });
        }

        // 3. Verificar si los equipos están inscritos en ESA temporada específica
        // IMPORTANTE: Debes tener registros en la tabla 'temporada_equipos' para estos IDs
        const inscripcion = await pool.query(
            `SELECT equipo_id FROM temporada_equipos 
             WHERE temporada_id = $1 AND equipo_id IN ($2, $3)`,
            [tempId, id_equipo_local, id_equipo_visitante]
        );

        if (inscripcion.rows.length < 2) {
            console.log("Error: Equipos encontrados en la tabla:", inscripcion.rows);
            return res.status(400).json({ 
                error: "Uno o ambos equipos no están inscritos en la temporada seleccionada.",
                ayuda: "Asegúrate de haber usado la función de 'Asignar Equipos' para esta temporada primero."
            });
        }

        // 4. Verificar Choque de Horarios
        const choque = await pool.query(
            `SELECT id FROM partidos WHERE fecha = $1 AND horario = $2 
             AND (id_equipo_local IN ($3, $4) OR id_equipo_visitante IN ($3, $4))`,
            [fecha, horario, id_equipo_local, id_equipo_visitante]
        );

        if (choque.rows.length > 0) {
            return res.status(400).json({ error: "Conflicto de horario: uno de los equipos ya juega a esa hora." });
        }

        // 5. Obtener Estadio del Local
        const localData = await pool.query('SELECT estadio FROM equipos WHERE id = $1', [id_equipo_local]);
        const estadio = localData.rows[0]?.estadio || 'Estadio por definir';

        // 6. Inserción Final
        const nuevoPartido = await pool.query(
            `INSERT INTO partidos (id_equipo_local, id_equipo_visitante, fecha, horario, lugar, temporada_id, finalizado) 
             VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
            [id_equipo_local, id_equipo_visitante, fecha, horario, estadio, tempId]
        );

        res.status(201).json({ 
            mensaje: "Partido creado con éxito", 
            partido: nuevoPartido.rows[0] 
        });

    } catch (error) {
        console.error("ERROR CRÍTICO EN CREAR PARTIDO:", error);
        res.status(500).json({ error: "Error interno del servidor" });
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
                'UPDATE temporada_equipos SET puntos_totales = puntos_totales + 3 WHERE id = $1',
                [idGanador]
            );
        } else {
            await client.query(
                'UPDATE temporada_equipos SET puntos_totales = puntos_totales + 1 WHERE id IN ($1, $2)',
                [partido.id_equipo_local, partido.id_equipo_visitante]
            );
        }

        //Guardar puntos individuales de los jugadores (Pichichi)
        if (anotaciones && anotaciones.length > 0) {
    // 1. Separar anotaciones por equipo para validar
            const anotacionesLocal = anotaciones.filter(n => n.equipo_id === partido.id_equipo_local);
            const anotacionesVisitante = anotaciones.filter(n => n.equipo_id === partido.id_equipo_visitante);

            const sumaLocal = anotacionesLocal.reduce((sum, n) => sum + n.puntos_local, 0);
            const sumaVisitante = anotacionesVisitante.reduce((sum, n) => sum + n.puntos_visitante, 0);

            // 2. Validar que la suma coincida con el marcador final del partido
            if (sumaLocal !== puntos_local || sumaVisitante !== puntos_visitante) {
                // Si no coinciden, lanzamos un error y detenemos todo
                return res.status(400).json({ 
                    error: "La suma de puntos de los jugadores no coincide con el marcador final.",
                    detalles: { local: sumaLocal, esperado_local: puntos_local, visitante: sumaVisitante, esperado_visitante: puntos_visitante }
                });
            }

            // 3. Limpiar anotaciones previas de este partido (Evita duplicados si se edita el resultado)
            await client.query('DELETE FROM anotaciones WHERE id_partido = $1', [id]);

            // 4. Insertar las nuevas anotaciones
            for (let nota of anotaciones) {
                await client.query(
                    'INSERT INTO anotaciones (id_partido, id_jugador, temporada_id, puntos_anotados) VALUES ($1, $2, $3, $4)',
                    [id, nota.jugador_id, partido.temporada_id, nota.puntos]
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
    const { id_equipo_local, id_equipo_visitante, puntos_local, puntos_visitante, fecha, horario, lugar, temporada_id, jornada } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE partidos SET id_equipo_local = $1, id_equipo_visitante = $2, puntos_local = $3, puntos_visitante = $4, fecha = $5, horario = $6, lugar = $7, temporada_id = $8, jornada = $9 WHERE id = $10 RETURNING *',
            [id_equipo_local, id_equipo_visitante, puntos_local, puntos_visitante, fecha, horario, lugar, temporada_id, jornada, id]
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
             JOIN equipos e1 ON p.id_equipo_local = e1.id
             JOIN equipos e2 ON p.id_equipo_visitante = e2.id
             WHERE p.temporada_id = $1
             ORDER BY p.fecha DESC, p.horario DESC`,
            [temporada_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No se encontraron partidos para esta temporada" });
        }

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener historial" });
    }
};


module.exports = {obtenerTodosLosPartidos, obtenerCalendarioFiltrado, crearPartido, finalizarPartido, actualizarPartido, eliminarPartido, obtenerJugadoresDelPartido, listarPartidosPorTemporada};