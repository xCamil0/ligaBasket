const express = require('express');
const router = express.Router();
const tablaController = require('../controllers/tablaController');

router.get('/', tablaController.obtenerTablaPosiciones);

module.exports = router;