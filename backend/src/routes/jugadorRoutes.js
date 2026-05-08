/** jugadorRoutes.js — Rutas de jugadores (/api/jugadores). */
const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const auth = require('../middlewares/authMiddlewares');

router.get('/', auth.verificarToken, jugadorController.obtenerTodosLosJugadores);
router.get('/agentes-libres', auth.verificarToken, jugadorController.obtenerAgentesLibres);
router.get('/equipo/:equipo_id', jugadorController.obtenerJugadoresPorEquipo);
router.get('/:id/trayectoria', auth.verificarToken, jugadorController.obtenerTrayectoriaJugador);
router.post('/', auth.verificarToken, jugadorController.crearJugador);
router.put('/:id', auth.verificarToken, jugadorController.actualizarJugador);
router.delete('/:id', auth.verificarToken, jugadorController.eliminarJugador);

module.exports = router;