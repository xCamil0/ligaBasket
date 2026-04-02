const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        if (userRes.rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

        const usuario = userRes.rows[0];
        // Comparar contraseña cifrada
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

        // Crear Token (Dura 2 horas)
        const token = jwt.sign({ id: usuario.id }, 'TU_CLAVE_SECRETA_SUPER_SEGURA', { expiresIn: '2h' });
        
        res.json({ token, username: usuario.username });
    } catch (error) {
        res.status(500).json({ error: "Error en el login" });
    }
};

module.exports = { login };