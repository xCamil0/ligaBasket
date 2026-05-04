import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Standings from './components/pages/tabla/Tabla';
import Scoreboard from './components/scoreboard/scoreboard';
import Navbar from './components/navbar/navbar';
import Equipos from './components/pages/equipos/equipos';
import DetalleEquipo from './components/pages/detalleEquipo/detalleEquipo';

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
      </Routes>
    </Router>
  );
}

export default App;