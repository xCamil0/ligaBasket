import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Standings from './components/pages/tabla/Tabla';
import Scoreboard from './components/scoreboard/scoreboard';
import Navbar from './components/navbar/navbar';
import Equipos from './components/pages/equipos/equipos';
import DetalleEquipo from './components/pages/detalleEquipo/detalleEquipo';
import Pichichi from './components/pages/pichichi/pichichi';
import Partidos from './components/pages/partidos/partidos';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <Scoreboard />
            <Standings />
          </>
        } />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/equipos/:id/detalle" element={<DetalleEquipo />} />
        <Route path="/pichichi" element={<Pichichi />} />
        <Route path="/partidos" element={<Partidos />} />
      </Routes>
    </Router>
  );
}

export default App;