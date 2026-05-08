/** temporadasRoutes.js — Rutas de temporadas (/api/temporadas). */
const express = require('express');
const router = express.Router();
const { listar, crear, eliminar, actualizar, actual, asignarEquipos, obtenerEquipos } = require('../controllers/temporadasController');
const auth = require('../middlewares/authMiddlewares');

router.get('/', listar);
router.post('/', auth.verificarToken, crear);
router.post('/equipos', auth.verificarToken, asignarEquipos);
router.put('/actual/:id', auth.verificarToken, actual);
router.get('/:temporada_id/equipos', auth.verificarToken, obtenerEquipos);
router.put('/:id', auth.verificarToken, actualizar);
router.delete('/:id', auth.verificarToken, eliminar);

module.exports = router;