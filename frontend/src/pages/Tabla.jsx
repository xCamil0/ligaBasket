import { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* CABECERA Y SELECTOR */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Posiciones</h1>
          <select 
            className="p-2 rounded border bg-white shadow-sm"
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
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-700">Temporada de Amistosos</h2>
            <p className="text-gray-500 mt-2">
              Esta temporada se utiliza para partidos de práctica y no genera una tabla de posiciones oficial.
            </p>
            <p className="text-blue-600 font-medium mt-4">
              ¡Consulta el calendario para ver los resultados!
            </p>
          </div>
        ) : (
          // VISTA DE TABLA NORMAL
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-4 text-center">Pos</th>
                  <th className="p-4"></th>
                  <th className="p-4">Equipo</th>
                  <th className="p-4 text-center">PJ</th>
                  <th className="px-4 py-4 text-center">G</th>
                  <th className="px-4 py-4 text-center">E</th>
                  <th className="px-4 py-4 text-center">P</th>
                  <th className="px-4 py-4 text-center">PF</th>
                  <th className="px-4 py-4 text-center">PC</th>
                  <th className="px-4 py-4 text-center">DP</th>
                  <th className="p-4 text-center font-bold">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cargando ? (
                  <tr><td colSpan="11" className="p-10 text-center">Cargando...</td></tr>
                ) : tabla.length > 0 ? (
                  tabla.map((fila, index) => (
                    <tr key={fila.id} className="hover:bg-gray-50">
                      <td className="p-4 text-center font-mono">{index + 1}</td>
                      <td className="p-4">
                        <img src={`http://localhost:5000${fila.logo}`} alt={fila.nombre} className="w-10 h-10 rounded-full object-cover" />
                      </td>
                      <td className="p-4 font-semibold text-blue-600">{fila.nombre}</td>
                      <td className="p-4 text-center">{fila.pj}</td>
                      <td className="p-4 text-center">{fila.g}</td>
                      <td className="p-4 text-center">{fila.e}</td>
                      <td className="p-4 text-center">{fila.p}</td>
                      <td className="p-4 text-center">{fila.pf}</td>
                      <td className="p-4 text-center">{fila.pc}</td>
                      <td className="p-4 text-center">{fila.dp}</td>
                      <td className="p-4 text-center font-bold bg-slate-50">{fila.pts}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="11" className="p-10 text-center text-gray-400">No hay datos disponibles para esta temporada.</td></tr>
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