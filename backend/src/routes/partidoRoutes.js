const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const auth = require('../middlewares/authMiddlewares');

router.get('/', partidoController.obtenerTodosLosPartidos);
router.get('/:temporada_id', partidoController.obtenerCalendarioFiltrado);
router.post('/', auth.verificarToken, partidoController.crearPartido);
router.put('/:id', auth.verificarToken, partidoController.actualizarPartido);
router.delete('/:id', auth.verificarToken, partidoController.eliminarPartido);
router.get('/:id/jugadores', partidoController.obtenerJugadoresDelPartido);
router.put('/:id/finalizar', auth.verificarToken, partidoController.finalizarPartido);
router.get('/temporada/:temporada_id', partidoController.listarPartidosPorTemporada);

module.exports = router;