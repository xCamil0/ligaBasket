/** authRoutes.js — Rutas de autenticación (/api/auth). */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/authMiddlewares');
const { validarRequeridos } = require('../middlewares/validaciones');

router.post('/login', 
    validarRequeridos(['username', 'password']),
    authController.login
);
router.post('/register', 
    auth.verificarToken, 
    validarRequeridos(['username', 'password']),
    authController.register
);
router.get('/admin', auth.verificarToken, authController.admin);
router.delete('/admin/:id', 
    auth.verificarToken, 
    validarRequeridos(['id'], 'params'),
    authController.eliminarAdmin
);
router.put('/admin/:id', 
    auth.verificarToken, 
    validarRequeridos(['id'], 'params'),
    validarRequeridos(['username', 'password']),
    authController.actualizarAdmin
);

module.exports = router;