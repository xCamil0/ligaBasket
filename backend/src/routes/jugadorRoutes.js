/** jugadorRoutes.js — Rutas de jugadores (/api/jugadores). */
const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const auth = require('../middlewares/authMiddlewares');
const { validarRequeridos } = require('../middlewares/validaciones');

router.get('/', jugadorController.obtenerTodosLosJugadores);
router.get('/agentes-libres', jugadorController.obtenerAgentesLibres);
router.get('/equipo/:equipo_id', 
    validarRequeridos(['equipo_id'], 'params'), 
    jugadorController.obtenerJugadoresPorEquipo
);
router.get('/:id/trayectoria', 
    validarRequeridos(['id'], 'params'), 
    jugadorController.obtenerTrayectoriaJugador
);
router.post('/', 
    auth.verificarToken, 
    validarRequeridos(['nombre_apellido', 'categoria']), 
    jugadorController.crearJugador
);
router.put('/:id', 
    auth.verificarToken, 
    validarRequeridos(['id'], 'params'), 
    jugadorController.actualizarJugador
);
router.delete('/:id', 
    auth.verificarToken, 
    validarRequeridos(['id'], 'params'), 
    jugadorController.eliminarJugador
);

module.exports = router;