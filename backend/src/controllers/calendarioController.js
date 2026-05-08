/**
 * calendarioController.js — Controlador del calendario.
 * Genera automáticamente el fixture con algoritmo Round-Robin y permite eliminar partidos.
 */
const pool = require('../config/db');

/** Genera un calendario Round-Robin para una temporada, distribuyendo jornadas en el rango de fechas. */
const generarCalendario = async (req, res) => {
    const { temporada_id } = req.body;

    try {
        const temporadaRes = await pool.query(
            'SELECT fecha_inicio, fecha_fin FROM temporadas WHERE id = $1',
            [temporada_id]
        );

        const equiposRes = await pool.query(
            'SELECT e.id, e.estadio FROM equipos e JOIN temporada_equipos te ON e.id = te.equipo_id WHERE te.temporada_id = $1',
            [temporada_id]
        );

        if (temporadaRes.rows.length === 0) return res.status(404).json({ error: "Temporada no encontrada" });

        let equipos = equiposRes.rows;
        const { fecha_inicio, fecha_fin } = temporadaRes.rows[0];

        if (equipos.length < 2) {
            return res.status(400).json({ error: "Necesitas al menos 2 equipos" });
        }

        // Si hay cantidad impar de equipos, se agrega un equipo fantasma (descanso)
        if (equipos.length % 2 !== 0) {
            equipos.push({ id: null, estadio: null });
        }

        const numEquipos = equipos.length;
        const numJornadas = numEquipos - 1;
        const partidosPorJornada = numEquipos / 2;

        // Calcular intervalo de días entre jornadas
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);
        const diferenciaDias = (fin - inicio) / (1000 * 60 * 60 * 24);
        const intervaloJornadas = Math.floor(diferenciaDias / numJornadas);

        // Algoritmo Round-Robin: rotar equipos para generar enfrentamientos únicos
        for (let jornada = 1; jornada <= numJornadas; jornada++) {
            const fechaJornada = new Date(inicio);
            fechaJornada.setDate(inicio.getDate() + (intervaloJornadas * (jornada - 1)));

            for (let i = 0; i < partidosPorJornada; i++) {
                const local = equipos[i];
                const visitante = equipos[numEquipos - 1 - i];

                // Saltar si alguno es el equipo fantasma (descanso)
                if (local.id !== null && visitante.id !== null) {
                    await pool.query(
                        `INSERT INTO partidos 
                        (id_equipo_local, id_equipo_visitante, temporada_id, jornada, lugar, fecha, horario, finalizado, puntos_local, puntos_visitante) 
                        VALUES ($1, $2, $3, $4, $5, $6, '18:00:00', false, NULL, NULL)`,
                        [local.id, visitante.id, temporada_id, jornada, local.estadio || 'Por definir', fechaJornada]
                    );
                }
            }

            // Rotación Round-Robin: el primer equipo queda fijo, los demás rotan
            equipos.splice(1, 0, equipos.pop());
        }

        res.json({ mensaje: `Calendario de ${numJornadas} jornadas generado del ${inicio.toLocaleDateString()} al ${fin.toLocaleDateString()}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar el calendario con fechas" });
    }
};

/** Elimina TODOS los partidos de la base de datos. */
const eliminarPartidos = async (req, res) => {
    try {
        await pool.query('DELETE FROM partidos');
        res.json({ mensaje: "Todos los partidos eliminados" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar los partidos" });
    }
};

module.exports = { generarCalendario, eliminarPartidos };