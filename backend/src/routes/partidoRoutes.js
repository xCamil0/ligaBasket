/** partidoRoutes.js — Rutas de partidos (/api/partidos). */
const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const auth = require('../middlewares/authMiddlewares');

router.get('/', partidoController.obtenerTodosLosPartidos);
router.get('/:temporada_id/jornadas', partidoController.obtenerJornadas);
router.get('/temporada/:temporada_id', partidoController.listarPartidosPorTemporada);
router.get('/:temporada_id', partidoController.obtenerPartidosPorJornada);
router.get('/:id/jugadores', partidoController.obtenerJugadoresDelPartido);
router.post('/', auth.verificarToken, partidoController.crearPartido);
router.put('/:id', auth.verificarToken, partidoController.actualizarPartido);
router.put('/:id/finalizar', auth.verificarToken, partidoController.finalizarPartido);
router.delete('/:id', auth.verificarToken, partidoController.eliminarPartido);

module.exports = router;