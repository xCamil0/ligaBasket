/**
 * equipoController.js — Controlador de equipos.
 * CRUD de equipos, detalle con jugadores/partidos, filtrado por temporada y fichajes.
 */
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

/** Devuelve todos los equipos activos, ordenados por nombre. */
const obtenerEquipos = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM equipos WHERE activo = true ORDER BY nombre ASC');
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener equipos:", error);
        res.status(500).json({ error: "Error en el servidor al leer la base de datos" });
    }
};

/** Crea un equipo nuevo o reactiva uno existente y lo vincula a una temporada. */
const crearEquipo = async (req, res) => {
    const { nombre, entrenador, estadio, temporada_id } = req.body;
    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const validar = (campo) => !campo || campo.length < 3;

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

        // Verificar que el entrenador no esté asignado a otro equipo activo
        const existeEntrenador = await pool.query(
            'SELECT id, nombre FROM equipos WHERE LOWER(entrenador) = LOWER($1) AND activo = true',
            [entrenador.trim()]
        );
        if (existeEntrenador.rows.length > 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: `El entrenador "${entrenador}" ya está asignado al equipo "${existeEntrenador.rows[0].nombre}".` });
        }

        // Verificar que el estadio no esté asignado a otro equipo activo
        const existeEstadio = await pool.query(
            'SELECT id, nombre FROM equipos WHERE LOWER(estadio) = LOWER($1) AND activo = true',
            [estadio.trim()]
        );
        if (existeEstadio.rows.length > 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: `El estadio "${estadio}" ya está asignado al equipo "${existeEstadio.rows[0].nombre}".` });
        }

        const existe = await pool.query('SELECT id, activo FROM equipos WHERE nombre ILIKE $1', [nombre.trim()]);
        let equipoId;

        if (existe.rows.length > 0) {
            equipoId = existe.rows[0].id;
            const equipoActivo = existe.rows[0].activo;

            if (equipoActivo) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: `Ya existe un equipo activo con el nombre "${nombre}". Los nombres de equipo deben ser únicos.` });
            }

            // Si el equipo estaba inactivo, lo reactivamos con los nuevos datos
            await pool.query(
                'UPDATE equipos SET activo = true, entrenador = $1, estadio = $2, logo = COALESCE($3, logo) WHERE id = $4',
                [entrenador, estadio, logoPath, equipoId]
            );

            // Verificar si ya está inscrito en esta temporada
            const relacion = await pool.query(
                'SELECT * FROM temporada_equipos WHERE equipo_id = $1 AND temporada_id = $2',
                [equipoId, temporada_id]
            );

            if (relacion.rows.length > 0) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: "Este equipo ya está inscrito en esta temporada." });
            }

        } else {
            // Equipo nuevo: insertar en la tabla equipos
            const nuevoEquipo = await pool.query(
                'INSERT INTO equipos (nombre, entrenador, estadio, logo) VALUES ($1, $2, $3, $4) RETURNING id',
                [nombre, entrenador, estadio, logoPath]
            );
            equipoId = nuevoEquipo.rows[0].id;
        }

        // Vincular equipo a la temporada seleccionada
        await pool.query(
            'INSERT INTO temporada_equipos (equipo_id, temporada_id) VALUES ($1, $2) ON CONFLICT (equipo_id, temporada_id) DO NOTHING',
            [equipoId, temporada_id]
        );

        // Vincular equipo a la temporada con ID = 1 (silenciosamente)
        if (temporada_id != 1) {
            await pool.query(
                'INSERT INTO temporada_equipos (equipo_id, temporada_id) VALUES ($1, $2) ON CONFLICT (equipo_id, temporada_id) DO NOTHING',
                [equipoId, 1]
            );
        }

        res.status(201).json({ mensaje: "Equipo creado y asignado exitosamente", equipoId });

    } catch (error) {
        console.error("Error al crear equipo:", error);
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error al eliminar el archivo:", err);
            });
        }
        res.status(500).json({ error: "No se pudo guardar el equipo" });
    }
};

/** Actualiza nombre, entrenador, estadio y/o logo de un equipo. */
const actualizarEquipo = async (req, res) => {
    const { id } = req.params;
    const { nombre, entrenador, estadio, temporada_id } = req.body;

    try {
        const equipoActual = await pool.query('SELECT * FROM equipos WHERE id = $1', [id]);
        if (equipoActual.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }

        // Verificar si ya existe otro equipo activo con ese nombre (case-insensitive)
        const existeOtro = await pool.query(
            'SELECT id FROM equipos WHERE LOWER(nombre) = LOWER($1) AND id != $2 AND activo = true',
            [nombre.trim(), id]
        );
        if (existeOtro.rows.length > 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: `Ya existe otro equipo activo con el nombre "${nombre}". Los nombres de equipo deben ser únicos.` });
        }

        // Verificar si el entrenador ya está asignado a otro equipo activo (case-insensitive)
        const existeEntrenador = await pool.query(
            'SELECT id, nombre FROM equipos WHERE LOWER(entrenador) = LOWER($1) AND id != $2 AND activo = true',
            [entrenador.trim(), id]
        );
        if (existeEntrenador.rows.length > 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: `El entrenador "${entrenador}" ya está asignado al equipo "${existeEntrenador.rows[0].nombre}".` });
        }

        // Verificar si el estadio ya está asignado a otro equipo activo (case-insensitive)
        const existeEstadio = await pool.query(
            'SELECT id, nombre FROM equipos WHERE LOWER(estadio) = LOWER($1) AND id != $2 AND activo = true',
            [estadio.trim(), id]
        );
        if (existeEstadio.rows.length > 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: `El estadio "${estadio}" ya está asignado al equipo "${existeEstadio.rows[0].nombre}".` });
        }

        let logof = equipoActual.rows[0].logo;
        if (req.file) {
            // Borrar el logo anterior si existe
            if (logof) {
                const oldPath = path.join(__dirname, '../../', logof);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            logof = `/uploads/${req.file.filename}`;
        }

        const resultado = await pool.query(
            'UPDATE equipos SET nombre = $1, entrenador = $2, estadio = $3, logo = $4 WHERE id = $5 RETURNING *',
            [nombre, entrenador, estadio, logof, id]
        );

        if (temporada_id) {
            await pool.query(
                `INSERT INTO temporada_equipos (equipo_id, temporada_id) 
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

/** Desactiva un equipo (soft delete), elimina partidos programados y libera sus jugadores en una sola transacción. */
const eliminarEquipo = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const equipo = await client.query('SELECT logo, nombre FROM equipos WHERE id = $1', [id]);
        if (equipo.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Equipo no encontrado" });
        }

        const logoParaBorrar = equipo.rows[0].logo;
        if (logoParaBorrar) {
            const rutaArchivo = path.join(__dirname, '../../', logoParaBorrar);
            if (fs.existsSync(rutaArchivo)) {
                try {
                    fs.unlinkSync(rutaArchivo);
                } catch (err) {
                    console.error("Error al borrar archivo de logo:", err);
                }
            }
        }

        // Paso 1: Actualizar el estado del equipo a inactivo (activo = false, logo = NULL)
        const resultado = await client.query(
            'UPDATE equipos SET activo = false, logo = NULL WHERE id = $1 RETURNING nombre',
            [id]
        );

        const tempRes = await client.query('SELECT id FROM temporadas WHERE actual = true LIMIT 1');
        const temporada_actual_id = tempRes.rows[0]?.id;

        if (temporada_actual_id) {
            await client.query(
                'DELETE FROM temporada_equipos WHERE equipo_id = $1 AND temporada_id = $2',
                [id, temporada_actual_id]
            );
        }

        // Pasos 2 & 3: Eliminar partidos programados (finalizado = false)
        await client.query(
            'DELETE FROM partidos WHERE (id_equipo_local = $1 OR id_equipo_visitante = $1) AND finalizado = false',
            [id]
        );

        // Paso 4: Liberar a los jugadores (equipo_id = NULL)
        await client.query('UPDATE jugadores SET equipo_id = NULL WHERE equipo_id = $1', [id]);

        await client.query('COMMIT');
        res.json({ mensaje: `El equipo ${resultado.rows[0].nombre} ha sido desactivado. Se han eliminado sus partidos programados y sus jugadores han quedado libres.` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al desactivar el equipo:", error);
        res.status(500).json({ error: "Error al procesar la baja del equipo" });
    } finally {
        client.release();
    }
};

/** Devuelve info completa de un equipo: datos, jugadores, partidos jugados y pendientes. */
const obtenerDetalleEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        const infoRes = await pool.query('SELECT * FROM equipos WHERE id = $1', [id]);
        if (infoRes.rows.length === 0) return res.status(404).json({ error: "Equipo no encontrado" });

        const jugadoresRes = await pool.query('SELECT * FROM jugadores WHERE equipo_id = $1', [id]);

        const partidosRes = await pool.query(`
            SELECT p.*, 
            el.nombre AS local, ev.nombre AS visitante,
            el.logo AS logo_local, ev.logo AS logo_visitante
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

/** Devuelve equipos activos inscritos en una temporada específica (?temporada_id=X). */
const obtenerEquiposPorTemporada = async (req, res) => {
    const { temporada_id } = req.query;

    if (!temporada_id) {
        return res.status(400).json({ error: "Debes proporcionar el temporada_id" });
    }

    try {
        const result = await pool.query(`
            SELECT e.id, e.nombre, e.logo, e.estadio, te.puntos_totales
            FROM equipos e
            JOIN temporada_equipos te ON e.id = te.equipo_id
            WHERE te.temporada_id = $1 AND e.activo = true
            ORDER BY e.nombre ASC
        `, [temporada_id]);

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

/** Ficha o libera un jugador. Si equipo_id es null, pasa a ser agente libre. */
const gestionarFichajeOLiberacion = async (req, res) => {
    const { jugador_id, equipo_id, temporada_id } = req.body;

    try {
        // Obtener el equipo actual del jugador
        const jugadorRes = await pool.query('SELECT equipo_id FROM jugadores WHERE id = $1', [jugador_id]);
        const equipoActualId = jugadorRes.rows[0]?.equipo_id;

        // Si el jugador pertenece a un equipo y se está moviendo a otro (o liberando)
        if (equipoActualId && Number(equipoActualId) !== Number(equipo_id)) {
            // Verificar si es el último jugador
            const conteoRes = await pool.query('SELECT COUNT(*)::int AS count FROM jugadores WHERE equipo_id = $1', [equipoActualId]);
            if (conteoRes.rows[0].count === 1) {
                // Verificar si el equipo tiene partidos programados (finalizado = false)
                const partidosRes = await pool.query(
                    'SELECT COUNT(*)::int AS count FROM partidos WHERE (id_equipo_local = $1 OR id_equipo_visitante = $1) AND finalizado = false',
                    [equipoActualId]
                );
                if (partidosRes.rows[0].count > 0) {
                    const equipoNombreRes = await pool.query('SELECT nombre FROM equipos WHERE id = $1', [equipoActualId]);
                    const equipoNombre = equipoNombreRes.rows[0]?.nombre || 'su equipo';
                    return res.status(400).json({
                        error: `No se puede transferir o liberar al jugador porque es el único jugador del equipo "${equipoNombre}" y el equipo tiene partidos programados. Registre otros jugadores o cancele los partidos primero.`
                    });
                }
            }
        }

        await pool.query('BEGIN');

        // Desactivar fichaje anterior
        await pool.query(
            'UPDATE historial_fichajes SET es_actual = false WHERE jugador_id = $1',
            [jugador_id]
        );

        // Registrar nuevo fichaje
        await pool.query(
            `INSERT INTO historial_fichajes (jugador_id, equipo_id, temporada_id, es_actual) 
             VALUES ($1, $2, $3, true)`,
            [jugador_id, equipo_id, temporada_id]
        );

        // Actualizar equipo actual del jugador
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

module.exports = {
    obtenerEquipos,
    crearEquipo,
    eliminarEquipo,
    actualizarEquipo,
    obtenerDetalleEquipo,
    gestionarFichajeOLiberacion,
    obtenerEquiposPorTemporada
};