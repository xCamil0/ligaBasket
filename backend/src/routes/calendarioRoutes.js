/** calendarioRoutes.js — Rutas del calendario (/api/calendario). */
const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendarioController');
const auth = require('../middlewares/authMiddlewares');
const { validarRequeridos } = require('../middlewares/validaciones');

router.post('/generar',
    auth.verificarToken,
    validarRequeridos(['temporada_id'], 'body'),
    calendarioController.generarCalendario
);
router.delete('/eliminar',
    auth.verificarToken,
    validarRequeridos(['temporada_id'], 'body'),
    calendarioController.eliminarPartidos
);

module.exports = router;