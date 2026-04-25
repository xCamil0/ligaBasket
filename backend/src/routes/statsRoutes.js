const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/pichichi', statsController.obtenerPichichi);

module.exports = router;