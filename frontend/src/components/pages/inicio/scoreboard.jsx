import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, ChevronRight, Activity } from 'lucide-react';

const Scoreboard = () => {
  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [esJugados, setEsJugados] = useState(false);

  useEffect(() => {
    const obtenerInfoEquipos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/equipos');
        setEquipos(res.data);
      } catch (error) {
        console.error("Error al obtener los equipos:", error);
      }
    };

    const obtenerPartidos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/partidos');
        const todosLosPartidos = res.data;
        const hoyStr = new Date().toISOString().split('T')[0];

        // Separar en próximos (incluye hoy si no ha finalizado) y jugados
        const proximos = todosLosPartidos.filter(p => {
          const pStr = p.fecha ? p.fecha.split('T')[0] : '';
          return !p.finalizado && pStr >= hoyStr;
        });

        const jugados = todosLosPartidos.filter(p => {
          const pStr = p.fecha ? p.fecha.split('T')[0] : '';
          return p.finalizado || pStr < hoyStr;
        });

        if (proximos.length > 0) {
          setPartidos(proximos);
          setEsJugados(false);
        } else {
          // Si no hay próximos, mostramos los últimos 10 jugados
          const ultimosJugados = jugados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 10);
          setPartidos(ultimosJugados);
          setEsJugados(true);
        }
      } catch (error) {
        console.error("Error al obtener los partidos:", error);
      }
    };

    obtenerPartidos();
    obtenerInfoEquipos();
  }, []);

  const agruparPartidosPorFecha = (games) => {
    const groups = {};
    games.forEach(game => {
      const dateStr = game.fecha ? game.fecha.split('T')[0] : 'TBD';
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(game);
    });
    
    return Object.entries(groups).sort((a, b) => {
      const fechaA = new Date(a[0]);
      const fechaB = new Date(b[0]);
      return esJugados ? fechaB - fechaA : fechaA - fechaB;
    });
  };

  const obtenerNombreDia = (dateString) => {
    if (dateString === 'TBD') return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-CO', { weekday: 'short' }).toUpperCase().replace('.', '');
  };

  const obtenerNombreMes = (dateString) => {
    if (dateString === 'TBD') return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase().replace('.', '');
  };

  const obtenerNumeroDia = (dateString) => {
    if (dateString === 'TBD') return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-CO', { day: '2-digit' });
  };

  const partidosAgrupadosPorFecha = agruparPartidosPorFecha(partidos);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6">
      <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-900/60 relative z-10">
          <span className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            {esJugados ? 'Últimos Resultados' : 'Próximos Partidos'}
          </span>
          <a 
            href="/partidos" 
            className="text-slate-400 hover:text-white transition-all text-xs font-bold flex items-center gap-1 group/link"
          >
            Ver todos 
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover/link:text-white transition-colors group-hover/link:translate-x-0.5 duration-200" />
          </a>
        </div>

        {partidosAgrupadosPorFecha.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800 relative z-10">
            {partidosAgrupadosPorFecha.map(([date, games]) => (
              <div key={date} className="flex gap-4 items-center shrink-0">
                <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-850 rounded-2xl p-3 w-16 h-22 text-center shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider mb-0.5">{obtenerNombreDia(date)}</span>
                  <span className="text-sm font-black text-white leading-tight">{obtenerNumeroDia(date)}</span>
                  <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">{obtenerNombreMes(date)}</span>
                </div>
                
                <div className="flex gap-3">
                  {games.map((partido) => {
                    const equipoLocal = equipos.find((e) => e.id === partido.id_equipo_local);
                    const equipoVisitante = equipos.find((e) => e.id === partido.id_equipo_visitante);

                    const formatTime = (isoString) => {
                      if (!isoString) return 'TBD';
                      const d = new Date(isoString);
                      return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
                    };

                    return (
                      <div
                        key={partido.id}
                        className="bg-slate-900/60 hover:bg-slate-900 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-4 w-60 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-0.5 cursor-pointer group"
                        onClick={() => window.location.href = `/partido/${partido.id}`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                            partido.finalizado 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/10' 
                              : 'bg-orange-500/10 text-orange-500 border border-orange-500/10'
                          }`}>
                            {partido.finalizado ? 'Finalizado' : formatTime(partido.fecha)}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 truncate">
                              {equipoLocal?.logo ? (
                                <img 
                                  src={`http://localhost:5000${equipoLocal.logo}`} 
                                  alt={equipoLocal.nombre} 
                                  className="w-6 h-6 rounded-full object-cover bg-slate-950 border border-slate-800 flex-shrink-0" 
                                />
                              ) : <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-600 flex-shrink-0">🏀</div>}
                              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors truncate">
                                {equipoLocal ? equipoLocal.nombre : 'Cargando...'}
                              </span>
                            </div>
                            <span className={`text-xs font-bold ${partido.finalizado ? 'text-white' : 'text-slate-500'}`}>
                              {partido.finalizado && partido.puntos_local !== null ? partido.puntos_local : '-'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 truncate">
                              {equipoVisitante?.logo ? (
                                <img 
                                  src={`http://localhost:5000${equipoVisitante.logo}`} 
                                  alt={equipoVisitante.nombre} 
                                  className="w-6 h-6 rounded-full object-cover bg-slate-950 border border-slate-800 flex-shrink-0" 
                                />
                              ) : <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-600 flex-shrink-0">🏀</div>}
                              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors truncate">
                                {equipoVisitante ? equipoVisitante.nombre : 'Cargando...'}
                              </span>
                            </div>
                            <span className={`text-xs font-bold ${partido.finalizado ? 'text-white' : 'text-slate-500'}`}>
                              {partido.finalizado && partido.puntos_visitante !== null ? partido.puntos_visitante : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 text-xs font-medium">
            <Calendar className="w-8 h-8 text-slate-700 mb-2" />
            No hay partidos programados
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;