/**
 * authController.js — Controlador de autenticación.
 * Login, registro y gestión de usuarios administradores.
 */
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/** Autentica un usuario y devuelve un JWT. */
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        const usuario = result.rows[0];
        const esValida = await bcrypt.compare(password, usuario.password);

        if (!esValida) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { id: usuario.id, username: usuario.username },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ mensaje: "Login exitoso", token, username: usuario.username });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor durante el login" });
    }
};

/** Registra un nuevo usuario admin (requiere token). */
const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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

/** Lista todos los usuarios administradores. */
const admin = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al leer la base de datos" });
    }
};

/** Elimina un usuario por ID. Protege al admin principal (ID 1) y al usuario activo. */
const eliminarAdmin = async (req, res) => {
    const { id } = req.params;
    const idNumerico = Number(id);

    try {
        if (idNumerico === 1) {
            return res.status(403).json({ error: "No se puede eliminar el usuario admin" });
        }

        if (idNumerico === req.user.id) {
            return res.status(403).json({ error: "No se puede eliminar a sí mismo" });
        }

        if (idNumerico < 1) {
            return res.status(400).json({ error: "ID de usuario no válido" });
        }

        await pool.query('DELETE FROM usuarios WHERE id = $1', [idNumerico]);
        res.json({ mensaje: "Usuario eliminado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al eliminar el usuario" });
    }
};

/** Actualiza username y contraseña de un usuario. Protege al admin principal (ID 1). */
const actualizarAdmin = async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    const idNumerico = Number(id);

    try {
        if (idNumerico === 1) {
            return res.status(403).json({ error: "No se puede actualizar el usuario admin" });
        }

        const existingUser = await pool.query('SELECT * FROM usuarios WHERE id = $1', [idNumerico]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedUser = await pool.query(
            'UPDATE usuarios SET username = $1, password = $2 WHERE id = $3 RETURNING *',
            [username, hashedPassword, idNumerico]
        );

        res.json({ mensaje: "Usuario actualizado", usuario: updatedUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al actualizar el usuario" });
    }
};

module.exports = { login, register, admin, eliminarAdmin, actualizarAdmin };