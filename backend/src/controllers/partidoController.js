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
    const { id } = req.params; // ID del partido
    const { puntos_local, puntos_visitante } = req.body;

    // Iniciamos una transacción
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // "Empezar proceso seguro"

        // 1. Actualizar el resultado del partido y marcar como finalizado
        const actualizarPartido = await client.query(
            `UPDATE partidos 
             SET puntos_local = $1, puntos_visitante = $2, finalizado = true 
             WHERE id = $3 RETURNING *`,
            [puntos_local, puntos_visitante, id]
        );

        const partido = actualizarPartido.rows[0];
        
        // 2. Lógica de puntos (Gana: 3 pts, Empata: 1 pt, Pierde: 0 pts)
        let idGanador = null;
        if (puntos_local > puntos_visitante) idGanador = partido.id_equipo_local;
        else if (puntos_visitante > puntos_local) idGanador = partido.id_equipo_visitante;

        // 3. Si hubo un ganador, le sumamos los puntos en la tabla 'equipos'
        if (idGanador) {
            await client.query(
                'UPDATE equipos SET puntos_totales = puntos_totales + 3 WHERE id = $1',
                [idGanador]
            );
        }

        await client.query('COMMIT'); // "Guardar todo definitivamente"
        res.json({ mensaje: "Partido finalizado y puntos actualizados", partido });

    } catch (error) {
        await client.query('ROLLBACK'); // "Si algo falló, deshacer todo"
        console.error(error);
        res.status(500).json({ error: "Error al procesar el final del partido" });
    } finally {
        client.release(); // Liberar la conexión
    }
};

const actualizarPartido = async (req, res) => {
    const { id } = req.params;
    const { id_equipo_local, id_equipo_visitante, fecha, horario, lugar } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE partidos SET id_equipo_local = $1, id_equipo_visitante = $2, fecha = $3, horario = $4, lugar = $5 WHERE id = $6 RETURNING *',
            [id_equipo_local, id_equipo_visitante, fecha, horario, lugar, id]
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

module.exports = { obtenerPartidos, crearPartido, finalizarPartido, actualizarPartido, eliminarPartido };