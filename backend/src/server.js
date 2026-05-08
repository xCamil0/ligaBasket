/**
 * server.js — Punto de entrada del backend.
 * Configura middlewares, registra rutas y levanta el servidor Express.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Rutas
const equipoRoutes = require('./routes/equipoRoutes');
const partidoRoutes = require('./routes/partidoRoutes');
const jugadorRoutes = require('./routes/jugadorRoutes');
const tablaRoutes = require('./routes/tablaRoutes');
const statsRoutes = require('./routes/statsRoutes');
const calendarioRoutes = require('./routes/calendarioRoutes');
const authRoutes = require('./routes/authRoutes');
const temporadasRoutes = require('./routes/temporadasRoutes');

// Middlewares globales
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Registro de rutas
app.use('/api/equipos', equipoRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/jugadores', jugadorRoutes);
app.use('/api/tabla', tablaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/calendario', calendarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/temporadas', temporadasRoutes);

// Ruta raíz de verificación
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`SERVIDOR DE BÁSQUET LISTO`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`=================================`);
});