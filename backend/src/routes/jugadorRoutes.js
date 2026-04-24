const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const auth = require('../middlewares/authMiddlewares');

router.post('/', auth.verificarToken, jugadorController.crearJugador);
router.get('/equipo/:equipo_id', jugadorController.obtenerJugadoresPorEquipo);
router.put('/:id', auth.verificarToken, jugadorController.actualizarJugador);
router.delete('/:id', auth.verificarToken, jugadorController.eliminarJugador);
router.get('/', auth.verificarToken, jugadorController.obtenerTodosLosJugadores);
router.get('/agentes-libres', auth.verificarToken, jugadorController.obtenerAgentesLibres);

module.exports = router;