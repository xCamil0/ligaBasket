const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const verificarToken = require('../middlewares/authMiddlewares');

// Cuando alguien entre a GET /api/equipos, llamamos al controlador
router.get('/', equipoController.obtenerEquipos);
router.post('/', verificarToken, equipoController.crearEquipo);
router.delete('/:id', verificarToken, equipoController.eliminarEquipo);
router.put('/:id', verificarToken, equipoController.actualizarEquipo);
router.get('/:id/detalle', equipoController.obtenerDetalleEquipo);

module.exports = router;