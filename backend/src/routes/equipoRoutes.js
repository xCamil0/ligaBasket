const express = require('express');
const equipoController = require('../controllers/equipoController');
const auth = require('../middlewares/authMiddlewares');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para subir fotos

const storage = multer.diskStorage({
     destination: 'uploads/', // Carpeta donde se guardarán las fotos
     filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
     }
});

const upload = multer({ storage: storage });
upload.single('foto') 

const router = express.Router();

// Cuando alguien entre a GET /api/equipos, llamamos al controlador
router.get('/', equipoController.obtenerEquipos);
router.post('/', auth.verificarToken, upload.single('foto'), equipoController.crearEquipo);
router.delete('/:id', auth.verificarToken, equipoController.eliminarEquipo);
router.put('/:id', auth.verificarToken, upload.single('foto'), equipoController.actualizarEquipo);
router.get('/:id/detalle', equipoController.obtenerDetalleEquipo);
router.post('/fichar', auth.verificarToken, equipoController.gestionarFichajeOLiberacion);
router.get('/por-temporada', equipoController.obtenerEquiposPorTemporada);

module.exports = router;