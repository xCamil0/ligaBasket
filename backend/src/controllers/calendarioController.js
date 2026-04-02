const pool = require('../config/db');

const generarCalendarioAutomatico = async (req, res) => {
    const { fecha_inicio, partidos_por_dia } = req.body; // Ejemplo: "2026-05-01", 2
    
    try {
        // 1. Obtener equipos
        const equiposRes = await pool.query('SELECT id FROM equipos');
        const equipos = equiposRes.rows;

        if (equipos.length < 2) return res.status(400).json({ error: "Mínimo 2 equipos" });

        // Algoritmo Round Robin (Todos contra todos)
        let jornadas = [];
        let tempEquipos = [...equipos];
        if (tempEquipos.length % 2 !== 0) tempEquipos.push({ id: null }); // Descanso si son impares

        const numEquipos = tempEquipos.length;
        const totalJornadas = numEquipos - 1;

        for (let i = 0; i < totalJornadas; i++) {
            let jornada = [];
            for (let j = 0; j < numEquipos / 2; j++) {
                const local = tempEquipos[j];
                const visitante = tempEquipos[numEquipos - 1 - j];
                if (local.id && visitante.id) {
                    jornada.push({ local: local.id, visitante: visitante.id });
                }
            }
            jornadas.push(jornada);
            // Rotación
            tempEquipos.splice(1, 0, tempEquipos.pop());
        }

        // 2. Insertar en DB con fechas automáticas (Ida y Vuelta)
        let fechaActual = new Date(fecha_inicio);
        let contadorPartidos = 0;

        for (let vuelta = 1; vuelta <= 2; vuelta++) { // Ida = 1, Vuelta = 2
            for (const jornada of jornadas) {
                for (const p of jornada) {
                    // Lógica de fechas: Si llegamos al límite de partidos por día, saltar al siguiente Sábado/Domingo
                    if (contadorPartidos >= partidos_por_dia) {
                        // Saltar al siguiente día de fin de semana
                        do {
                            fechaActual.setDate(fechaActual.getDate() + 1);
                        } while (fechaActual.getDay() !== 0 && fechaActual.getDay() !== 6); 
                        contadorPartidos = 0;
                    }

                    const equipoL = vuelta === 1 ? p.local : p.visitante;
                    const equipoV = vuelta === 1 ? p.visitante : p.local;

                    await pool.query(
                        'INSERT INTO partidos (id_equipo_local, id_equipo_visitante, fecha, horario, lugar) VALUES ($1, $2, $3, $4, $5)',
                        [equipoL, equipoV, fechaActual.toISOString().split('T')[0], '18:00:00', 'Gimnasio Municipal']
                    );
                    contadorPartidos++;
                }
            }
        }

        res.json({ mensaje: "Calendario de Ida y Vuelta generado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar el calendario" });
    }
};

module.exports = { generarCalendarioAutomatico };