const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const obtenerEquipos = async (req, res) => {
    try {
        // Hacemos la consulta SQL real
        const resultado = await pool.query('SELECT * FROM equipos WHERE activo = true ORDER BY nombre ASC');
        
        // Enviamos los datos de vuelta a Postman
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener equipos:", error);
        res.status(500).json({ error: "Error en el servidor al leer la base de datos" });
    }
};

const crearEquipo = async (req, res) => {
    const { nombre, entrenador, estadio, temporada_id, logo} = req.body;
    let logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const validar = (campo, nombre) => !campo || campo.length < 3;

    if (validar(nombre) || validar(entrenador) || validar(estadio) || !temporada_id) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Todos los campos son obligatorios (min. 3 caracteres)" });
    }

    try {
        const tempExiste = await pool.query('SELECT id FROM temporadas WHERE id = $1', [temporada_id]);
        if (tempExiste.rows.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "La temporada especificada no existe" });
        }

        const existe = await pool.query('SELECT id FROM equipos WHERE nombre ILIKE $1', [nombre]);   
        let equipoId;

        if (existe.rows.length > 0) {

            equipoId = existe.rows[0].id;
            const equipoActivo = existe.rows[0].activo;
            if (!equipoActivo) {
                await pool.query('UPDATE equipos SET activo = true, entrenador = $1, estadio = $2, logo = COALESCE($3, logo) WHERE id = $4', 
                    [entrenador, estadio, logoPath, equipoId]
                );
            }

            // 3. VERIFICACIÓN: ¿Este equipo ya está inscrito en ESTA temporada?
            const relacion = await pool.query(
                'SELECT * FROM temporada_equipos WHERE equipo_id = $1 AND temporada_id = $2',
                [equipoId, temporada_id]
            );

            if (relacion.rows.length > 0) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: "Este equipo ya está inscrito en esta temporada." });
            }

        } else {
            // EL EQUIPO ES NUEVO: Lo creamos
            const nuevoEquipo = await pool.query(
                'INSERT INTO equipos (nombre, entrenador, estadio, logo) VALUES ($1, $2, $3, $4) RETURNING id',
                [nombre, entrenador, estadio, logoPath]
            );
            equipoId = nuevoEquipo.rows[0].id;
        }

        // 4. VINCULACIÓN FINAL
        await pool.query(
            'INSERT INTO temporada_equipos (equipo_id, temporada_id) VALUES ($1, $2)',
            [equipoId, temporada_id]
        );
        
        // Respondemos con el equipo recién creado
        res.status(201).json({
            mensaje: "Equipo creado exitosamente", equipoId
        });

    } catch (error) {
        console.error("Error al crear equipo:", error);

        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Error al eliminar el archivo:", err);
                }
            });
        }
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

        let logof = equipoActual.rows[0].logo;
        if (req.file) {
            logof = `/uploads/${req.file.filename}`;
        }

        const resultado = await pool.query(
            'UPDATE equipos e SET nombre = $1, entrenador = $2, estadio = $3, logo = $4 WHERE id = $5 RETURNING *',
            [nombre, entrenador, estadio, logof, id]
        );

        if (temporada_id) {
            await pool.query(`INSERT INTO temporada_equipos (equipo_id, temporada_id) 
                 VALUES ($1, $2) 
                 ON CONFLICT (equipo_id, temporada_id) DO NOTHING`,
                [id, temporada_id]
            );
        }

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
        // En lugar de borrar, cambiamos el estado a false
        const resultado = await pool.query(
            'UPDATE equipos SET activo = false WHERE id = $1 RETURNING nombre',
            [id]
        );
        
        const tempRes = await pool.query('SELECT id FROM temporadas WHERE actual = true LIMIT 1');
        const temporada_actual_id = tempRes.rows[0]?.id;

        if (temporada_actual_id) {
            await pool.query(
                'DELETE FROM temporada_equipos WHERE equipo_id = $1 AND temporada_id = $2', 
                [id, temporada_actual_id]
            );
        }
        await pool.query('UPDATE jugadores SET equipo_id = NULL WHERE equipo_id = $1', [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }

        res.json({ 
            mensaje: `El equipo ${resultado.rows[0].nombre} ha sido desactivado.` 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar la baja del equipo" });
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

const obtenerEquiposPorTemporada = async (req, res) => {
    // Usamos req.query para seguir tu estándar de ?temporada_id=X
    const { temporada_id } = req.query;

    if (!temporada_id) {
        return res.status(400).json({ error: "Debes proporcionar el temporada_id" });
    }

    try {
        const query = `
            SELECT 
                e.id, 
                e.nombre, 
                e.logo, 
                e.estadio,
                te.puntos_totales
            FROM equipos e
            JOIN temporada_equipos te ON e.id = te.equipo_id
            WHERE te.temporada_id = $1 AND e.activo = true
            ORDER BY e.nombre ASC
        `;
        
        const result = await pool.query(query, [temporada_id]);

        if (result.rows.length === 0) {
            return res.status(200).json({ 
                mensaje: "No hay equipos inscritos en esta temporada", 
                data: [] 
            });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener equipos de la temporada:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

const gestionarFichajeOLiberacion = async (req, res) => {
    // Si equipo_id es null, el jugador pasa a ser Agente Libre
    const { jugador_id, equipo_id, temporada_id } = req.body;

    try {
        await pool.query('BEGIN');

        // 1. Desactivamos el estado actual anterior
        await pool.query(
            'UPDATE historial_fichajes SET es_actual = false WHERE jugador_id = $1',
            [jugador_id]
        );

        // 2. Insertamos el nuevo registro (si equipo_id es null, queda como Agente Libre)
        await pool.query(
            `INSERT INTO historial_fichajes (jugador_id, equipo_id, temporada_id, es_actual) 
             VALUES ($1, $2, $3, true)`,
            [jugador_id, equipo_id, temporada_id]
        );

        // 3. Actualizamos la tabla principal de jugadores
        // Si equipo_id es null, el jugador queda sin equipo en su perfil
        await pool.query(
            'UPDATE jugadores SET equipo_id = $1 WHERE id = $2',
            [equipo_id, jugador_id]
        );

        await pool.query('COMMIT');
        
        const mensaje = equipo_id 
            ? "Fichaje realizado con éxito" 
            : "El jugador ahora es Agente Libre";
            
        res.json({ mensaje });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Error al procesar el movimiento" });
    }
};

module.exports = { obtenerEquipos, crearEquipo, eliminarEquipo, actualizarEquipo, obtenerDetalleEquipo, gestionarFichajeOLiberacion, obtenerEquiposPorTemporada};