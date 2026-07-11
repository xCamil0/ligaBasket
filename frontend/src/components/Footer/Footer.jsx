import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: '- Inicio', to: '/' },
    { label: '- Equipos', to: '/equipos' },
    { label: '- Partidos', to: '/partidos' },
    { label: '- Jugadores', to: '/jugadores' },
    { label: '- Pichichi', to: '/pichichi' },
  ];

  const socialLinks = [
    { label: '- Instagram', to: 'https://www.instagram.com/xca._.mil0/' },
    { label: '- Twitter/X', to: '' },
    { label: '- Facebook', to: '' },
    { label: '- YouTube', to: '' },
  ];

  return (
    <footer className="w-full border-t border-slate-900 mt-16 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-orange-500 to-orange-600 flex items-center justify-center p-0.5 shadow-md shadow-orange-500/10">
                <img src="http://localhost:5000/uploads/logo_basket.png" alt="Logo" className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <span className="text-white font-black text-base tracking-tight">NEXTGEN</span>
                <span className="text-orange-500 font-black text-base tracking-tight ml-1">LEAGUE</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-48">
              La nueva generación del basket. Pasión, talento y competencia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest">
              Enlaces rápidos
            </h4>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-slate-400 hover:text-orange-500 text-sm font-medium transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social / Follow */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest">
              Síguenos
            </h4>
            <ul className="flex flex-col gap-2.5">
              {socialLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-slate-400 hover:text-orange-500 text-sm font-medium transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest">
              Información
            </h4>
            <div className="flex flex-col gap-2">
              <p className="text-slate-400 text-xs">
                <span className="text-slate-300 font-semibold">Temporada actual</span>
              </p>
              <p className="text-slate-400 text-xs">© {currentYear} NextGen League</p>
              <p className="text-slate-400 text-xs">Todos los derechos reservados.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © {currentYear} NextGen League — Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
