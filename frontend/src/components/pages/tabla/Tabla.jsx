import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Info, AlertTriangle } from 'lucide-react';

const Standings = () => {
  const [tabla, setTabla] = useState([]);
  const [temporada_id, setTemporada_id] = useState("");
  const [cargando, setCargando] = useState(true);
  const [temporadas, setTemporadas] = useState([]);

  // Cargar temporadas y seleccionar la más reciente
  useEffect(() => {
    const cargarTemporadas = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/temporadas');
        setTemporadas(res.data);

        if (res.data.length > 0) {
          setTemporada_id(res.data[res.data.length - 1].id);
        }
      } catch (error) {
        console.error("Error cargando temporadas:", error);
      }
    };
    cargarTemporadas();
  }, []);

  // Obtener datos de la tabla cuando cambia la temporada
  useEffect(() => {
    if (!temporada_id || Number(temporada_id) === 1) {
      setTabla([]);
      setCargando(false);
      return;
    }

    const obtenerDatosTabla = async () => {
      try {
        setCargando(true);
        const res = await axios.get('http://localhost:5000/api/tabla', {
          params: { temporada_id: temporada_id }
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
  }, [temporada_id]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 pb-28 lg:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Tabla de Posiciones</h1>
            <p className="text-slate-400 text-xs mt-0.5">Clasificación general de los equipos</p>
          </div>
        </div>

        <div className="relative">
          <select
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer appearance-none pr-10"
            value={temporada_id}
            onChange={(e) => setTemporada_id(e.target.value)}
          >
            <option value="" disabled>Seleccionar Temporada</option>
            {temporadas.map(temp => (
              <option key={temp.id} value={temp.id}>{temp.nombre}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {Number(temporada_id) === 1 ? (
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-8 max-w-2xl mx-auto text-center backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-4 border border-orange-500/20">
            <Info className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Temporada de Amistosos</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Esta temporada se utiliza para partidos de práctica y no genera una tabla de posiciones oficial.
          </p>
          <div className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-500 px-4 py-2 rounded-xl text-xs font-bold">
            ¡Consulta el calendario para ver los resultados!
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/40 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-900">
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-16">Pos</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Equipo</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">PJ</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">G</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">P</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center hidden md:table-cell">PF</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center hidden md:table-cell">PC</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">DP</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-24">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {cargando ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-500 text-sm font-semibold">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      Cargando posiciones...
                    </td>
                  </tr>
                ) : tabla.length > 0 ? (
                  tabla.map((fila, index) => {
                    const isTopPosition = index < 3;
                    const posColor = index === 0 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : index === 1 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : index === 2 ? 'bg-slate-700/40 text-slate-300 border-slate-600/30' : '';

                    return (
                      <tr key={fila.id} className="hover:bg-slate-900/20 transition-colors group">
                        <td className="py-4 px-4 text-center">
                          {isTopPosition ? (
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black border ${posColor}`}>
                              {index + 1}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-500">{index + 1}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center p-0.5 overflow-hidden">
                              {fila.logo ? (
                                <img src={`http://localhost:5000${fila.logo}`} alt={fila.nombre} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <div className="text-xs">🏀</div>
                              )}
                            </div>
                            <a 
                              href={`/equipos/${fila.id}/detalle`} 
                              className="text-sm font-bold text-slate-200 group-hover:text-orange-500 transition-colors"
                            >
                              {fila.nombre}
                            </a>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-slate-300 font-semibold">{fila.pj}</td>
                        <td className="py-4 px-4 text-center text-sm text-emerald-400 font-semibold">{fila.g}</td>
                        <td className="py-4 px-4 text-center text-sm text-rose-400 font-semibold">{fila.p}</td>
                        <td className="py-4 px-4 text-center text-sm text-slate-400 font-medium hidden md:table-cell">{fila.pf}</td>
                        <td className="py-4 px-4 text-center text-sm text-slate-400 font-medium hidden md:table-cell">{fila.pc}</td>
                        <td className={`py-4 px-4 text-center text-sm font-semibold ${fila.dp > 0 ? 'text-emerald-500' : fila.dp < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {fila.dp > 0 ? `+${fila.dp}` : fila.dp}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block bg-orange-500/10 text-orange-500 font-extrabold text-sm px-3 py-1 rounded-lg border border-orange-500/10">
                            {fila.pts}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-500 text-sm font-medium">
                      <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                      No hay datos disponibles para esta temporada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Standings;