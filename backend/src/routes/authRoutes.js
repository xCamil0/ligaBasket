const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/authMiddlewares');

router.post('/login', authController.login);
router.post('/register', auth.verificarToken, authController.register);
router.get('/admin', auth.verificarToken, authController.admin);
router.delete('/admin/:id', auth.verificarToken, authController.eliminarAdmin);
router.put('/admin/:id', auth.verificarToken, authController.actualizarAdmin);

module.exports = router;