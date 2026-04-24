const express = require('express');
const router = express.Router();
const { listar, crear, eliminar, actualizar} = require('../controllers/temporadasController');
const auth = require('../middlewares/authMiddlewares');

router.get('/', listar);
router.post('/', auth.verificarToken, crear);
router.delete('/:id', auth.verificarToken, eliminar);
router.put('/:id', auth.verificarToken, actualizar);

module.exports = router;