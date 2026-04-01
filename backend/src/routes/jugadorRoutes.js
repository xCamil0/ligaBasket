const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');

router.post('/', jugadorController.crearJugador);
router.get('/equipo/:equipo_id', jugadorController.obtenerJugadoresPorEquipo);
router.put('/:id', jugadorController.actualizarJugador);
router.delete('/:id', jugadorController.eliminarJugador);

module.exports = router;