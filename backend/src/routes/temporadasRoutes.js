/** temporadasRoutes.js — Rutas de temporadas (/api/temporadas). */
const express = require('express');
const router = express.Router();
const { listar, crear, eliminar, actualizar, actual, asignarEquipos, obtenerEquipos } = require('../controllers/temporadasController');
const auth = require('../middlewares/authMiddlewares');
const { validarRequeridos } = require('../middlewares/validaciones');

router.get('/', listar);
router.post('/',
    auth.verificarToken,
    validarRequeridos(['nombre']),
    crear
);
router.post('/equipos',
    auth.verificarToken,
    validarRequeridos(['temporada_id', 'equipos_ids']),
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
    actualizar
);
router.delete('/:id',
    auth.verificarToken,
    validarRequeridos(['id'], 'params'),
    eliminar
);

module.exports = router;