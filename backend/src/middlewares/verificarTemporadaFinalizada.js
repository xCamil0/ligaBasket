/**
 * verificarTemporadaFinalizada.js — Middleware que bloquea modificaciones en temporadas finalizadas.
 * Busca el temporada_id en body, params, query o a través de un partido, y si la temporada
 * tiene finalizada = true, responde con 403.
 */
const pool = require('../config/db');

/**
 * Crea un middleware que verifica si la temporada asociada está finalizada.
 * @param {Object} opciones
 * @param {string} opciones.origen - De dónde tomar el temporada_id: 'body', 'params', 'query', 'partido'
 * @param {string} opciones.campo - Nombre del campo que contiene el ID (default: 'temporada_id')
 */
const verificarTemporadaFinalizada = (opciones = {}) => {
    const { origen = 'body', campo = 'temporada_id' } = opciones;

    return async (req, res, next) => {
        try {
            let temporadaId = null;

            if (origen === 'partido') {
                // Obtener temporada_id a partir del ID del partido en params
                const partidoId = req.params.id;
                if (!partidoId) return next();

                const resultado = await pool.query(
                    'SELECT temporada_id FROM partidos WHERE id = $1',
                    [partidoId]
                );
                if (resultado.rows.length === 0) return next(); // El controlador manejará el 404
                temporadaId = resultado.rows[0].temporada_id;
            } else {
                // Tomar de body, params o query según corresponda
                const fuente = origen === 'body' ? req.body
                             : origen === 'params' ? req.params
                             : origen === 'query' ? req.query
                             : req.body;
                temporadaId = fuente[campo];
            }

            if (!temporadaId) return next(); // Si no hay temporada_id, dejar que el controlador valide

            const resultado = await pool.query(
                'SELECT finalizada FROM temporadas WHERE id = $1',
                [temporadaId]
            );

            if (resultado.rows.length > 0 && resultado.rows[0].finalizada === true) {
                return res.status(403).json({
                    error: 'Esta temporada está finalizada. No se pueden realizar modificaciones.'
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware verificarTemporadaFinalizada:', error);
            res.status(500).json({ error: 'Error interno al verificar el estado de la temporada.' });
        }
    };
};

module.exports = verificarTemporadaFinalizada;
