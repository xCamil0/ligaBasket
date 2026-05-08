/**
 * authMiddlewares.js — Middleware de autenticación JWT.
 * Verifica tokens en rutas protegidas y provee función para crear tokens.
 */
const jwt = require('jsonwebtoken');

/** Middleware: valida el token JWT del header Authorization (formato Bearer). */
const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const SECRET_KEY = process.env.JWT_SECRET;

    if (!authHeader) return res.status(403).json({ error: "Acceso denegado" });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Token no proporcionado" });

    try {
        const verificado = jwt.verify(token, SECRET_KEY);
        req.user = verificado;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token no válido o expirado" });
    }
};

/** Genera un JWT con id y username, expira en 2 horas. */
const crearToken = (usuario) => {
    const SECRET_KEY = process.env.JWT_SECRET;
    return jwt.sign(
        { id: usuario.id, username: usuario.username },
        SECRET_KEY,
        { expiresIn: '2h' }
    );
};

module.exports = { verificarToken, crearToken };