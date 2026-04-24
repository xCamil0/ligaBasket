const pool = require('../config/db');

const obtenerEquipos = async (req, res) => {
    try {
        // Hacemos la consulta SQL real
        const resultado = await pool.query('SELECT * FROM equipos');
        
        // Enviamos los datos de vuelta a Postman
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener equipos:", error);
        res.status(500).json({ error: "Error en el servidor al leer la base de datos" });
    }
};

const crearEquipo = async (req, res) => {
    const { nombre, entrenador, estadio, temporada_id, logo} = req.body;

    if (!nombre || nombre.length < 3) {
        return res.status(400).json({ 
            error: "El nombre del equipo es obligatorio y debe tener al menos 3 caracteres" 
        });
    }
    if (!entrenador || entrenador.length < 3) {
        return res.status(400).json({ 
            error: "El nombre del entrenador es obligatorio y debe tener al menos 3 caracteres" 
        });
    }
    if (!estadio || estadio.length < 3) {
        return res.status(400).json({ 
            error: "El nombre del estadio es obligatorio y debe tener al menos 3 caracteres" 
        });
    }
    if (!temporada_id) {
        return res.status(400).json({ 
            error: "Debes especificar una temporada" 
        });
    }

    try {
        const tempExiste = await pool.query('SELECT * FROM temporadas WHERE id = $1', [temporada_id]);
        if (tempExiste.rows.length === 0) {
            return res.status(400).json({ error: "La temporada especificada no existe" });
        }

        const existe = await pool.query('SELECT * FROM equipos WHERE nombre = $1 AND temporada_id = $2', [nombre, temporada_id]);
        if (existe.rows.length > 0) {
            return res.status(400).json({ error: "Ya existe un equipo con ese nombre en la temporada especificada" });
        }

        let logo = '/uploads/default_logo.png'; // Ruta por defecto
        if (req.file) {
        logo = `/uploads/${req.file.filename}`;
        }
        
        const nuevoEquipo = await pool.query(
            'INSERT INTO equipos (nombre, entrenador, puntos_totales, estadio, logo, temporada_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, entrenador, 0, estadio, logo, temporada_id]
        );
        
        // Respondemos con el equipo recién creado
        res.status(201).json({
            mensaje: "Equipo creado exitosamente",
            equipo: nuevoEquipo.rows[0]
        });

    } catch (error) {
        console.error("Error al crear equipo:", error);
        res.status(500).json({ error: "No se pudo guardar el equipo" });
    }
};

const actualizarEquipo = async (req, res) => {
    const { id } = req.params;
    const { nombre, entrenador, estadio, temporada_id, logo } = req.body;

    try {

        const equipoActual = await pool.query('SELECT * FROM equipos WHERE id = $1', [id]);
        if (equipoActual.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }

        let logo = equipoActual.rows[0].foto; 
        if (req.file) {
            logo = `/uploads/${req.file.filename}`;
        }

        const resultado = await pool.query(
            'UPDATE equipos SET nombre = $1, entrenador = $2, estadio = $3, temporada_id = $4, logo = $5 WHERE id = $6 RETURNING *',
            [nombre, entrenador, estadio, temporada_id, logo, id]
        );

        res.json({ mensaje: "Equipo actualizado", equipo: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar" });
    }
};

// ELIMINAR
const eliminarEquipo = async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await pool.query('DELETE FROM equipos WHERE id = $1 RETURNING *', [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "El equipo no existe" });
        }

        res.json({ mensaje: "Equipo eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar" });
    }
};

const obtenerDetalleEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Información básica y entrenador
        const infoRes = await pool.query('SELECT * FROM equipos WHERE id = $1', [id]);
        if (infoRes.rows.length === 0) return res.status(404).json({ error: "Equipo no encontrado" });

        // 2. Lista de jugadores
        const jugadoresRes = await pool.query('SELECT * FROM jugadores WHERE equipo_id = $1', [id]);

        // 3. Partidos (Jugados y Pendientes)
        // Usamos una sola consulta para traer todos y luego filtramos en JS o lo hacemos por separado
        const partidosRes = await pool.query(`
            SELECT p.*, 
                   el.nombre AS local, ev.nombre AS visitante
            FROM partidos p
            JOIN equipos el ON p.id_equipo_local = el.id
            JOIN equipos ev ON p.id_equipo_visitante = ev.id
            WHERE p.id_equipo_local = $1 OR p.id_equipo_visitante = $1
            ORDER BY p.fecha ASC
        `, [id]);

        const partidos = partidosRes.rows;

        res.json({
            equipo: infoRes.rows[0],
            jugadores: jugadoresRes.rows,
            jugados: partidos.filter(p => p.finalizado),
            pendientes: partidos.filter(p => !p.finalizado)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el detalle del equipo" });
    }
};

module.exports = { obtenerEquipos, crearEquipo, eliminarEquipo, actualizarEquipo, obtenerDetalleEquipo };