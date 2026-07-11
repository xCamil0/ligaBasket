import { useState } from 'react';
import axios from 'axios';
import { X, LogIn, ShieldAlert } from 'lucide-react';

const LoginModal = ({ alCerrar, alIniciarSesionCorrecto }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [error, setError] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setEstaCargando(true);
    try {
      const respuesta = await axios.post('http://localhost:5000/api/auth/login', {
        username: usuario,
        password: contrasenia
      });
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('username', respuesta.data.username);
      alIniciarSesionCorrecto();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Error al iniciar sesión");
      }
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800/50 rounded-lg cursor-pointer" 
          onClick={alCerrar}
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-3 border border-orange-500/20">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Iniciar Sesión</h2>
          <p className="text-slate-400 text-xs mt-1">Acceso administrativo de la liga</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-center text-sm mb-5 flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium placeholder-slate-600"
              placeholder="Ej. admin"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Contraseña</label>
            <input
              type="password"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium placeholder-slate-700"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={estaCargando}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {estaCargando ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
