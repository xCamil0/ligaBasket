const express = require('express');
const cors = require('cors');
require('dotenv').config();

const equipoRoutes = require('./routes/equipoRoutes');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- RUTAS ---
app.use('/api/equipos', equipoRoutes);

// --- ENCENDER SERVIDOR ---
const PORT = process.env.PORT || 5000;
// Ruta raíz (Home)
app.get('/', (req, res) => {
    res.send('🏀 API de la Liga de Básquet funcionando correctamente');
});
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🏀 SERVIDOR DE BÁSQUET LISTO`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`=================================`);
});