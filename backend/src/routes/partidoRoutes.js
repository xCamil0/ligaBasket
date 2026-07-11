/** partidoRoutes.js — Rutas de partidos (/api/partidos). */
const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const auth = require('../middlewares/authMiddlewares');
const { validarRequeridos } = require('../middlewares/validaciones');
const verificarTemporadaFinalizada = require('../middlewares/verificarTemporadaFinalizada');

router.get('/', partidoController.obtenerTodosLosPartidos);
router.get('/detalle/:id', partidoController.obtenerPartidoPorId);
router.get('/:temporada_id/jornadas', 
    validarRequeridos(['temporada_id'], 'params'),
    partidoController.obtenerJornadas
);
router.get('/temporada/:temporada_id', partidoController.listarPartidosPorTemporada);
router.get('/:temporada_id', partidoController.obtenerPartidosPorJornada);
router.get('/:id/jugadores', partidoController.obtenerJugadoresDelPartido);
router.post('/', 
    auth.verificarToken, 
    validarRequeridos(['id_equipo_local', 'id_equipo_visitante', 'fecha']),
    verificarTemporadaFinalizada({ origen: 'body', campo: 'temporada_id' }),
    partidoController.crearPartido
);
router.put('/:id', 
    auth.verificarToken, 
    verificarTemporadaFinalizada({ origen: 'partido' }),
    partidoController.actualizarPartido
);
router.put('/:id/finalizar', 
    auth.verificarToken, 
    validarRequeridos(['id'], 'params'),
    validarRequeridos(['puntos_local', 'puntos_visitante', 'anotaciones']),
    verificarTemporadaFinalizada({ origen: 'partido' }),
    partidoController.finalizarPartido
);
router.delete('/:id', 
    auth.verificarToken, 
    verificarTemporadaFinalizada({ origen: 'partido' }),
    partidoController.eliminarPartido
);

module.exports = router;