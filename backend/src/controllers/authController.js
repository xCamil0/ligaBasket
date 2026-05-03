const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;
    const SECRET_KEY = 'Cam1016012448*';

    try {
        // Buscar al usuario
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        const usuario = result.rows[0];

        // Comparar contraseña con la versión cifrada en la DB
        const esValida = await bcrypt.compare(password, usuario.password);
        
        if (!esValida) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        // Generar el Token (JWT)
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

const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
        }
        // Cifrar la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar el nuevo usuario en la base de datos
        const newUser = await pool.query(
            'INSERT INTO usuarios (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );

        res.status(201).json({ mensaje: "Registro exitoso", usuario: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor durante el registro" });
    }
};

const admin = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al leer la base de datos" });
    }
};

const eliminarAdmin = async (req, res) => {
    const { id } = req.params;
    try {

        if (id === 1) {
            return res.status(403).json({ error: "No se puede eliminar el usuario admin" });
        }

        if (id === req.user.id) {
            return res.status(403).json({ error: "No se puede eliminar a sí mismo" });
        }

        if (id < 1) {
            return res.status(400).json({ error: "ID de usuario no válido" });
        }

        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ mensaje: "Usuario eliminado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al eliminar el usuario" });
    }
}

const actualizarAdmin = async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    try {
        if (id === 1) {
            return res.status(403).json({ error: "No se puede actualizar el usuario admin" });
        }

        const existingUser = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedUser = await pool.query(
            'UPDATE usuarios SET username = $1, password = $2 WHERE id = $3 RETURNING *',
            [username, hashedPassword, id]
        );

        res.json({ mensaje: "Usuario actualizado", usuario: updatedUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al actualizar el usuario" });
    }
};


module.exports = { login, register, admin, eliminarAdmin, actualizarAdmin };