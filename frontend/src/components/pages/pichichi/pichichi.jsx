import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Info, AlertTriangle, User } from 'lucide-react';

const Pichichi = () => {
    const [temporadas, setTemporadas] = useState([]);
    const [temporadaId, setTemporadaId] = useState("");
    const [pichichi, setPichichi] = useState([]);
    const [cargando, setCargando] = useState(false);

    // Cargar temporadas y seleccionar la más reciente
    useEffect(() => {
        const cargarTemporadas = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/temporadas');
                setTemporadas(res.data);

                if (res.data.length > 0) {
                    setTemporadaId(res.data[res.data.length - 1].id);
                }
            } catch (error) {
                console.error("Error cargando temporadas:", error);
            }
        };
        cargarTemporadas();
    }, []);

    // Obtener datos del pichichi cuando cambia la temporada
    useEffect(() => {
        if (!temporadaId || Number(temporadaId) === 1) {
            setPichichi([]);
            return;
        }

        const obtenerDatosPichichi = async () => {
            try {
                setCargando(true);
                const res = await axios.get('http://localhost:5000/api/stats/pichichi', {
                    params: { temporada_id: temporadaId }
                });
                setPichichi(res.data);
            } catch (error) {
                console.error("Error al traer el pichichi:", error);
                setPichichi([]);
            } finally {
                setCargando(false);
            }
        };

        obtenerDatosPichichi();
    }, [temporadaId]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 pb-28 lg:pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-900 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Pichichi</h1>
                        <p className="text-slate-400 text-xs mt-0.5">Máximos anotadores del torneo</p>
                    </div>
                </div>

                <div className="relative">
                    <select
                        className="w-full sm:w-auto bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer appearance-none pr-10"
                        value={temporadaId}
                        onChange={(e) => setTemporadaId(e.target.value)}
                    >
                        <option value="" disabled>Seleccionar Temporada</option>
                        {temporadas.map(temp => (
                            <option key={temp.id} value={temp.id}>
                                {temp.nombre}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            {Number(temporadaId) === 1 ? (
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-8 max-w-2xl mx-auto text-center backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-4 border border-orange-500/20">
                        <Info className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Temporada de Amistosos</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        Esta temporada se utiliza para partidos de práctica y no genera un pichichi oficial.
                    </p>
                    <div className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-500 px-4 py-2 rounded-xl text-xs font-bold">
                        ¡Consulta las otras temporadas para ver los resultados!
                    </div>
                </div>
            ) : (
                <div className="bg-slate-950/40 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 border-b border-slate-900">
                                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-20">Pos</th>
                                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Jugador</th>
                                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Equipo</th>
                                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-32">Puntos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/60">
                                {cargando ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-500 text-sm font-semibold">
                                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                            Cargando líderes de anotación...
                                        </td>
                                    </tr>
                                ) : pichichi.length > 0 ? (
                                    pichichi.map((fila, index) => {
                                        const isTopPosition = index < 3;
                                        const posColor = index === 0 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : index === 1 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : index === 2 ? 'bg-slate-700/40 text-slate-300 border-slate-600/30' : '';

                                        return (
                                            <tr key={fila.id} className="hover:bg-slate-900/20 transition-colors group">
                                                <td className="py-4 px-4 text-center">
                                                    {isTopPosition ? (
                                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black border ${posColor}`}>
                                                            {index + 1}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-500">{index + 1}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                                                            <User className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-200 group-hover:text-orange-500 transition-colors">
                                                            {fila.nombre_apellido}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center text-sm text-slate-300 font-semibold">{fila.nombre_equipo}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-block bg-orange-500/10 text-orange-500 font-black text-sm px-3 py-1 rounded-lg border border-orange-500/10">
                                                        {fila.total_puntos} pts
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-500 text-sm font-medium">
                                            <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                                            No hay datos disponibles para esta temporada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pichichi;