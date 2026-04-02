const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const SECRET_KEY = 'Cam1016012448*';
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

module.exports = verificarToken;