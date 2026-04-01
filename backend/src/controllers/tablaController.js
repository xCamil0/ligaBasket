const pool = require('../config/db');

const obtenerTablaPosiciones = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM tabla_posiciones');
        
        // Agregamos la posición dinámicamente según el orden del array
        const tablaConPosicion = resultado.rows.map((fila, index) => ({
            posicion: index + 1,
            ...fila
        }));

        res.json(tablaConPosicion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar la tabla de posiciones" });
    }
};

module.exports = { obtenerTablaPosiciones };