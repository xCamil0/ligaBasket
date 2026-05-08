/**
 * Tabla.jsx — Página de tabla de posiciones.
 * Muestra PJ, G, E, P, PF, PC, DP, PTS por equipo en la temporada seleccionada.
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import './Tabla.css';

const Standings = () => {
  const [tabla, setTabla] = useState([]);
  const [temporadaId, setTemporadaId] = useState("");
  const [cargando, setCargando] = useState(true);
  const [temporadas, setTemporadas] = useState([]);

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

  // Obtener datos de la tabla cuando cambia la temporada
  useEffect(() => {
    if (!temporadaId || Number(temporadaId) === 1) {
      setTabla([]);
      setCargando(false);
      return;
    }

    const obtenerDatosTabla = async () => {
      try {
        setCargando(true);
        const res = await axios.get('http://localhost:5000/api/tabla', {
          params: { temporada: temporadaId }
        });
        setTabla(res.data);
      } catch (error) {
        console.error("Error al traer la tabla:", error);
        setTabla([]);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatosTabla();
  }, [temporadaId]);

  return (
    <div className="contenedor-pagina">
      <div className="contenedor-central">

        <div className="cabecera-tabla">
          <h1 className="titulo-tabla">Posiciones</h1>
          <select
            className="selector-temporada"
            value={temporadaId}
            onChange={(e) => setTemporadaId(e.target.value)}
          >
            <option value="" disabled>Seleccionar Temporada</option>
            {temporadas.map(temp => (
              <option key={temp.id} value={temp.id}>{temp.nombre}</option>
            ))}
          </select>
        </div>

        {Number(temporadaId) === 1 ? (
          <div className="contenedor-amistosos">
            <h2 className="titulo-amistosos">Temporada de Amistosos</h2>
            <p className="texto-amistosos">
              Esta temporada se utiliza para partidos de práctica y no genera una tabla de posiciones oficial.
            </p>
            <p className="texto-amistosos-destacado">
              ¡Consulta el calendario para ver los resultados!
            </p>
          </div>
        ) : (
          <div className="contenedor-tabla">
            <table className="tabla-posiciones">
              <thead className="cabecera-columnas">
                <tr>
                  <th className="celda-cabecera-centro">Pos</th>
                  <th className="celda-cabecera"></th>
                  <th className="celda-cabecera">Equipo</th>
                  <th className="celda-cabecera-centro">PJ</th>
                  <th className="celda-cabecera-centro">G</th>
                  <th className="celda-cabecera-centro">E</th>
                  <th className="celda-cabecera-centro">P</th>
                  <th className="celda-cabecera-centro">PF</th>
                  <th className="celda-cabecera-centro">PC</th>
                  <th className="celda-cabecera-centro">DP</th>
                  <th className="celda-cabecera-centro">PTS</th>
                </tr>
              </thead>
              <tbody className="cuerpo-tabla">
                {cargando ? (
                  <tr><td colSpan="11" className="celda-vacia">Cargando...</td></tr>
                ) : tabla.length > 0 ? (
                  tabla.map((fila, index) => (
                    <tr key={fila.id} className="fila-tabla">
                      <td className="celda-posicion">{index + 1}</td>
                      <td className="celda-logo">
                        <img src={`http://localhost:5000${fila.logo}`} alt={fila.nombre} className="logo-equipo-tabla" />
                      </td>
                      <td className="celda-equipo">
                        <a href={`/equipos/${fila.id}/detalle`} className="enlace-equipo">{fila.nombre}</a>
                      </td>
                      <td className="celda-estadistica">{fila.pj}</td>
                      <td className="celda-estadistica">{fila.g}</td>
                      <td className="celda-estadistica">{fila.e}</td>
                      <td className="celda-estadistica">{fila.p}</td>
                      <td className="celda-estadistica">{fila.pf}</td>
                      <td className="celda-estadistica">{fila.pc}</td>
                      <td className="celda-estadistica">{fila.dp}</td>
                      <td className="celda-puntos">{fila.pts}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="11" className="celda-vacia">No hay datos disponibles para esta temporada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Standings;