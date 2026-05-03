const express = require('express');
const router = express.Router();
const { listar, crear, eliminar, actualizar, actual, asignarEquipos, obtenerEquipos } = require('../controllers/temporadasController');
const auth = require('../middlewares/authMiddlewares');

router.get('/', listar);
router.post('/', auth.verificarToken, crear);
router.delete('/:id', auth.verificarToken, eliminar);
router.put('/:id', auth.verificarToken, actualizar);
router.put('/actual/:id', auth.verificarToken, actual);
router.post('/equipos', auth.verificarToken, asignarEquipos);
router.get('/:temporada_id/equipos', auth.verificarToken, obtenerEquipos);

module.exports = router;