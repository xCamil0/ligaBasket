// src/components/Scoreboard/Scoreboard.jsx
import './Scoreboard.css';

const Scoreboard = ({ partidos }) => {
  return (
    <div className="ticker-container">
      {partidos.map((partido) => (
        <div key={partido.id} className="game-card">
          <div className="game-status">{partido.finalizado ? 'FINAL' : 'PRÓXIMO'}</div>
          <div className="team-row">
            <span>{partido.local_nombre}</span>
            <span className="score">{partido.puntos_local}</span>
          </div>
          <div className="team-row">
            <span>{partido.visitante_nombre}</span>
            <span className="score">{partido.puntos_visitante}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;