import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Star, Users } from 'lucide-react';
import Scoreboard from './scoreboard';
import Standings from './Tabla';

/* ─── Home Page ─── */
const Home = () => {
  const navegar = useNavigate();
  const [pichichi, setPichichi] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaActual, setTemporadaActual] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const inicializar = async () => {
      try {
        const respuestaTemporadas = await axios.get('http://localhost:5000/api/temporadas');
        setTemporadas(respuestaTemporadas.data);

        const ultima = respuestaTemporadas.data.find(t => t.nombre?.includes('2026')) ?? respuestaTemporadas.data[respuestaTemporadas.data.length - 1];
        if (ultima && Number(ultima.id) !== 1) {
          setTemporadaActual(ultima);
          const respuestaPichichi = await axios.get('http://localhost:5000/api/stats/pichichi', {
            params: { temporada_id: ultima.id }
          });
          setPichichi(respuestaPichichi.data);
        }
      } catch (e) {
        console.error('Error cargando datos home:', e);
      } finally {
        setCargando(false);
      }
    };
    inicializar();
  }, []);

  const lider = pichichi[0] || null;
  const top5 = pichichi.slice(1, 5);

  return (
    <div className="w-full">

      {/* ── ScoreBoard (existente, sin tocar) ── */}
      <Scoreboard />

      {/* ── HERO ── */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mt-6">
        <div className="relative rounded-3xl overflow-hidden border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-2xl min-h-[320px] md:min-h-[380px] flex items-center">
          {/* Background glows */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

          {/* Player image (right) */}
          <img
            src="/images.jpg"
            alt="Jugador de baloncesto"
            className="absolute right-0 top-0 h-full w-auto max-w-[55%] object-cover object-top opacity-90 select-none"
            style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)' }}
          />

          {/* Content (left) */}
          <div className="relative z-20 px-8 md:px-12 py-10 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">Temporada en curso</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-1">
              El basket
            </h1>
            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-5"
              style={{ background: 'var(--brand-orange-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              nos une
            </h2>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
              Sigue toda la emoción de la temporada, consulta resultados, descubre estadísticas y apoya a tu equipo favorito.
            </p>

            <button
              onClick={() => navigate('/equipos')}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Users className="w-4 h-4" />
              Ver equipos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── TABLA DE POSICIONES (existente, sin tocar) ── */}
      <Standings />

      {/* ── BANNER PROMOCIONAL ── */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mt-2 mb-6">
        <div className="relative rounded-3xl overflow-hidden border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-2xl min-h-[260px] md:min-h-[300px] flex items-center">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-orange-500/8 rounded-full blur-[80px] pointer-events-none" />

          {/* Basketball image (right) */}
          <img
            src="/basketball_banner.png"
            alt="Balón de baloncesto"
            className="absolute right-0 top-0 h-full w-auto max-w-[50%] object-cover object-center opacity-85 select-none"
            style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0) 100%)' }}
          />

          {/* Content */}
          <div className="relative z-20 px-8 md:px-12 py-10 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-1">
              Vive la pasión
            </h2>
            <h3 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-5"
              style={{ background: 'var(--brand-orange-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              del basket
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-7 max-w-sm">
              No te pierdas ningún partido de la temporada y vive toda la emoción de la liga.
            </p>
            <button
              onClick={() => navigate('/partidos')}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              Explorar partidos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
