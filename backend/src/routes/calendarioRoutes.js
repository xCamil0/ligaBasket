const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendarioController');

// Ruta: POST /api/calendario/generar
router.post('/generar', calendarioController.generarCalendarioAutomatico);

module.exports = router;