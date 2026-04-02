const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');

router.get('/', partidoController.obtenerPartidos);
router.post('/', partidoController.crearPartido);
router.put('/:id/finalizar', partidoController.finalizarPartido);
router.put('/:id', partidoController.actualizarPartido);
router.delete('/:id', partidoController.eliminarPartido);
router.get('/:id/jugadores', partidoController.obtenerJugadoresDelPartido);

module.exports = router;