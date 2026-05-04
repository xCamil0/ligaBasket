import { useState, useEffect } from 'react';
import axios from 'axios';
import './Scoreboard.css';

const Scoreboard = () => {

  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState([]);

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
        const partidosFiltrados = res.data.filter((partido) => partido.temporada_id === 4);
        setPartidos(partidosFiltrados);
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
    // Convert to array and sort by date
    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  };

  const obtenerNombreDia = (dateString) => {
    if (dateString === 'TBD') return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-CO', { weekday: 'short' }).toUpperCase();
  };

  const obtenerNombreMes = (dateString) => {
    if (dateString === 'TBD') return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase();
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
      <div className="marcador-container">
        {partidosAgrupadosPorFecha.map(([date, games]) => (
          <div key={date} className="grupo-fecha">
            <div className="columna-fecha">
              <span className="nombre-dia">{obtenerNombreDia(date)}</span>
              <span className="nombre-mes">{obtenerNombreMes(date)}</span>
              <span className="numero-dia">{obtenerNumeroDia(date)}</span>
            </div>
            {games.map((partido) => {
              const equipoLocal = equipos.find((e) => e.id === partido.id_equipo_local);
              const equipoVisitante = equipos.find((e) => e.id === partido.id_equipo_visitante);

              // Helper for formatting time from ISO date string
              const formatTime = (isoString) => {
                if (!isoString) return 'TBD';
                const d = new Date(isoString);
                return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
              };

              return (
                <div
                  key={partido.id}
                  className="tarjeta-partido"
                  onClick={() => window.location.href = `/partido/${partido.id}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="estado-partido">
                    {partido.finalizado ? 'FINAL' : formatTime(partido.fecha)}
                  </div>
                  <div className="fila-equipo">
                    <span className="nombre-equipo">
                      {equipoLocal ? <span className="logo-equipo"><img src={`http://localhost:5000${equipoLocal.logo}`} alt={`${equipoLocal.nombre} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></span> : null}
                      {equipoLocal ? equipoLocal.nombre : 'Cargando...'}
                    </span>
                    <span className="puntos">{partido.puntos_local}</span>
                  </div>
                  <div className="fila-equipo">
                    <span className="nombre-equipo">
                      {equipoVisitante ? <span className="logo-equipo"><img src={`http://localhost:5000${equipoVisitante.logo}`} alt={`${equipoVisitante.nombre} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></span> : null}
                      {equipoVisitante ? equipoVisitante.nombre : 'Cargando...'}
                    </span>
                    <span className="puntos">{partido.puntos_visitante}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;