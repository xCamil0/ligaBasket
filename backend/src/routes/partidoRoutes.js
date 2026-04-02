const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const verificarToken = require('../middlewares/authMiddlewares');

router.get('/', partidoController.obtenerPartidos);
router.post('/', verificarToken, partidoController.crearPartido);
router.put('/:id', verificarToken, partidoController.actualizarPartido);
router.delete('/:id', verificarToken, partidoController.eliminarPartido);
router.get('/:id/jugadores', partidoController.obtenerJugadoresDelPartido);
router.put('/:id/finalizar', verificarToken, partidoController.finalizarPartido);

module.exports = router;