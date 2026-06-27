import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Calendar } from 'lucide-react';

const Equipos = () => {
    const [equipos, setEquipos] = useState([]);
    const [temporadas, setTemporadas] = useState([]);
    const [temporadaSeleccionada, setTemporadaSeleccionada] = useState(null);

    useEffect(() => {
        const cargarTemporadas = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/temporadas');
                const temporadasFiltradas = res.data.filter(temp => Number(temp.id) !== 1);
                setTemporadas(temporadasFiltradas);
            } catch (error) {
                console.error("Error al cargar las temporadas:", error);
            }
        };

        cargarTemporadas();
    }, []);

    useEffect(() => {
        const cargarEquipos = async () => {
            try {
                let url = 'http://localhost:5000/api/equipos';
                if (temporadaSeleccionada) {
                    url = `http://localhost:5000/api/equipos/por-temporada?temporada_id=${temporadaSeleccionada}`;
                }
                const res = await axios.get(url);

                if (res.data.data && Array.isArray(res.data.data)) {
                    setEquipos(res.data.data);
                } else if (Array.isArray(res.data)) {
                    setEquipos(res.data);
                } else {
                    setEquipos([]);
                }
            } catch (error) {
                console.error("Error al cargar los equipos:", error);
                setEquipos([]);
            }
        };

        cargarEquipos();
    }, [temporadaSeleccionada]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 pb-28 lg:pb-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Mobile Filters Dropdown */}
                <div className="lg:hidden w-full bg-slate-950/40 border border-slate-900 rounded-2xl p-4 mb-2 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>Filtrar por Temporada</span>
                    </div>
                    <div className="relative">
                        <select 
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none pr-10 cursor-pointer"
                            value={temporadaSeleccionada === null ? "" : temporadaSeleccionada}
                            onChange={(e) => setTemporadaSeleccionada(e.target.value === "" ? null : Number(e.target.value))}
                        >
                            <option value="">Todas las Temporadas</option>
                            {temporadas.map(temp => (
                                <option key={temp.id} value={temp.id}>{temp.nombre}</option>
                            ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Sidebar Izquierdo: Filtros */}
                <aside className="hidden lg:block w-64 shrink-0 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 h-fit backdrop-blur-md">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        Temporadas
                    </h2>
                    <ul className="space-y-1.5">
                        <li>
                            <button 
                                className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    temporadaSeleccionada === null 
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/10' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                }`}
                                onClick={() => setTemporadaSeleccionada(null)}
                            >
                                Todas
                            </button>
                        </li>
                        {temporadas.map(temp => (
                            <li key={temp.id}>
                                <button 
                                    className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-xl transition-all cursor-pointer truncate ${
                                        temporadaSeleccionada === temp.id 
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/10' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                    }`}
                                    onClick={() => setTemporadaSeleccionada(temp.id)}
                                >
                                    {temp.nombre}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Listado de Equipos */}
                <main className="flex-grow">
                    {equipos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {equipos.map((equipo) => (
                                <Link 
                                    to={`/equipos/${equipo.id}/detalle`} 
                                    key={equipo.id} 
                                    className="bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors pointer-events-none" />
                                    
                                    <div className="w-20 h-20 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center p-1 overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                                        {equipo.logo ? (
                                            <img src={`http://localhost:5000${equipo.logo}`} alt={equipo.nombre} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <div className="text-2xl">🏀</div>
                                        )}
                                    </div>
                                    <p className="text-sm font-extrabold text-slate-200 group-hover:text-orange-500 transition-colors line-clamp-1">{equipo.nombre}</p>
                                    <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-500 font-bold group-hover:text-slate-400 transition-colors">
                                        <span>Ficha de equipo</span>
                                        <svg className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-12 text-center text-slate-500 text-sm font-medium backdrop-blur-md">
                            <Shield className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                            No hay equipos registrados en esta temporada.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Equipos;
