/**
 * validaciones.js — Middlewares de validación general para la API.
 */

/**
 * Verifica que todos los campos requeridos estén presentes en la fuente especificada (body, params, query).
 * @param {string[]} camposRequeridos - Lista de nombres de campos.
 * @param {string} fuente - 'body', 'params' o 'query' (por defecto 'body').
 */
const validarRequeridos = (camposRequeridos, fuente = 'body') => {
    return (req, res, next) => {
        const faltantes = [];
        const datos = req[fuente];

        if (!datos) {
            return res.status(400).json({ error: `No se enviaron datos en ${fuente}` });
        }

        camposRequeridos.forEach(campo => {
            // Verificamos si el campo es undefined, null o un string vacío
            if (datos[campo] === undefined || datos[campo] === null || String(datos[campo]).trim() === '') {
                faltantes.push(campo);
            }
        });

        if (faltantes.length > 0) {
            return res.status(400).json({
                error: `Faltan campos obligatorios en ${fuente}: ${faltantes.join(', ')}`,
                camposFaltantes: faltantes
            });
        }
        next();
    };
};

/**
 * Valida que un campo sea de un tipo específico.
 * @param {string} campo - Nombre del campo.
 * @param {string} tipo - 'number', 'string', 'boolean'.
 * @param {string} fuente - 'body', 'params' o 'query'.
 */
const validarTipo = (campo, tipo, fuente = 'body') => {
    return (req, res, next) => {
        const valor = req[fuente][campo];
        if (valor !== undefined && typeof valor !== tipo) {
            return res.status(400).json({
                error: `El campo '${campo}' debe ser de tipo ${tipo}`
            });
        }
        next();
    };
};

module.exports = {
    validarRequeridos,
    validarTipo
};
