import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const SelectorTema = () => {
  const [esClaro, setEsClaro] = useState(() => {
    return localStorage.getItem('tema') === 'claro';
  });

  useEffect(() => {
    if (esClaro) {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
      localStorage.setItem('tema', 'claro');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
      localStorage.setItem('tema', 'oscuro');
    }
  }, [esClaro]);

  return (
    <button
      onClick={() => setEsClaro(!esClaro)}
      className="fixed bottom-20 lg:bottom-6 right-6 z-50 p-3.5 rounded-full bg-slate-900 border border-slate-800 text-orange-500 hover:text-orange-600 shadow-xl shadow-black/25 hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
      aria-label="Cambiar tema"
      title={esClaro ? "Modo oscuro" : "Modo claro"}
    >
      {esClaro ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
};

export default SelectorTema;
