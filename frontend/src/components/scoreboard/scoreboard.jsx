import { useState, useEffect } from 'react';
import axios from 'axios';
import './scoreboard.css';

const Scoreboard = () => {

  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [esJugados, setEsJugados] = useState(false);

  useEffect(() => {

    const obtenerInfoEquipos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/equipos');
        const equipos = res.data;
        setEquipos(equipos);
      } catch (error) {
        console.error("Error al obtener los equipos:", error);
      }
    }

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
    <div className="marcador-general">
      <div className="marcador-cabecera">
        <span className="marcador-titulo">
          {esJugados ? 'ÚLTIMOS RESULTADOS' : 'PRÓXIMOS PARTIDOS'}
        </span>
        <a href="/partidos" className="ver-todos-link">
          Ver todos <svg className="ver-todos-arrow" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>
      <div className="marcador-container">
        {partidosAgrupadosPorFecha.map(([date, games]) => (
          <div key={date} className="grupo-fecha">
            <div className="columna-fecha">
              <span className="nombre-dia">{obtenerNombreDia(date)}</span>
              <span className="nombre-mes">{obtenerNombreMes(date)}</span>
              <span className="numero-dia">{obtenerNumeroDia(date)}</span>
            </div>
            <div className="grupo-tarjetas">
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
                    className="tarjeta-partido-rediseño"
                    onClick={() => window.location.href = `/partido/${partido.id}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="partido-hora">
                      {partido.finalizado ? 'FINAL' : formatTime(partido.fecha)}
                    </div>
                    
                    <div className="partido-equipo-fila">
                      <div className="partido-equipo-izquierda">
                        {equipoLocal ? (
                          <img 
                            src={`http://localhost:5000${equipoLocal.logo}`} 
                            alt={equipoLocal.nombre} 
                            className="partido-equipo-logo" 
                          />
                        ) : <div className="partido-equipo-logo-placeholder" />}
                        <span className="partido-equipo-nombre">
                          {equipoLocal ? equipoLocal.nombre : 'Cargando...'}
                        </span>
                      </div>
                      <span className="partido-equipo-puntos">
                        {partido.finalizado && partido.puntos_local !== null ? partido.puntos_local : '-'}
                      </span>
                    </div>

                    <div className="partido-equipo-fila">
                      <div className="partido-equipo-izquierda">
                        {equipoVisitante ? (
                          <img 
                            src={`http://localhost:5000${equipoVisitante.logo}`} 
                            alt={equipoVisitante.nombre} 
                            className="partido-equipo-logo" 
                          />
                        ) : <div className="partido-equipo-logo-placeholder" />}
                        <span className="partido-equipo-nombre">
                          {equipoVisitante ? equipoVisitante.nombre : 'Cargando...'}
                        </span>
                      </div>
                      <span className="partido-equipo-puntos">
                        {partido.finalizado && partido.puntos_visitante !== null ? partido.puntos_visitante : '-'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;