const express = require('express');
const router = express.Router();
const { listar, crear, eliminar, actualizar, actual } = require('../controllers/temporadasController');
const auth = require('../middlewares/authMiddlewares');

router.get('/', listar);
router.post('/', auth.verificarToken, crear);
router.delete('/:id', auth.verificarToken, eliminar);
router.put('/:id', auth.verificarToken, actualizar);
router.put('/actual/:id', auth.verificarToken, actual);

module.exports = router;