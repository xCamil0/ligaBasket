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
          setTemporadaId(res.data[res.data.length - 1].id);
        }
      } catch (error) {
        console.error("Error cargando temporadas:", error);
      }
    };
        cargarTemporadas();
    }, []);

    useEffect(() => {
    if (!temporadaId) return; // Si aún no hay ID, no pidas nada

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
            <option value="">Seleccionar Temporada</option>
            {temporadas.map(temp => (
              <option key={temp.id} value={temp.id}>{temp.nombre}</option>
            ))}
          </select>
        </div>

        {/* LA TABLA */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4 text-center">Pos</th>
                <th className="p-4">Equipo</th>
                <th className="p-4 text-center">PJ</th>
                <th className="px-4 py-4 text-center">G</th>
                <th className="px-4 py-4 text-center">E</th>
                <th className="px-4 py-4 text-center">P</th>
                <th className="px-4 py-4 text-center">GF</th>
                <th className="px-4 py-4 text-center">GC</th>
                <th className="px-4 py-4 text-center">DG</th>
                <th className="p-4 text-center font-bold">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cargando ? (
                <tr><td colSpan="4" className="p-10 text-center">Cargando...</td></tr>
              ) : (
                tabla.map((fila, index) => (
                  <tr key={fila.id} className="hover:bg-gray-50">
                    <td className="p-4 text-center font-mono">{index + 1}</td>
                    <td className="p-4 font-semibold text-blue-600">{fila.nombre}</td>
                    <td className="p-4 text-center">{fila.pj}</td>
                    <td className="p-4 text-center font-bold bg-slate-50">{fila.puntos}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Standings;