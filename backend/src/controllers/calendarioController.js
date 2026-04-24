const pool = require('../config/db');

const generarCalendario = async (req, res) => {
    const { temporada_id } = req.body;
    
    try {
        const equiposRes = await pool.query(
            'SELECT id, estadio FROM equipos WHERE temporada_id = $1', 
            [temporada_id]
        );
        let equipos = equiposRes.rows;

        if (equipos.length < 2) {
            return res.status(400).json({ error: "Necesitas al menos 2 equipos para generar un calendario" });
        }
        if (equipos.length % 2 !== 0) {
            equipos.push({ id: null, nombre: 'DESCANSO' });
        }

        const numEquipos = equipos.length;
        const numJornadas = numEquipos - 1;
        const partidosPorJornada = numEquipos / 2;

        // 2. Algoritmo Round-Robin
        for (let jornada = 1; jornada <= numJornadas; jornada++) {
            for (let i = 0; i < partidosPorJornada; i++) {
                const local = equipos[i];
                const visitante = equipos[numEquipos - 1 - i];

                // Si ninguno es "Descanso", guardamos el partido
                if (local.id !== null && visitante.id !== null) {
                    await pool.query(
                        `INSERT INTO partidos (id_equipo_local, id_equipo_visitante, temporada_id, jornada, estadio, finalizado) 
                         VALUES ($1, $2, $3, $4, $5, false)`,
                        [local.id, visitante.id, temporada_id, jornada, local.estadio]
                    );
                }
            }
            // Rotar equipos (el primero se queda fijo, los demás giran)
            equipos.splice(1, 0, equipos.pop());
        }

        res.json({ mensaje: `¡Calendario de ${numJornadas} jornadas generado con éxito!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar el calendario" });
    }
};

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