const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const verificarToken = require('../middlewares/authMiddlewares');

router.post('/', verificarToken, jugadorController.crearJugador);
router.get('/equipo/:equipo_id', jugadorController.obtenerJugadoresPorEquipo);
router.put('/:id', verificarToken, jugadorController.actualizarJugador);
router.delete('/:id', verificarToken, jugadorController.eliminarJugador);

module.exports = router;