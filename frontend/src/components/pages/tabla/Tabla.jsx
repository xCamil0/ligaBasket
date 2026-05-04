import { useState, useEffect } from 'react';
import axios from 'axios';
import './Tabla.css';

const Standings = () => {
  // 1. Estado para guardar los datos de la tabla
  const [tabla, setTabla] = useState([]);
  // 2. Estado para manejar la temporada seleccionada (por defecto la 1)
  const [temporadaId, setTemporadaId] = useState("");
  // 3. Estado para saber si está cargando (opcional, pero profesional)
  const [cargando, setCargando] = useState(true);

  const [temporadas, setTemporadas] = useState([]);

  useEffect(() => {

    const cargarTemporadas = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/temporadas');
        setTemporadas(res.data);

        // Si hay temporadas, seleccionamos la última (la más reciente) por defecto
        if (res.data.length > 0) {
          // Suponiendo que la última de la lista es la actual
          setTemporadaId(res.data[res.data.length + 2].id);
        }
      } catch (error) {
        console.error("Error cargando temporadas:", error);
      }
    };
    cargarTemporadas();
  }, []);

  useEffect(() => {
    if (!temporadaId || Number(temporadaId) === 1) {
      setTabla([]);
      setCargando(false);
      return;
    }
    const obtenerDatosTabla = async () => {
      try {
        setCargando(true);
        const res = await axios.get(`http://localhost:5000/api/tabla`, {
          params: { temporada: temporadaId } // Usando tu formato ?temporada=X
        });
        setTabla(res.data);
      } catch (error) {
        console.error("Error al traer la tabla:", error);
        setTabla([]); // Limpiar tabla si hay error
      } finally {
        setCargando(false);
      }
    };

    obtenerDatosTabla();
  }, [temporadaId]);

  return (
    <div className="contenedor-pagina">
      <div className="contenedor-central">

        {/* CABECERA Y SELECTOR */}
        <div className="cabecera-tabla">
          <h1 className="titulo-tabla">Posiciones</h1>
          <select
            className="selector-temporada"
            value={temporadaId}
            onChange={(e) => setTemporadaId(e.target.value)}
          >
            <option value="" disabled selected>Seleccionar Temporada</option>
            {temporadas.map(temp => (
              <option key={temp.id} value={temp.id}>{temp.nombre}</option>
            ))}
          </select>
        </div>

        {/* LÓGICA DE RENDERIZADO CONDICIONAL */}
        {Number(temporadaId) === 1 ? (
          // VISTA PARA AMISTOSOS
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
          // VISTA DE TABLA NORMAL
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
                        <a href={`/equipo/${fila.id}`} className="enlace-equipo">{fila.nombre}</a>
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