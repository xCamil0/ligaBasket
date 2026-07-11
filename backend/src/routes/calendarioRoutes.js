/** calendarioRoutes.js — Rutas del calendario (/api/calendario). */
const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendarioController');
const auth = require('../middlewares/authMiddlewares');
const { validarRequeridos } = require('../middlewares/validaciones');
const verificarTemporadaFinalizada = require('../middlewares/verificarTemporadaFinalizada');

router.post('/generar',
    auth.verificarToken,
    validarRequeridos(['temporada_id'], 'body'),
    verificarTemporadaFinalizada({ origen: 'body', campo: 'temporada_id' }),
    calendarioController.generarCalendario
);
router.delete('/eliminar',
    auth.verificarToken,
    validarRequeridos(['temporada_id'], 'body'),
    verificarTemporadaFinalizada({ origen: 'body', campo: 'temporada_id' }),
    calendarioController.eliminarPartidos
);

module.exports = router;