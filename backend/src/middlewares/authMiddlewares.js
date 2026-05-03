const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const SECRET_KEY = process.env.JWT_SECRET;
    if (!authHeader) return res.status(403).json({ error: "Acceso denegado" });

    // Extraer el token del formato "Bearer TOKEN_AQUI"
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

const crearToken = (usuario) => {
    const SECRET_KEY = process.env.JWT_SECRET;
    const payload = {
        id: usuario.id,
        username: usuario.username
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });
};

module.exports = { verificarToken, crearToken };