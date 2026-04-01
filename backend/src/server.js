const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json()); // Permite leer el cuerpo de los mensajes (JSON)

// --- RUTA DE PRUEBA ---
app.get('/api/test', (req, res) => {
    res.json({ 
        mensaje: "¡Desde cero y funcionando!",
        estado: "Conectado"
    });
});

// --- ENCENDER SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🏀 SERVIDOR DE BÁSQUET LISTO`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`=================================`);
});