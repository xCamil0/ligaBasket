/**
 * validaciones.js — Middlewares de validación general para la API.
 */

/**
 * Verifica que todos los campos requeridos estén presentes en la(s) fuente(s) especificada(s).
 * @param {string[]} camposRequeridos - Lista de nombres de campos.
 * @param {string|string[]} fuente - 'body', 'params', 'query' o 'any' (busca en todas). Por defecto 'body'.
 */
const validarRequeridos = (camposRequeridos, fuente = 'body') => {
    return (req, res, next) => {
        const faltantes = [];
        const fuentesABuscar = fuente === 'any' ? ['body', 'query', 'params'] : (Array.isArray(fuente) ? fuente : [fuente]);

        camposRequeridos.forEach(campo => {
            let encontrado = false;

            for (const f of fuentesABuscar) {
                const datos = req[f];
                if (datos && datos[campo] !== undefined && datos[campo] !== null) {
                    const valor = datos[campo];
                    if (Array.isArray(valor)) {
                        encontrado = true;
                    } else if (typeof valor === 'object') {
                        encontrado = true;
                    } else if (typeof valor === 'boolean') {
                        encontrado = true;
                    } else if (String(valor).trim() !== '') {
                        encontrado = true;
                    }
                    if (encontrado) break;
                }
            }

            if (!encontrado) {
                faltantes.push(campo);
            }
        });

        if (faltantes.length > 0) {
            return res.status(400).json({
                error: `Faltan campos obligatorios: ${faltantes.join(', ')}`,
                buscadoEn: fuentesABuscar,
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
