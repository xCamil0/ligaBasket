/**
 * calendarioController.js — Controlador del calendario.
 * Genera automáticamente el fixture con algoritmo Round-Robin y permite eliminar partidos.
 */
const pool = require('../config/db');

/** Genera un calendario Round-Robin de Ida y Vuelta para una temporada, distribuyendo jornadas en el rango de fechas. */
const generarCalendario = async (req, res) => {
    const { temporada_id } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const temporadaRes = await client.query(
            'SELECT fecha_inicio, fecha_fin FROM temporadas WHERE id = $1',
            [temporada_id]
        );

        const equiposRes = await client.query(
            'SELECT e.id, e.estadio FROM equipos e JOIN temporada_equipos te ON e.id = te.equipo_id WHERE te.temporada_id = $1',
            [temporada_id]
        );

        if (temporadaRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Temporada no encontrada" });
        }

        let equipos = equiposRes.rows;
        const { fecha_inicio, fecha_fin } = temporadaRes.rows[0];

        if (equipos.length < 2) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Necesitas al menos 2 equipos" });
        }

        // Si hay cantidad impar de equipos, se detiene
        if (equipos.length % 2 !== 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "La cantidad de equipos debe ser par para generar el calendario" });
        }

        // Verificar que todos los equipos asignados a la temporada tengan al menos un jugador
        const equiposSinJugadores = await client.query(
            `SELECT e.nombre 
             FROM equipos e 
             JOIN temporada_equipos te ON e.id = te.equipo_id 
             LEFT JOIN jugadores j ON e.id = j.equipo_id 
             WHERE te.temporada_id = $1 AND e.activo = true
             GROUP BY e.id, e.nombre
             HAVING COUNT(j.id) = 0`,
            [temporada_id]
        );

        if (equiposSinJugadores.rows.length > 0) {
            const nombres = equiposSinJugadores.rows.map(r => r.nombre).join(', ');
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: `No se puede generar el calendario porque los siguientes equipos no tienen jugadores registrados: ${nombres}.`
            });
        }

        const numEquipos = equipos.length;
        const numJornadasUnica = numEquipos - 1;
        const totalJornadas = 2 * numJornadasUnica;
        const partidosPorJornada = numEquipos / 2;

        // Calcular intervalo de días entre jornadas
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);
        const diferenciaDias = (fin - inicio) / (1000 * 60 * 60 * 24);
        const intervaloJornadas = Math.floor(diferenciaDias / totalJornadas);

        let copiaEquipos = [...equipos];

        // Algoritmo Round-Robin para Ida y Vuelta
        for (let jornada = 1; jornada <= numJornadasUnica; jornada++) {
            const fechaIda = new Date(inicio);
            fechaIda.setDate(inicio.getDate() + (intervaloJornadas * (jornada - 1)));

            const fechaVuelta = new Date(inicio);
            fechaVuelta.setDate(inicio.getDate() + (intervaloJornadas * (jornada + numJornadasUnica - 1)));

            for (let i = 0; i < partidosPorJornada; i++) {
                const local = copiaEquipos[i];
                const visitante = copiaEquipos[numEquipos - 1 - i];

                if (local.id !== null && visitante.id !== null) {
                    // Partido de Ida (Local vs Visitante)
                    await client.query(
                        `INSERT INTO partidos 
                        (id_equipo_local, id_equipo_visitante, temporada_id, jornada, lugar, fecha, horario, finalizado, puntos_local, puntos_visitante) 
                        VALUES ($1, $2, $3, $4, $5, $6, '20:00:00', false, NULL, NULL)`,
                        [local.id, visitante.id, temporada_id, jornada, local.estadio || 'Por definir', fechaIda]
                    );

                    // Partido de Vuelta (Visitante vs Local)
                    await client.query(
                        `INSERT INTO partidos 
                        (id_equipo_local, id_equipo_visitante, temporada_id, jornada, lugar, fecha, horario, finalizado, puntos_local, puntos_visitante) 
                        VALUES ($1, $2, $3, $4, $5, $6, '20:00:00', false, NULL, NULL)`,
                        [visitante.id, local.id, temporada_id, jornada + numJornadasUnica, visitante.estadio || 'Por definir', fechaVuelta]
                    );
                }
            }

            // Rotación Round-Robin: el primer equipo queda fijo, los demás rotan
            copiaEquipos.splice(1, 0, copiaEquipos.pop());
        }

        await client.query('COMMIT');
        res.json({ mensaje: `Calendario de ${totalJornadas} jornadas (ida y vuelta) generado del ${inicio.toLocaleDateString()} al ${fin.toLocaleDateString()}` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al generar el calendario:", error);
        res.status(500).json({ error: "Error al generar el calendario con fechas" });
    } finally {
        client.release();
    }
};

/** Elimina TODOS los partidos de la base de datos. */
const eliminarPartidos = async (req, res) => {
    const { temporada_id } = req.body;
    try {
        await pool.query('DELETE FROM partidos where temporada_id = $1', [temporada_id]);
        res.json({ mensaje: "Todos los partidos eliminados" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar los partidos" });
    }
};

module.exports = { generarCalendario, eliminarPartidos };