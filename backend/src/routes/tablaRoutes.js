/** tablaRoutes.js — Ruta de la tabla de posiciones (/api/tabla). */
const express = require('express');
const router = express.Router();
const tablaController = require('../controllers/tablaController');
const { validarRequeridos } = require('../middlewares/validaciones');

router.get('/',
    validarRequeridos(['temporada_id'], 'any'),
    tablaController.obtenerTabla
);

module.exports = router;