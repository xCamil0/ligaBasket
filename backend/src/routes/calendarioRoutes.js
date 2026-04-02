const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendarioController');
const verificarToken = require('../middlewares/authMiddlewares');

// Ruta: POST /api/calendario/generar
router.post('/generar', verificarToken, calendarioController.generarCalendarioAutomatico);

module.exports = router;