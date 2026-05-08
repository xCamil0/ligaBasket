/** equipoRoutes.js — Rutas de equipos (/api/equipos). */
const express = require('express');
const equipoController = require('../controllers/equipoController');
const auth = require('../middlewares/authMiddlewares');
const multer = require('multer');
const path = require('path');

// Multer: almacena logos en /uploads con nombre único (timestamp)
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const router = express.Router();

router.get('/', equipoController.obtenerEquipos);
router.post('/', auth.verificarToken, upload.single('foto'), equipoController.crearEquipo);
router.delete('/:id', auth.verificarToken, equipoController.eliminarEquipo);
router.put('/:id', auth.verificarToken, upload.single('foto'), equipoController.actualizarEquipo);
router.get('/:id/detalle', equipoController.obtenerDetalleEquipo);
router.post('/fichar', auth.verificarToken, equipoController.gestionarFichajeOLiberacion);
router.get('/por-temporada', equipoController.obtenerEquiposPorTemporada);

module.exports = router;