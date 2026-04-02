const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Ruta: /api/stats/pichichi
router.get('/pichichi', statsController.obtenerPichichi);

module.exports = router;