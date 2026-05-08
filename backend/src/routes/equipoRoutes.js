/** equipoRoutes.js — Rutas de equipos (/api/equipos). */
const express = require('express');
const equipoController = require('../controllers/equipoController');
const auth = require('../middlewares/authMiddlewares');
const { validarRequeridos } = require('../middlewares/validaciones');
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
router.post('/', 
    auth.verificarToken, 
    upload.single('foto'), 
    validarRequeridos(['nombre', 'entrenador', 'estadio', 'temporada_id']),
    equipoController.crearEquipo
);
router.delete('/:id', 
    auth.verificarToken, 
    validarRequeridos(['id'], 'params'),
    equipoController.eliminarEquipo
);
router.put('/:id', 
    auth.verificarToken, 
    upload.single('foto'), 
    validarRequeridos(['id'], 'params'),
    equipoController.actualizarEquipo
);
router.get('/:id/detalle', 
    validarRequeridos(['id'], 'params'),
    equipoController.obtenerDetalleEquipo
);
router.post('/fichar', 
    auth.verificarToken, 
    validarRequeridos(['jugador_id', 'temporada_id']),
    equipoController.gestionarFichajeOLiberacion
);
router.get('/por-temporada', 
    validarRequeridos(['temporada_id'], 'query'),
    equipoController.obtenerEquiposPorTemporada
);

module.exports = router;