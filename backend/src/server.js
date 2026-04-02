const express = require('express');
const cors = require('cors');
require('dotenv').config();

const equipoRoutes = require('./routes/equipoRoutes');
const partidoRoutes = require('./routes/partidoRoutes');
const jugadorRoutes = require('./routes/jugadorRoutes');
const tablaRoutes = require('./routes/tablaRoutes');
const statsRoutes = require('./routes/statsRoutes');
const calendarioRoutes = require('./routes/calendarioRoutes');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// --- RUTAS ---
app.use('/api/equipos', equipoRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/jugadores', jugadorRoutes);
app.use('/api/tabla', tablaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/calendario', calendarioRoutes);

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