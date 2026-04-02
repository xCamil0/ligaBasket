const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');

// Cuando alguien entre a GET /api/equipos, llamamos al controlador
router.get('/', equipoController.obtenerEquipos);
router.post('/', equipoController.crearEquipo);
router.delete('/:id', equipoController.eliminarEquipo);
router.put('/:id', equipoController.actualizarEquipo);
router.get('/:id/detalle', equipoController.obtenerDetalleEquipo);

module.exports = router;