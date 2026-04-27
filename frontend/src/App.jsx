import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // 1. Creamos la "caja" para guardar los equipos (empieza como lista vacía [])
  const [equipos, setEquipos] = useState([]);

  // 2. Función que va al Backend
  const traerEquipos = async () => {
    try {
      // Usa la URL de tu backend (ej: localhost:4000)
      const respuesta = await axios.get('http://localhost:5000/api/equipos');
      setEquipos(respuesta.data); // Guardamos lo que llegó en nuestra caja
    } catch (error) {
      console.error("Error conectando con el back:", error);
    }
  };

  // 3. Ejecutar la función apenas se abra la app
  useEffect(() => {
    traerEquipos();
  }, []); // El [] vacío significa: "solo hazlo una vez al cargar"

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Mis Equipos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 4. Mapeamos (recorremos) la lista para mostrar cada equipo */}
        {equipos.map((equipo) => (
          <div key={equipo.id} className="p-4 bg-white shadow rounded-xl border-l-4 border-blue-500">
            <p className="font-bold text-lg">{equipo.nombre}</p>
            <p className="text-gray-500 text-sm">{equipo.estadio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;