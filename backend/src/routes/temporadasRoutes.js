/** temporadasRoutes.js — Rutas de temporadas (/api/temporadas). */
const express = require('express');
const router = express.Router();
const { 
    listar, 
    crear, 
    eliminar, 
    actualizar, 
    actual, 
    asignarEquipos, 
    obtenerEquipos, 
    desasignarEquipos,
    obtenerResumenTemporada,
    finalizarTemporada,
    reabrirTemporada
} = require('../controllers/temporadasController');
const auth = require('../middlewares/authMiddlewares');
const { validarRequeridos } = require('../middlewares/validaciones');
const verificarTemporadaFinalizada = require('../middlewares/verificarTemporadaFinalizada');

router.get('/', listar);
router.post('/',
    auth.verificarToken,
    validarRequeridos(['nombre']),
    crear
);
router.post('/equipos',
    auth.verificarToken,
    validarRequeridos(['temporada_id', 'equipos_ids']),
    verificarTemporadaFinalizada({ origen: 'body', campo: 'temporada_id' }),
    asignarEquipos
);
router.put('/actual/:id',
    auth.verificarToken,
    validarRequeridos(['id'], 'params'),
    actual
);
router.get('/:temporada_id/equipos',
    validarRequeridos(['temporada_id'], 'params'),
    auth.verificarToken,
    obtenerEquipos
);
router.put('/:id',
    auth.verificarToken,
    validarRequeridos(['id'], 'params'),
    verificarTemporadaFinalizada({ origen: 'params', campo: 'id' }),
    actualizar
);
router.delete('/equipos',
    auth.verificarToken,
    validarRequeridos(['temporada_id', 'equipos_ids']),
    verificarTemporadaFinalizada({ origen: 'body', campo: 'temporada_id' }),
    desasignarEquipos
);
router.delete('/:id',
    auth.verificarToken,
    validarRequeridos(['id'], 'params'),
    // Excluido de verificación para permitir eliminar temporadas finalizadas
    eliminar
);

// Nuevos endpoints de finalización
router.get('/:id/resumen',
    auth.verificarToken,
    validarRequeridos(['id'], 'params'),
    obtenerResumenTemporada
);
router.put('/:id/finalizar',
    auth.verificarToken,
    validarRequeridos(['id'], 'params'),
    finalizarTemporada
);
router.put('/:id/reabrir',
    auth.verificarToken,
    validarRequeridos(['id'], 'params'),
    reabrirTemporada
);

module.exports = router;