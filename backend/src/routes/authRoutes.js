const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/authMiddlewares');

router.post('/login', authController.login);
router.post('/register', auth.verificarToken, authController.register);
router.get('/users', auth.verificarToken, authController.users);

module.exports = router;