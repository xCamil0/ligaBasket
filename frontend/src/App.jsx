import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Tabla from './components/pages/tabla/Tabla';
import Scoreboard from './components/scoreboard/scoreboard';
import Navbar from './components/navbar/navbar';
import Equipos from './components/pages/equipos/equipos';
import DetalleEquipo from './components/pages/detalleEquipo/detalleEquipo';
import Pichichi from './components/pages/pichichi/pichichi';
import Partidos from './components/pages/partidos/partidos';
import DetallePartido from './components/pages/detallePartido/DetallePartido';
import Jugadores from './components/pages/jugadores/Jugadores';
import Admin from './components/pages/Admin/Admin';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Scoreboard />
              <Tabla />
            </>
          } />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/equipos/:id/detalle" element={<DetalleEquipo />} />
          <Route path="/pichichi" element={<Pichichi />} />
          <Route path="/partidos" element={<Partidos />} />
          <Route path="/partido/:id" element={<DetallePartido />} />
          <Route path="/jugadores" element={<Jugadores />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;