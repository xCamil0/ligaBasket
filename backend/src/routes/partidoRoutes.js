const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const auth = require('../middlewares/authMiddlewares');

router.get('/', partidoController.obtenerCalendarioFiltrado);
router.post('/', auth.verificarToken, partidoController.crearPartido);
router.put('/:id', auth.verificarToken, partidoController.actualizarPartido);
router.delete('/:id', auth.verificarToken, partidoController.eliminarPartido);
router.get('/:id/jugadores', partidoController.obtenerJugadoresDelPartido);
router.put('/:id/finalizar', auth.verificarToken, partidoController.finalizarPartido);
router.get('/temporada/:temporadaId', partidoController.listarPartidosPorTemporada);
router.post('/generar-calendario', auth.verificarToken, partidoController.generarCalendario);

module.exports = router;