const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendarioController');
const auth = require('../middlewares/authMiddlewares');

// Ruta: POST /api/calendario/generar
router.post('/generar', auth.verificarToken, calendarioController.generarCalendario);
router.delete('/eliminar', auth.verificarToken, calendarioController.eliminarPartidos);

module.exports = router;