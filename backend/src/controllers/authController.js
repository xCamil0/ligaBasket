const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;
    const SECRET_KEY = 'Cam1016012448*';

    try {
        // 1. Buscar al usuario
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        const usuario = result.rows[0];

        // 2. Comparar contraseña con la versión cifrada en la DB
        const esValida = await bcrypt.compare(password, usuario.password);
        
        if (!esValida) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        // 3. Generar el Token (JWT)
        const token = jwt.sign(
            { id: usuario.id, username: usuario.username },
            SECRET_KEY,
            { expiresIn: '2h' } // El token expira en 2 horas
        );

        res.json({ mensaje: "Login exitoso", token, username: usuario.username });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor durante el login" });
    }
};

module.exports = { login };