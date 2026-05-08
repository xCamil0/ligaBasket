/**
 * pichichi.jsx — Página del ranking de máximos anotadores.
 * Top 10 de goleadores por temporada con nombre, equipo y puntos totales.
 */
import { useState, useEffect } from 'react';
import './pichichi.css';
import axios from 'axios';

const Pichichi = () => {

    const [temporadas, setTemporadas] = useState([]);
    const [temporadaId, setTemporadaId] = useState("");
    const [pichichi, setPichichi] = useState([]);
    const [cargando, setCargando] = useState(false);

    // Cargar temporadas y seleccionar la más reciente
    useEffect(() => {
        const cargarTemporadas = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/temporadas');
                setTemporadas(res.data);

                if (res.data.length > 0) {
                    setTemporadaId(res.data[res.data.length - 1].id);
                }
            } catch (error) {
                console.error("Error cargando temporadas:", error);
            }
        };
        cargarTemporadas();
    }, []);

    // Obtener datos del pichichi cuando cambia la temporada
    useEffect(() => {
        if (!temporadaId || Number(temporadaId) === 1) {
            setPichichi([]);
            return;
        }

        const obtenerDatosPichichi = async () => {
            try {
                setCargando(true);
                const res = await axios.get('http://localhost:5000/api/stats/pichichi', {
                    params: { temporada_id: temporadaId }
                });
                setPichichi(res.data);
            } catch (error) {
                console.error("Error al traer el pichichi:", error);
                setPichichi([]);
            } finally {
                setCargando(false);
            }
        };

        obtenerDatosPichichi();
    }, [temporadaId]);

    return (
        <div className="contenedor-pagina">
            <div className="contenedor-central">

                <div className="cabecera-tabla">
                    <h1 className="titulo-tabla">Pichichi</h1>
                    <select
                        className="selector-temporada"
                        value={temporadaId}
                        onChange={(e) => setTemporadaId(e.target.value)}
                    >
                        <option value="" disabled>Seleccionar Temporada</option>
                        {temporadas.map(temp => (
                            <option key={temp.id} value={temp.id}>
                                {temp.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {Number(temporadaId) === 1 ? (
                    <div className="contenedor-amistosos">
                        <h2 className="titulo-amistosos">Temporada de Amistosos</h2>
                        <p className="texto-amistosos">
                            Esta temporada se utiliza para partidos de práctica y no genera un pichichi oficial.
                        </p>
                        <p className="texto-amistosos-destacado">
                            ¡Consulta las otras temporadas para ver los resultados!
                        </p>
                    </div>
                ) : (
                    <div className="contenedor-tabla">
                        <table className="tabla-posiciones">
                            <thead className="cabecera-columnas">
                                <tr>
                                    <th className="celda-cabecera-centro">Pos</th>
                                    <th className="celda-cabecera">Jugador</th>
                                    <th className="celda-cabecera-centro">Equipo</th>
                                    <th className="celda-cabecera-centro">Puntos</th>
                                </tr>
                            </thead>
                            <tbody className="cuerpo-tabla">
                                {cargando ? (
                                    <tr>
                                        <td colSpan="4" className="celda-vacia">Cargando...</td>
                                    </tr>
                                ) : pichichi.length > 0 ? (
                                    pichichi.map((fila, index) => (
                                        <tr key={fila.id} className="fila-tabla">
                                            <td className="celda-posicion">{index + 1}</td>
                                            <td className="celda-equipo">{fila.nombre_apellido}</td>
                                            <td className="celda-estadistica">{fila.nombre_equipo}</td>
                                            <td className="celda-estadistica">{fila.total_puntos}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="celda-vacia">
                                            No hay datos disponibles para esta temporada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pichichi;