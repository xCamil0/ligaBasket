import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { 
  CalendarRange, 
  Users, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  Check, 
  Search, 
  Lock, 
  Trophy, 
  UserPlus, 
  Info,
  Calendar,
  Clock,
  MapPin,
  HelpCircle,
  TrendingUp,
  X,
  AlertTriangle,
  Shield
} from 'lucide-react';

const Admin = () => {
    const { showNotification, confirm } = useNotification();
    const [token] = useState(localStorage.getItem('token'));
    const [currentAdmin] = useState(localStorage.getItem('username'));
    const [activeTab, setActiveTab] = useState('temporadas');

    // Datos generales
    const [temporadas, setTemporadas] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [equiposParticipantes, setEquiposParticipantes] = useState([]);
    const [partidos, setPartidos] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [jugadores, setJugadores] = useState([]); 

    // Filtros de búsqueda
    const [searchAdminQuery, setSearchAdminQuery] = useState('');
    const [searchTeamQuery, setSearchTeamQuery] = useState('');

    // Modales y formularios
    const [modalActivo, setModalActivo] = useState(null);
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [resumenTemporada, setResumenTemporada] = useState(null);
    const [modalFinalizarTemporadaActivo, setModalFinalizarTemporadaActivo] = useState(false);
    const [cargandoResumen, setCargandoResumen] = useState(false);

    // Estados de los Formularios
    const [formTemporada, setFormTemporada] = useState({
        id: '',
        nombre: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    const [formAdmin, setFormAdmin] = useState({
        username: '',
        password: '',
        Email: ''
    });

    // Paginación y Filtros de nuevos módulos
    const [pageTeam, setPageTeam] = useState(1);

    const [searchPlayerQuery, setSearchPlayerQuery] = useState('');
    const [pagePlayer, setPagePlayer] = useState(1);
    const [filtroJugadorEquipo, setFiltroJugadorEquipo] = useState('todos');

    const [filterMatchSeason, setFilterMatchSeason] = useState('');
    const [filterMatchJornada, setFilterMatchJornada] = useState('');
    const [searchMatchQuery, setSearchMatchQuery] = useState('');
    const [pageMatch, setPageMatch] = useState(1);

    // Estados de Formularios con Steppers
    const [formTeam, setFormTeam] = useState({
        id: '',
        nombre: '',
        entrenador: '',
        estadio: '',
        temporada_id: 1,
        foto: null,
        fotoUrl: ''
    });
    const [modalEquipoActivo, setModalEquipoActivo] = useState(null);
    const [teamStep, setTeamStep] = useState(1);
    const [nuevoEquipoId, setNuevoEquipoId] = useState(null);
    const [asignandoJugadorId, setAsignandoJugadorId] = useState(null);

    const [formPlayer, setFormPlayer] = useState({
        id: '',
        nombre_apellido: '',
        categoria: 'Profesional',
        dorsal: '',
        equipo_id: '',
        temporada_id: ''
    });
    const [modalJugadorActivo, setModalJugadorActivo] = useState(null);
    const [playerStep, setPlayerStep] = useState(1);

    const [formMatch, setFormMatch] = useState({
        id: '',
        temporada_id: '',
        jornada: '',
        id_equipo_local: '',
        id_equipo_visitante: '',
        fecha: '',
        horario: '',
        lugar: '',
        puntos_local: '',
        puntos_visitante: ''
    });
    const [modalPartidoActivo, setModalPartidoActivo] = useState(null);
    const [matchStep, setMatchStep] = useState(1);

    // Estados para finalizar partidos
    const [modalFinalizarActivo, setModalFinalizarActivo] = useState(false);
    const [partidoFinalizar, setPartidoFinalizar] = useState(null);
    const [finalizarStep, setFinalizarStep] = useState(1);
    const [anotaciones, setAnotaciones] = useState([]);
    const [jugadoresPartido, setJugadoresPartido] = useState([]);
    const [puntosLocal, setPuntosLocal] = useState('');
    const [puntosVisitante, setPuntosVisitante] = useState('');

    const temporadaActiva = temporadas.find(t => t.actual);
    const temporadaActivaId = temporadaActiva?.id || '';
    const temporadaSeleccionadaObjeto = temporadas.find(t => t.id == temporadaActivaId);
    const temporadaFinalizada = temporadaSeleccionadaObjeto?.finalizada === true;
    const isFormTemporadaFinalizada = formTemporada.id ? (temporadas.find(t => t.id == formTemporada.id)?.finalizada === true) : false;
    const isSelectedSeasonFinalized = filterMatchSeason ? (temporadas.find(t => t.id == filterMatchSeason)?.finalizada === true) : false;

    // Cargar datos iniciales
    const cargarTemporadas = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/temporadas');
            setTemporadas(res.data);
        } catch (error) {
            console.error("Error al cargar temporadas:", error);
        }
    }, []);

    const cargarEquipos = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/equipos');
            setEquipos(res.data);
        } catch (error) {
            console.error("Error al cargar equipos:", error);
        }
    }, []);

    const cargarAdmins = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5000/api/auth/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAdmins(res.data);
        } catch (error) {
            console.error("Error al cargar administradores:", error);
        }
    }, [token]);

    const cargarJugadores = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5000/api/jugadores', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setJugadores(res.data);
        } catch (error) {
            console.error("Error al cargar jugadores:", error);
        }
    }, [token]);


    // Efecto de carga inicial
    useEffect(() => {
        const cargarInicial = async () => {
            await cargarTemporadas();
            await cargarEquipos();
            await cargarAdmins();
            await cargarJugadores();
        };
        cargarInicial();
    }, [cargarTemporadas, cargarEquipos, cargarAdmins, cargarJugadores]);

    // Cargar equipos participantes y partidos cuando cambia la temporada activa
    useEffect(() => {
        if (!temporadaActivaId) return;

        const cargarDatosTemporada = async () => {
            try {
                const resEquipos = await axios.get(
                    `http://localhost:5000/api/temporadas/${temporadaActivaId}/equipos`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setEquiposParticipantes(resEquipos.data);

                const resPartidos = await axios.get('http://localhost:5000/api/partidos', {
                    params: { temporada_id: temporadaActivaId }
                });
                setPartidos(resPartidos.data);
            } catch (error) {
                console.error("Error al cargar datos de la temporada:", error);
                setEquiposParticipantes([]);
                setPartidos([]);
            }
        };

        cargarDatosTemporada();
    }, [temporadaActivaId, token]);

    // Pre-rellenar formulario cuando cambia la temporada activa
    useEffect(() => {
        if (!temporadaActivaId) return; 

        const temp = temporadas.find(t => t.id === Number(temporadaActivaId));
        if (temp) {
            setFormTemporada({
                id: temp.id,
                nombre: temp.nombre,
                fecha_inicio: temp.fecha_inicio ? temp.fecha_inicio.split('T')[0] : '',
                fecha_fin: temp.fecha_fin ? temp.fecha_fin.split('T')[0] : ''
            });
        }
    }, [temporadaActivaId, temporadas]);

    // Cambiar la temporada actual
    const handleCambiarTemporadaActiva = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/temporadas/actual/${id}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            cargarTemporadas();
            cargarJugadores();
        } catch (error) {
            console.error("Error al establecer temporada actual:", error);
            showNotification("Error al establecer la temporada como activa", "error");
        }
    };

    // Crear o editar una temporada
    const handleSubmitTemporada = async (e) => {
        e.preventDefault();

        // Validar que fecha_inicio < fecha_fin
        const inicio = new Date(formTemporada.fecha_inicio);
        const fin = new Date(formTemporada.fecha_fin);
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            showNotification("El formato de las fechas no es válido.", "error");
            return;
        }
        if (inicio >= fin) {
            showNotification("La fecha de inicio debe ser anterior a la fecha de finalización.", "warning");
            return;
        }

        // Validar duración mínima de 5 meses (~150 días)
        const diffMs = fin - inicio;
        const diffDias = diffMs / (1000 * 60 * 60 * 24);
        if (diffDias < 150) {
            showNotification("La temporada debe durar al menos 5 meses.", "warning");
            return;
        }

        try {
            if (formTemporada.id) {
                // Editar existente
                await axios.put(`http://localhost:5000/api/temporadas/${formTemporada.id}`, {
                    nombre: formTemporada.nombre,
                    fecha_inicio: formTemporada.fecha_inicio,
                    fecha_fin: formTemporada.fecha_fin
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Temporada actualizada correctamente", "success");
            } else {
                // Crear nueva
                await axios.post('http://localhost:5000/api/temporadas', {
                    nombre: formTemporada.nombre,
                    fecha_inicio: formTemporada.fecha_inicio,
                    fecha_fin: formTemporada.fecha_fin
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Temporada creada correctamente", "success");
            }
            setFormTemporada({ id: '', nombre: '', fecha_inicio: '', fecha_fin: '' });
            cargarTemporadas();
        } catch (error) {
            console.error("Error en formulario temporada:", error);
            showNotification(error.response?.data?.error || "Error al procesar la temporada", "error");
        }
    };

    // Eliminar una temporada
    const handleEliminarTemporada = async (id) => {
        const confirmed = await confirm("¿Eliminar Temporada?", "¿Seguro que deseas eliminar esta temporada? Se borrarán todos los partidos y asignaciones relacionadas.");
        if (!confirmed) return;
        try {
            await axios.delete(`http://localhost:5000/api/temporadas/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification("Temporada eliminada correctamente", "success");
            cargarTemporadas();
        } catch (error) {
            console.error("Error al eliminar temporada:", error);
            showNotification(error.response?.data?.error || "Error al eliminar la temporada", "error");
        }
    };

    // Cargar resumen de temporada y abrir modal de confirmación
    const handleAbrirConfirmarFinalizar = async () => {
        if (!temporadaActivaId) return;
        try {
            setCargandoResumen(true);
            setModalFinalizarTemporadaActivo(true);
            const res = await axios.get(`http://localhost:5000/api/temporadas/${temporadaActivaId}/resumen`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setResumenTemporada(res.data);
        } catch (error) {
            console.error("Error al obtener resumen de la temporada:", error);
            showNotification("Error al obtener el resumen de la temporada", "error");
            setModalFinalizarTemporadaActivo(false);
        } finally {
            setCargandoResumen(false);
        }
    };

    // Finalizar la temporada actual
    const handleFinalizarTemporada = async () => {
        if (!temporadaActivaId) return;
        try {
            await axios.put(`http://localhost:5000/api/temporadas/${temporadaActivaId}/finalizar`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification("Temporada finalizada correctamente", "success");
            setModalFinalizarTemporadaActivo(false);
            cargarTemporadas();
        } catch (error) {
            console.error("Error al finalizar la temporada:", error);
            showNotification(error.response?.data?.error || "Error al finalizar la temporada", "error");
        }
    };

    // Reabrir la temporada actual
    const handleReabrirTemporada = async () => {
        if (!temporadaActivaId) return;
        const confirmado = await confirm("¿Reabrir Temporada?", "¿Seguro que deseas reabrir esta temporada? Se volverán a permitir modificaciones, fixtures, fichajes y partidos.");
        if (!confirmado) return;
        try {
            await axios.put(`http://localhost:5000/api/temporadas/${temporadaActivaId}/reabrir`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification("Temporada reabierta correctamente", "success");
            cargarTemporadas();
        } catch (error) {
            console.error("Error al reabrir la temporada:", error);
            showNotification(error.response?.data?.error || "Error al reabrir la temporada", "error");
        }
    };

    // Asignar / remover equipos
    const handleGuardarEquiposAsignados = async (equiposSeleccionados) => {
        try {
            const idsIniciales    = equiposParticipantes.map(eq => eq.id);
            const equiposAAgregar = equiposSeleccionados.filter(id => !idsIniciales.includes(id));
            const equiposARemover = idsIniciales.filter(id => !equiposSeleccionados.includes(id));

            if (equiposAAgregar.length === 0 && equiposARemover.length === 0) {
                showNotification("No se realizaron cambios en los equipos.", "info");
                setModalActivo(null);
                return;
            }

            const promesas = [];

            if (equiposAAgregar.length > 0) {
                promesas.push(
                    axios.post('http://localhost:5000/api/temporadas/equipos', {
                        temporada_id: temporadaActivaId,
                        equipos_ids: equiposAAgregar
                    }, { headers: { 'Authorization': `Bearer ${token}` } })
                );
            }

            if (equiposARemover.length > 0) {
                promesas.push(
                    axios.delete('http://localhost:5000/api/temporadas/equipos', {
                        headers: { 'Authorization': `Bearer ${token}` },
                        data: {
                            temporada_id: temporadaActivaId,
                            equipos_ids: equiposARemover
                        }
                    })
                );
            }

            await Promise.all(promesas);

            const partes = [];
            if (equiposAAgregar.length > 0) partes.push(`${equiposAAgregar.length} agregado(s)`);
            if (equiposARemover.length > 0) partes.push(`${equiposARemover.length} removido(s)`);
            showNotification(`Equipos actualizados: ${partes.join(', ')}.`, "success");

            setModalActivo(null);

            const resEquipos = await axios.get(
                `http://localhost:5000/api/temporadas/${temporadaActivaId}/equipos`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setEquiposParticipantes(resEquipos.data);

        } catch (error) {
            console.error("Error al actualizar equipos:", error);
            showNotification(error.response?.data?.error || "Hubo un error al actualizar los equipos.", "error");
        }
    };

    // Generar calendario
    const handleGenerarCalendario = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/calendario/generar', {
                temporada_id: temporadaActivaId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification(res.data.mensaje || "Calendario generado con éxito", "success");
            const resPartidos = await axios.get('http://localhost:5000/api/partidos', {
                params: { temporada_id: temporadaActivaId }
            });
            setPartidos(resPartidos.data);
        } catch (error) {
            console.error("Error al generar calendario:", error);
            showNotification(error.response?.data?.error || "Error al generar calendario. Verifique que tenga una cantidad par de equipos.", "error");
        }
    };

    const handleEliminarCalendario = async () => {
        const confirmed = await confirm("¿Eliminar Calendario?", "¿Seguro que deseas eliminar TODO el calendario de esta temporada?");
        if (!confirmed) return;
        try {
            const res = await axios.delete('http://localhost:5000/api/calendario/eliminar', {
                headers: { 'Authorization': `Bearer ${token}` },
                data: { temporada_id: temporadaActivaId }
            });
            showNotification(res.data.mensaje || "Calendario eliminado", "success");
            setPartidos([]);
        } catch (error) {
            console.error("Error al eliminar calendario:", error);
            showNotification("Error al eliminar calendario", "error");
        }
    };

    // Administradores CRUD
    const handleSubmitAdmin = async (e) => {
        e.preventDefault();
        try {
            if (selectedAdminId) {
                await axios.put(`http://localhost:5000/api/auth/admin/${selectedAdminId}`, formAdmin, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Administrador actualizado correctamente", "success");
            } else {
                await axios.post('http://localhost:5000/api/auth/register', formAdmin, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Administrador registrado correctamente", "success");
            }
            setModalActivo(null);
            setFormAdmin({ username: '', password: '', Email: '' });
            setSelectedAdminId(null);
            cargarAdmins();
        } catch (error) {
            console.error("Error en formulario de administrador:", error);
            showNotification(error.response?.data?.error || "Error al procesar administrador", "error");
        }
    };

    const handleEliminarAdmin = async (id) => {
        const confirmed = await confirm("¿Eliminar Administrador?", "¿Seguro que deseas eliminar este administrador?");
        if (!confirmed) return;
        try {
            await axios.delete(`http://localhost:5000/api/auth/admin/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification("Administrador eliminado correctamente", "success");
            cargarAdmins();
        } catch (error) {
            console.error("Error al eliminar administrador:", error);
            showNotification(error.response?.data?.error || "Error al eliminar administrador", "error");
        }
    };

    const abrirEditarAdmin = (admin) => {
        setSelectedAdminId(admin.id);
        setFormAdmin({
            username: admin.username,
            password: '',
            Email: admin.Email || admin.email || ''
        });
        setModalActivo('editar_admin');
    };

    // ==========================================
    // LÓGICA DE GESTIÓN DE EQUIPOS (CRUD & STEPS)
    // ==========================================
    const abrirModalEquipo = (tipo, equipo = null) => {
        setModalEquipoActivo(tipo);
        setTeamStep(1);
        if (equipo) {
            setFormTeam({
                id: equipo.id,
                nombre: equipo.nombre || '',
                entrenador: equipo.entrenador || '',
                estadio: equipo.estadio || '',
                temporada_id: equipo.temporada_id || 1,
                foto: null,
                fotoUrl: equipo.logo ? `http://localhost:5000${equipo.logo}` : ''
            });
        } else {
            setFormTeam({
                id: '',
                nombre: '',
                entrenador: '',
                estadio: '',
                temporada_id: temporadaActivaId || 1,
                foto: null,
                fotoUrl: ''
            });
        }
    };

    const handleTeamInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'foto') {
            const file = files[0];
            setFormTeam(prev => ({
                ...prev,
                foto: file,
                fotoUrl: file ? URL.createObjectURL(file) : ''
            }));
        } else {
            setFormTeam(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmitEquipo = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('nombre', formTeam.nombre);
        data.append('entrenador', formTeam.entrenador);
        data.append('estadio', formTeam.estadio);
        if (formTeam.temporada_id) data.append('temporada_id', formTeam.temporada_id);
        if (formTeam.foto) data.append('foto', formTeam.foto);

        try {
            if (modalEquipoActivo === 'crear') {
                const res = await axios.post('http://localhost:5000/api/equipos', data, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Equipo creado correctamente", "success");
                // Recargar datos y avanzar al paso 4 (agregar jugadores)
                await cargarEquipos();
                await cargarJugadores();
                if (formTeam.temporada_id === temporadaActivaId) {
                    const resEquipos = await axios.get(
                        `http://localhost:5000/api/temporadas/${temporadaActivaId}/equipos`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    setEquiposParticipantes(resEquipos.data);
                }
                // Guardar el ID del equipo recién creado para asignaciones
                setNuevoEquipoId(res.data?.equipoId || null);
                setTeamStep(4);
            } else {
                await axios.put(`http://localhost:5000/api/equipos/${formTeam.id}`, data, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Equipo actualizado correctamente", "success");
                setModalEquipoActivo(null);
                cargarEquipos();
                if (formTeam.temporada_id === temporadaActivaId) {
                    const resEquipos = await axios.get(
                        `http://localhost:5000/api/temporadas/${temporadaActivaId}/equipos`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    setEquiposParticipantes(resEquipos.data);
                }
            }
        } catch (error) {
            console.error("Error al guardar equipo:", error);
            showNotification(error.response?.data?.error || "Error al procesar el equipo", "error");
        }
    };

    const handleAsignarAgenteLibre = async (jugadorId) => {
        if (!nuevoEquipoId) return;
        setAsignandoJugadorId(jugadorId);
        try {
            await axios.post('http://localhost:5000/api/equipos/fichar', {
                jugador_id: jugadorId,
                equipo_id: nuevoEquipoId,
                temporada_id: parseInt(temporadaActivaId, 10)
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification("Jugador agregado al equipo", "success");
            await cargarJugadores();
        } catch (error) {
            showNotification(error.response?.data?.error || "Error al fichar jugador", "error");
        } finally {
            setAsignandoJugadorId(null);
        }
    };

    const handleEliminarEquipo = async (id) => {
        const confirmed = await confirm(
            "¿Desactivar/Eliminar Equipo?",
            "¿Estás seguro de que deseas desactivar/eliminar este equipo?\n\n¡ATENCIÓN! Se eliminarán automáticamente todos los partidos PROGRAMADOS en los que participe este equipo y sus jugadores quedarán libres (agentes libres)."
        );
        if (!confirmed) return;
        try {
            await axios.delete(`http://localhost:5000/api/equipos/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification("Equipo desactivado correctamente", "success");
            cargarEquipos();
            if (temporadaActivaId) {
                const resEquipos = await axios.get(
                    `http://localhost:5000/api/temporadas/${temporadaActivaId}/equipos`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setEquiposParticipantes(resEquipos.data);
            }
        } catch (error) {
            console.error("Error al eliminar equipo:", error);
            showNotification(error.response?.data?.error || "Error al eliminar el equipo", "error");
        }
    };

    // Filtros e items paginados de Equipos
    const equiposFiltrados = equipos.filter(eq => {
        const query = searchTeamQuery.toLowerCase();
        const nombre = eq.nombre ? eq.nombre.toLowerCase() : '';
        const entrenador = eq.entrenador ? eq.entrenador.toLowerCase() : '';
        const estadio = eq.estadio ? eq.estadio.toLowerCase() : '';
        return nombre.includes(query) || entrenador.includes(query) || estadio.includes(query);
    });

    const itemsPerPage = 8;
    const totalPagesEquipos = Math.ceil(equiposFiltrados.length / itemsPerPage);
    const equiposPaginados = equiposFiltrados.slice((pageTeam - 1) * itemsPerPage, pageTeam * itemsPerPage);

    useEffect(() => {
        setPageTeam(1);
    }, [searchTeamQuery]);


    // ==========================================
    // LÓGICA DE GESTIÓN DE JUGADORES (CRUD & STEPS)
    // ==========================================
    const abrirModalJugador = (tipo, jugador = null) => {
        setModalJugadorActivo(tipo);
        setPlayerStep(1);
        if (jugador) {
            setFormPlayer({
                id: jugador.id,
                nombre_apellido: jugador.nombre_apellido || '',
                categoria: jugador.categoria || '',
                dorsal: jugador.dorsal !== null && jugador.dorsal !== undefined ? jugador.dorsal : '',
                equipo_id: jugador.equipo_id || '',
                temporada_id: temporadaActivaId || ''
            });
        } else {
            setFormPlayer({
                id: '',
                nombre_apellido: '',
                categoria: 'Profesional',
                dorsal: '',
                equipo_id: '',
                temporada_id: temporadaActivaId || ''
            });
        }
    };

    const handlePlayerInputChange = (e) => {
        const { name, value } = e.target;
        setFormPlayer(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitJugador = async (e) => {
        e.preventDefault();
        const payload = {
            nombre_apellido: formPlayer.nombre_apellido,
            categoria: "Profesional",
            dorsal: formPlayer.dorsal ? parseInt(formPlayer.dorsal, 10) : null,
            equipo_id: formPlayer.equipo_id ? parseInt(formPlayer.equipo_id, 10) : null
        };

        try {
            if (modalJugadorActivo === 'crear') {
                await axios.post('http://localhost:5000/api/jugadores', payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Jugador creado correctamente", "success");
            } else if (modalJugadorActivo === 'editar') {
                await axios.put(`http://localhost:5000/api/jugadores/${formPlayer.id}`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Jugador actualizado correctamente", "success");
            } else if (modalJugadorActivo === 'fichar') {
                await axios.post('http://localhost:5000/api/equipos/fichar', {
                    jugador_id: parseInt(formPlayer.id, 10),
                    equipo_id: formPlayer.equipo_id ? parseInt(formPlayer.equipo_id, 10) : null,
                    temporada_id: formPlayer.temporada_id ? parseInt(formPlayer.temporada_id, 10) : parseInt(temporadaActivaId, 10)
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Fichaje registrado correctamente", "success");
            }
            setModalJugadorActivo(null);
            cargarJugadores();
        } catch (error) {
            console.error("Error al guardar jugador:", error);
            showNotification(error.response?.data?.error || "Error al procesar el jugador", "error");
        }
    };

    const handleEliminarJugador = async (id) => {
        const confirmed = await confirm("¿Eliminar Jugador?", "¿Seguro que deseas eliminar este jugador de forma permanente?");
        if (!confirmed) return;
        try {
            await axios.delete(`http://localhost:5000/api/jugadores/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification("Jugador eliminado correctamente", "success");
            cargarJugadores();
        } catch (error) {
            console.error("Error al eliminar jugador:", error);
            showNotification(error.response?.data?.error || "Error al eliminar el jugador", "error");
        }
    };

    const obtenerEquipoConMasJugadores = () => {
        if (equipos.length === 0 || jugadores.length === 0) return 'Ninguno';
        const conteo = {};
        jugadores.forEach(j => {
            if (j.equipo_id) {
                conteo[j.equipo_id] = (conteo[j.equipo_id] || 0) + 1;
            }
        });
        let maxCount = 0;
        let maxEquipoId = null;
        Object.entries(conteo).forEach(([id, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxEquipoId = Number(id);
            }
        });
        if (!maxEquipoId) return 'Ninguno';
        const eq = equipos.find(e => e.id === maxEquipoId);
        return eq ? `${eq.nombre} (${maxCount})` : 'Ninguno';
    };

    // Filtros e items paginados de Jugadores
    const jugadoresFiltrados = jugadores.filter(j => {
        const query = searchPlayerQuery.toLowerCase();
        const nombre = j.nombre_apellido ? j.nombre_apellido.toLowerCase() : '';
        const matchesQuery = nombre.includes(query);
        const matchesEquipo = filtroJugadorEquipo === 'todos' ? true : 
                              filtroJugadorEquipo === 'libres' ? j.equipo_id === null :
                              j.equipo_id === Number(filtroJugadorEquipo);
        return matchesQuery && matchesEquipo;
    });

    const totalPagesJugadores = Math.ceil(jugadoresFiltrados.length / itemsPerPage);
    const jugadoresPaginados = jugadoresFiltrados.slice((pagePlayer - 1) * itemsPerPage, pagePlayer * itemsPerPage);

    useEffect(() => {
        setPagePlayer(1);
    }, [searchPlayerQuery, filtroJugadorEquipo]);


    // ==========================================
    // LÓGICA DE GESTIÓN DE PARTIDOS (CRUD & STEPS)
    // ==========================================
    const abrirModalPartido = (tipo, partido = null) => {
        setModalPartidoActivo(tipo);
        setMatchStep(1);
        if (partido) {
            setFormMatch({
                id: partido.id,
                temporada_id: partido.temporada_id || filterMatchSeason || '',
                jornada: partido.jornada || '',
                id_equipo_local: partido.id_equipo_local || '',
                id_equipo_visitante: partido.id_equipo_visitante || '',
                fecha: partido.fecha ? partido.fecha.split('T')[0] : '',
                horario: partido.horario || '',
                lugar: partido.lugar || '',
                puntos_local: partido.puntos_local !== null && partido.puntos_local !== undefined ? partido.puntos_local : '',
                puntos_visitante: partido.puntos_visitante !== null && partido.puntos_visitante !== undefined ? partido.puntos_visitante : ''
            });
        } else {
            setFormMatch({
                id: '',
                temporada_id: filterMatchSeason || '',
                jornada: '',
                id_equipo_local: '',
                id_equipo_visitante: '',
                fecha: '',
                horario: '',
                lugar: '',
                puntos_local: '',
                puntos_visitante: ''
            });
        }
    };

    const handleMatchInputChange = (e) => {
        const { name, value } = e.target;
        setFormMatch(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitPartido = async (e) => {
        e.preventDefault();
        const localId = parseInt(formMatch.id_equipo_local, 10);
        const visitanteId = parseInt(formMatch.id_equipo_visitante, 10);

        if (localId === visitanteId) {
            showNotification("Un equipo no puede jugar contra sí mismo.", "warning");
            return;
        }

        const payload = {
            temporada_id: formMatch.temporada_id ? parseInt(formMatch.temporada_id, 10) : null,
            jornada: formMatch.jornada ? parseInt(formMatch.jornada, 10) : null,
            id_equipo_local: localId,
            id_equipo_visitante: visitanteId,
            fecha: formMatch.fecha,
            horario: formMatch.horario,
            lugar: formMatch.lugar,
            puntos_local: formMatch.puntos_local !== '' ? parseInt(formMatch.puntos_local, 10) : null,
            puntos_visitante: formMatch.puntos_visitante !== '' ? parseInt(formMatch.puntos_visitante, 10) : null
        };

        try {
            if (modalPartidoActivo === 'crear') {
                await axios.post('http://localhost:5000/api/partidos', payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Partido creado correctamente", "success");
            } else {
                await axios.put(`http://localhost:5000/api/partidos/${formMatch.id}`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Partido actualizado correctamente", "success");
            }
            setModalPartidoActivo(null);
            if (filterMatchSeason) {
                cargarPartidosDeTemporada(filterMatchSeason);
            }
        } catch (error) {
            console.error("Error al guardar partido:", error);
            showNotification(error.response?.data?.error || "Error al guardar el partido", "error");
        }
    };

    const handleEliminarPartido = async (id) => {
        const confirmed = await confirm("¿Eliminar Partido?", "¿Seguro que deseas eliminar este partido?");
        if (!confirmed) return;
        try {
            await axios.delete(`http://localhost:5000/api/partidos/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification("Partido eliminado correctamente", "success");
            if (filterMatchSeason) {
                cargarPartidosDeTemporada(filterMatchSeason);
            }
        } catch (error) {
            console.error("Error al eliminar partido:", error);
            showNotification(error.response?.data?.error || "Error al eliminar el partido", "error");
        }
    };

    // Finalizar Partido logic
    const abrirModalFinalizarPartido = async (partido) => {
        setPartidoFinalizar(partido);
        setFinalizarStep(1);
        setPuntosLocal('');
        setPuntosVisitante('');
        setAnotaciones([]);
        setJugadoresPartido([]);
        setModalFinalizarActivo(true);

        try {
            const res = await axios.get(`http://localhost:5000/api/partidos/${partido.id}/jugadores`);
            setJugadoresPartido(res.data);
            setAnotaciones(res.data.map(j => ({ jugador_id: j.id, puntos: 0 })));
        } catch (err) {
            console.error("Error al cargar anotaciones/jugadores del partido:", err);
        }
    };

    const handleAnotacionChange = (jugadorId, puntosVal) => {
        const pts = parseInt(puntosVal) || 0;
        setAnotaciones(prev => {
            const index = prev.findIndex(a => a.jugador_id === jugadorId);
            if (index > -1) {
                const updated = [...prev];
                updated[index].puntos = pts;
                return updated;
            } else {
                return [...prev, { jugador_id: jugadorId, puntos: pts }];
            }
        });
    };

    const handleFinalizarPartidoSubmit = async (e) => {
        e.preventDefault();
        const ptsLocalInt = parseInt(puntosLocal, 10);
        const ptsVisitanteInt = parseInt(puntosVisitante, 10);

        if (isNaN(ptsLocalInt) || isNaN(ptsVisitanteInt)) {
            showNotification("Los puntos deben ser valores numéricos válidos.", "error");
            return;
        }

        if (ptsLocalInt === ptsVisitanteInt) {
            showNotification("No se permiten empates en el baloncesto. Debe haber un ganador.", "warning");
            return;
        }

        if (ptsLocalInt <= 0 || ptsVisitanteInt <= 0) {
            showNotification("Los resultados deben ser coherentes: los puntos de ambos equipos deben ser mayores a cero.", "error");
            return;
        }

        const sumaLocal = anotaciones
            .filter(a => jugadoresPartido.find(j => j.id === a.jugador_id)?.equipo_id === partidoFinalizar.id_equipo_local)
            .reduce((s, a) => s + a.puntos, 0);

        const sumaVisitante = anotaciones
            .filter(a => jugadoresPartido.find(j => j.id === a.jugador_id)?.equipo_id === partidoFinalizar.id_equipo_visitante)
            .reduce((s, a) => s + a.puntos, 0);

        if (sumaLocal !== ptsLocalInt || sumaVisitante !== ptsVisitanteInt) {
            showNotification(`La suma de puntos no coincide.\nLocal: ${sumaLocal} (esperado ${ptsLocalInt})\nVisitante: ${sumaVisitante} (esperado ${ptsVisitanteInt})`, "error");
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/partidos/${partidoFinalizar.id}/finalizar`, {
                puntos_local: ptsLocalInt,
                puntos_visitante: ptsVisitanteInt,
                anotaciones: anotaciones.filter(a => a.puntos > 0)
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification("Partido finalizado correctamente", "success");
            setModalFinalizarActivo(false);
            if (filterMatchSeason) {
                cargarPartidosDeTemporada(filterMatchSeason);
            }
        } catch (error) {
            console.error("Error al finalizar partido:", error);
            showNotification(error.response?.data?.error || "Error al finalizar el partido", "error");
        }
    };

    // Sincronización de temporada activa con filtro de partidos
    useEffect(() => {
        if (temporadaActivaId) {
            setFilterMatchSeason(temporadaActivaId);
        }
    }, [temporadaActivaId]);

    const cargarPartidosDeTemporada = useCallback(async (seasonId) => {
        if (!seasonId) return;
        try {
            const resPartidos = await axios.get('http://localhost:5000/api/partidos', {
                params: { temporada_id: seasonId }
            });
            setPartidos(resPartidos.data);
        } catch (error) {
            console.error("Error al cargar partidos de la temporada:", error);
            setPartidos([]);
        }
    }, []);

    useEffect(() => {
        if (filterMatchSeason) {
            cargarPartidosDeTemporada(filterMatchSeason);
        }
    }, [filterMatchSeason, cargarPartidosDeTemporada]);

    // Filtros e items paginados de Partidos
    const uniqueJornadas = [...new Set(partidos.map(p => p.jornada))].sort((a, b) => Number(a) - Number(b));

    const partidosFiltrados = partidos.filter(p => {
        const query = searchMatchQuery.toLowerCase();
        const localName = p.local ? p.local.toLowerCase() : '';
        const visitanteName = p.visitante ? p.visitante.toLowerCase() : '';
        const matchesQuery = localName.includes(query) || visitanteName.includes(query);
        const matchesJornada = filterMatchJornada === '' ? true : p.jornada === Number(filterMatchJornada);
        return matchesQuery && matchesJornada;
    });

    const totalPagesPartidos = Math.ceil(partidosFiltrados.length / itemsPerPage);
    const partidosPaginados = partidosFiltrados.slice((pageMatch - 1) * itemsPerPage, pageMatch * itemsPerPage);

    useEffect(() => {
        setPageMatch(1);
    }, [searchMatchQuery, filterMatchJornada]);

    // Renderizar listado de partidos agrupados por Jornada
    const renderFixture = () => {
        if (partidos.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 italic text-sm">
                    <Trophy className="w-10 h-10 text-slate-700 mb-2 opacity-50" />
                    <p>No hay partidos programados. Genera el calendario para crear el fixture.</p>
                </div>
            );
        }

        const jornadasMap = {};
        partidos.forEach(p => {
            if (!jornadasMap[p.jornada]) {
                jornadasMap[p.jornada] = [];
            }
            jornadasMap[p.jornada].push(p);
        });

        const jornadasOrdenadas = Object.keys(jornadasMap).sort((a, b) => Number(a) - Number(b));

        return (
            <div className="space-y-6">
                {jornadasOrdenadas.map(jornadaNum => {
                    const partidosDeJornada = jornadasMap[jornadaNum];
                    const fechaJornada = partidosDeJornada[0]?.fecha
                        ? new Date(partidosDeJornada[0].fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Fecha por definir';

                    return (
                        <div key={jornadaNum} className="bg-slate-950/30 rounded-2xl border border-slate-800/60 p-4 space-y-3">
                            <h4 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider flex items-center justify-between border-b border-slate-800/40 pb-2 mb-2">
                                <span>Jornada {jornadaNum}</span>
                                <span className="text-slate-500 text-[10px] font-semibold flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {fechaJornada}
                                </span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {partidosDeJornada.map(p => (
                                    <div key={p.id} className="flex items-center justify-between bg-slate-900/40 border border-slate-850 rounded-xl p-3 text-xs">
                                        <div className="flex items-center gap-2 w-5/12 justify-end text-right">
                                            <span className="font-bold text-slate-200 truncate">{p.local}</span>
                                            <div className="w-6 h-6 rounded-full bg-white p-0.5 flex-shrink-0 flex items-center justify-center">
                                                {p.logo_local ? (
                                                    <img src={`http://localhost:5000${p.logo_local}`} alt="" className="w-4 h-4 object-contain" />
                                                ) : (
                                                    <span className="text-[10px]">🏀</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-orange-500/80 px-2 select-none">VS</span>
                                        <div className="flex items-center gap-2 w-5/12">
                                            <div className="w-6 h-6 rounded-full bg-white p-0.5 flex-shrink-0 flex items-center justify-center">
                                                {p.logo_visitante ? (
                                                    <img src={`http://localhost:5000${p.logo_visitante}`} alt="" className="w-4 h-4 object-contain" />
                                                ) : (
                                                    <span className="text-[10px]">🏀</span>
                                                )}
                                            </div>
                                            <span className="font-bold text-slate-200 truncate">{p.visitante}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const adminsFiltrados = admins.filter(admin => {
        const query = searchAdminQuery.toLowerCase();
        const username = admin.username ? admin.username.toLowerCase() : '';
        const email = (admin.Email || admin.email || '').toLowerCase();
        return username.includes(query) || email.includes(query);
    });

    if (!token) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center px-4">
                <div className="text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm shadow-xl shadow-black/30">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-2">Acceso Denegado</h2>
                    <p className="text-slate-400 text-sm">Debes iniciar sesión como administrador para ver esta sección.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28 lg:pb-12 text-slate-100">
            {/* Header del Panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6 mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase text-white tracking-wider">Panel de Gestión</h1>
                    <p className="text-xs text-slate-400 font-medium">Administración de Temporadas, Equipos y Usuarios</p>
                </div>
            </div>

            {/* Layout Principal: Sidebar + Contenido */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Sidebar Izquierdo */}
                <aside className="lg:col-span-3 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 space-y-2 shadow-lg shadow-black/20">
                    <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500 px-3 py-1">MENÚ GESTIÓN</div>
                    
                    <button
                        className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'temporadas' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/20'}`}
                        onClick={() => setActiveTab('temporadas')}
                    >
                        <CalendarRange className="w-4 h-4" />
                        <span>Temporadas</span>
                    </button>
                    
                    <button
                        className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'admins' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/20'}`}
                        onClick={() => setActiveTab('admins')}
                    >
                        <Users className="w-4 h-4" />
                        <span>Administradores</span>
                    </button>

                    <button
                        className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'equipos' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/20'}`}
                        onClick={() => setActiveTab('equipos')}
                    >
                        <Shield className="w-4 h-4" />
                        <span>Equipos</span>
                    </button>

                    <button
                        className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'jugadores' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/20'}`}
                        onClick={() => setActiveTab('jugadores')}
                    >
                        <Users className="w-4 h-4" />
                        <span>Jugadores</span>
                    </button>

                    <button
                        className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'partidos' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/20'}`}
                        onClick={() => setActiveTab('partidos')}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Partidos</span>
                    </button>
                </aside>

                {/* Contenido Principal */}
                <main className="lg:col-span-9 space-y-6">

                    {/* VISTA 1: GESTIÓN DE TEMPORADAS */}
                    {activeTab === 'temporadas' && (
                        <div className="space-y-8">
                            
                            {/* Panel Configuración Rápida (Grid superior) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Selector Temporada Activa */}
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                                        <div className="flex items-center gap-2">
                                            <CalendarRange className="w-5 h-5 text-orange-500" />
                                            <h3 className="text-md font-bold text-white">Temporada Activa</h3>
                                        </div>
                                        {temporadaFinalizada && (
                                            <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase tracking-wider">
                                                Finalizada
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">Selecciona la temporada que se visualizará por defecto.</p>
                                    
                                    <div className="relative">
                                        <select
                                            value={temporadaActivaId}
                                            onChange={(e) => handleCambiarTemporadaActiva(e.target.value)}
                                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 outline-none focus:border-orange-500/50 transition-colors duration-200 cursor-pointer appearance-none animate-none"
                                        >
                                            <option value="">-- Seleccionar Temporada --</option>
                                            {temporadas.map(t => (
                                                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                                                    {t.nombre} {t.actual ? '(Activa)' : ''} {t.finalizada ? '(Finalizada)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
                                    </div>

                                    {temporadaActivaId && (
                                        <div className="pt-2">
                                            {temporadaFinalizada ? (
                                                <button
                                                    onClick={handleReabrirTemporada}
                                                    className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-250 cursor-pointer flex items-center justify-center gap-2"
                                                >
                                                    Reabrir Temporada
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleAbrirConfirmarFinalizar}
                                                    className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-250 cursor-pointer flex items-center justify-center gap-2"
                                                >
                                                    Finalizar Temporada
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Formulario Crear/Editar */}
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-800/50 pb-3">
                                        <Settings className="w-5 h-5 text-orange-500" />
                                        <h3 className="text-md font-bold text-white">
                                            {formTemporada.id ? 'Editar Temporada' : 'Nueva Temporada'}
                                        </h3>
                                    </div>
                                    
                                    {isFormTemporadaFinalizada && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-semibold text-red-400">
                                            Esta temporada está finalizada y no puede ser editada directamente. Primero debes reabrirla.
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmitTemporada} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Nombre de la Temporada</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Temporada 2026"
                                                value={formTemporada.nombre}
                                                onChange={(e) => setFormTemporada({ ...formTemporada, nombre: e.target.value })}
                                                required
                                                disabled={isFormTemporadaFinalizada}
                                                className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fecha Inicio</label>
                                                <input
                                                    type="date"
                                                    value={formTemporada.fecha_inicio}
                                                    onChange={(e) => setFormTemporada({ ...formTemporada, fecha_inicio: e.target.value })}
                                                    required
                                                    disabled={isFormTemporadaFinalizada}
                                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fecha Fin</label>
                                                <input
                                                    type="date"
                                                    value={formTemporada.fecha_fin}
                                                    onChange={(e) => setFormTemporada({ ...formTemporada, fecha_fin: e.target.value })}
                                                    required
                                                    disabled={isFormTemporadaFinalizada}
                                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <button 
                                                type="submit" 
                                                disabled={isFormTemporadaFinalizada}
                                                className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-550 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10 disabled:shadow-none disabled:cursor-not-allowed"
                                            >
                                                {formTemporada.id ? 'Guardar Cambios' : 'Crear Temporada'}
                                            </button>
                                            {formTemporada.id && (
                                                <button
                                                    type="button"
                                                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                                                    onClick={() => setFormTemporada({ id: '', nombre: '', fecha_inicio: '', fecha_fin: '' })}
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Fila intermedia: Equipos y Calendario (solo si hay temporada activa) */}
                            {temporadaActivaId ? (
                                <div className="space-y-8">
                                    
                                    {temporadaFinalizada && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-3">
                                            <Lock className="w-5 h-5 text-red-400" />
                                            <span>Esta temporada está finalizada. No se permiten cambios en sus equipos asignados ni en su calendario.</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* Equipos Participantes */}
                                        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 flex flex-col h-[400px]">
                                            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3 mb-4 flex-shrink-0">
                                                <h3 className="text-md font-bold text-white flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-orange-500" />
                                                    Equipos Asignados
                                                </h3>
                                                {!temporadaFinalizada && (
                                                    <button
                                                        className="inline-flex items-center gap-1 py-1.5 px-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                        onClick={() => setModalActivo('asignar_equipos')}
                                                    >
                                                        Asignar
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                                {equiposParticipantes.length > 0 ? (
                                                    equiposParticipantes.map(eq => (
                                                        <div key={eq.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/20 border border-slate-850">
                                                            <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center flex-shrink-0">
                                                                {eq.logo ? (
                                                                    <img src={`http://localhost:5000${eq.logo}`} alt={eq.nombre} className="w-6 h-6 object-contain" />
                                                                ) : (
                                                                    <span className="text-xs">🏀</span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-200 truncate">{eq.nombre}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 italic text-xs py-8">
                                                        No hay equipos asignados a esta temporada.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gestión de Calendario */}
                                        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 flex flex-col h-[400px]">
                                            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3 mb-4 flex-shrink-0">
                                                <h3 className="text-md font-bold text-white flex items-center gap-2">
                                                    <Trophy className="w-5 h-5 text-orange-500" />
                                                    Calendario / Fixture
                                                </h3>
                                                {!temporadaFinalizada && (
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={handleGenerarCalendario} 
                                                            className="py-1.5 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                        >
                                                            Generar
                                                        </button>
                                                        <button 
                                                            onClick={handleEliminarCalendario} 
                                                            className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                                {renderFixture()}
                                            </div>
                                        </div>

                                    </div>

                                    {/* Resúmenes Rápidos (Jugadores & Partidos) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Resumen Jugadores */}
                                        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl">
                                            <h4 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider mb-4">Resumen Jugadores</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850">
                                                    <p className="text-2xl font-black text-white">{jugadores.length}</p>
                                                    <p className="text-[10px] uppercase text-slate-500 font-bold mt-1">Registrados</p>
                                                </div>
                                                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850">
                                                    <p className="text-2xl font-black text-white">{jugadores.filter(j => j.equipo_id === null).length}</p>
                                                    <p className="text-[10px] uppercase text-slate-500 font-bold mt-1">Agentes Libres</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resumen Partidos */}
                                        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl">
                                            <h4 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider mb-4">Resumen Partidos</h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-850 text-center">
                                                    <p className="text-xl font-black text-white">{partidos.length}</p>
                                                    <p className="text-[9px] uppercase text-slate-500 font-bold mt-1">Programados</p>
                                                </div>
                                                <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-850 text-center">
                                                    <p className="text-xl font-black text-emerald-400">{partidos.filter(p => p.finalizado === true).length}</p>
                                                    <p className="text-[9px] uppercase text-slate-500 font-bold mt-1">Jugados</p>
                                                </div>
                                                <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-850 text-center">
                                                    <p className="text-xl font-black text-orange-500">{partidos.filter(p => p.finalizado === false).length}</p>
                                                    <p className="text-[9px] uppercase text-slate-500 font-bold mt-1">Pendientes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="p-8 bg-slate-900/30 border border-slate-850 rounded-2xl text-center text-slate-400 flex items-center justify-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-550" />
                                    <span>Debes activar una temporada para gestionar sus equipos y calendario.</span>
                                </div>
                            )}

                        </div>
                    )}

                    {/* VISTA 2: GESTIÓN DE ADMINS */}
                    {activeTab === 'admins' && (
                        <div className="space-y-8">
                            
                            {/* Card Tabla de Administradores */}
                            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl shadow-black/20">
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/60 pb-2 mb-5 gap-4">
                                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-orange-500" />
                                        Administradores del Sistema
                                    </h3>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Buscar por usuario/email..."
                                                value={searchAdminQuery}
                                                onChange={(e) => setSearchAdminQuery(e.target.value)}
                                                className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-slate-700 rounded-xl pt-2 pl-9 pr-4 py-2 text-xs font-semibold text-slate-200 outline-none w-full sm:w-56"
                                            />
                                            <Search className="w-3.5 h-3.5 text-slate-550 absolute left-3 top-1/2 -translate-y-1/2" />
                                        </div>
                                        
                                        <button
                                            className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-orange-500/10"
                                            onClick={() => {
                                                setSelectedAdminId(null);
                                                setFormAdmin({ username: '', password: '', Email: '' });
                                                setModalActivo('crear_admin');
                                            }}
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            <span>Nuevo Admin</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-slate-800/60 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                                                <th className="p-3 px-4 w-16">ID</th>
                                                <th className="p-3 px-4">Usuario</th>
                                                <th className="p-3 px-4">Correo Electrónico</th>
                                                <th className="p-3 px-4 text-center">Estado</th>
                                                <th className="p-3 px-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/30">
                                            {adminsFiltrados.length > 0 ? (
                                                adminsFiltrados.map(adm => (
                                                    <tr key={adm.id} className="hover:bg-slate-800/10 transition-colors">
                                                        <td className="py-3.5 px-4 font-bold text-slate-500">{adm.id}</td>
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-xs font-black text-slate-400">
                                                                    {adm.username ? adm.username.substring(0, 2).toUpperCase() : 'AD'}
                                                                </div>
                                                                <span className="font-extrabold text-slate-200">{adm.username}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-slate-300 font-semibold">{adm.Email || adm.email || '—'}</td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                Activo
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                                                    onClick={() => abrirEditarAdmin(adm)}
                                                                    title="Editar"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                {adm.username !== 'camilo' && adm.username !== currentAdmin && (
                                                                    <button
                                                                        className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 flex items-center justify-center text-red-400 transition-colors"
                                                                        onClick={() => handleEliminarAdmin(adm.id)}
                                                                        title="Eliminar"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center text-slate-500 font-medium italic">
                                                        No se encontraron administradores
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>

                            {/* Fila inferior: Existentes & Resumen */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Temporadas Existentes */}
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl flex flex-col h-[320px]">
                                    <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider mb-4 pb-2 border-b border-slate-800/50 flex-shrink-0">
                                        Temporadas Registradas
                                    </h3>
                                    
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {temporadas.map(t => (
                                            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-slate-850 hover:border-slate-800 transition-all">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <p className="text-xs font-bold text-slate-200 truncate">{t.nombre}</p>
                                                        {t.finalizada && (
                                                            <span className="text-[9px] text-red-400 font-extrabold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 uppercase tracking-wide flex-shrink-0">
                                                                Finalizada
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-medium">
                                                        {t.fecha_inicio ? t.fecha_inicio.split('T')[0] : ''} al {t.fecha_fin ? t.fecha_fin.split('T')[0] : ''}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {t.finalizada ? (
                                                        <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-500" title="Finalizada - No se puede editar">
                                                            <Lock className="w-3.5 h-3.5" />
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setFormTemporada({
                                                                    id: t.id,
                                                                    nombre: t.nombre,
                                                                    fecha_inicio: t.fecha_inicio ? t.fecha_inicio.split('T')[0] : '',
                                                                    fecha_fin: t.fecha_fin ? t.fecha_fin.split('T')[0] : ''
                                                                });
                                                                setActiveTab('temporadas');
                                                            }}
                                                            className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEliminarTemporada(t.id)}
                                                        className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resumen Estadísticas Admins */}
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl flex flex-col h-[320px] justify-between">
                                    <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider pb-2 border-b border-slate-800/50">
                                        Estadísticas del Sistema
                                    </h3>
                                    
                                    <div className="space-y-4 my-auto">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-slate-850">
                                            <span className="text-xs text-slate-400 font-semibold">Total Administradores</span>
                                            <span className="text-md font-black text-white">{admins.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-slate-850">
                                            <span className="text-xs text-slate-400 font-semibold">Total Temporadas</span>
                                            <span className="text-md font-black text-white">{temporadas.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-slate-850">
                                            <span className="text-xs text-slate-400 font-semibold">Estado Base de Datos</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Conectado
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl text-[10px] text-slate-400 flex items-start gap-2">
                                        <Info className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                                        <span>Solo administradores autorizados pueden realizar cambios en las temporadas o dar de alta nuevos usuarios. Las acciones quedan registradas.</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* VISTA 3: GESTIÓN DE EQUIPOS */}
                    {activeTab === 'equipos' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-350">
                            {/* Estadísticas de Equipos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Total Equipos</p>
                                        <Shield className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-2xl font-black text-white mt-2">{equipos.length}</p>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Equipos en Temporada Activa</p>
                                        <Trophy className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-2xl font-black text-white mt-2">{equiposParticipantes.length}</p>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Temporada Actual</p>
                                        <CalendarRange className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-lg font-black text-white mt-2.5 truncate">{temporadaActiva?.nombre || 'Ninguna'}</p>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Sin Jugadores</p>
                                        <Users className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-2xl font-black text-white mt-2">
                                        {equipos.filter(eq => jugadores.filter(j => j.equipo_id === eq.id).length === 0).length}
                                    </p>
                                </div>
                            </div>

                            {/* Listado de Equipos */}
                            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl">
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/60 pb-4 mb-5 gap-4">
                                    <div>
                                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-orange-550 text-orange-500" />
                                            Gestión de Equipos
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">Crea, edita y gestiona los equipos de la liga.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre..."
                                                value={searchTeamQuery}
                                                onChange={(e) => setSearchTeamQuery(e.target.value)}
                                                className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-slate-700 rounded-xl pt-2 pl-9 pr-4 py-2 text-xs font-semibold text-slate-200 outline-none w-full sm:w-56"
                                            />
                                            <Search className="w-3.5 h-3.5 text-slate-550 absolute left-3 top-1/2 -translate-y-1/2" />
                                        </div>
                                        <button
                                            className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-orange-500/10"
                                            onClick={() => abrirModalEquipo('crear')}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Nuevo Equipo</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-slate-800/60 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                                                <th className="p-3 px-4">Escudo</th>
                                                <th className="p-3 px-4">Nombre</th>
                                                <th className="p-3 px-4">Entrenador</th>
                                                <th className="p-3 px-4">Estadio</th>
                                                <th className="p-3 px-4 text-center">Estado</th>
                                                <th className="p-3 px-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/30">
                                            {equiposPaginados.length > 0 ? (
                                                equiposPaginados.map(eq => {
                                                    const esParticipante = equiposParticipantes.some(ep => ep.id === eq.id);
                                                    return (
                                                        <tr key={eq.id} className="hover:bg-slate-800/10 transition-colors">
                                                            <td className="py-3 px-4">
                                                                <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center border border-slate-800 flex-shrink-0">
                                                                    {eq.logo ? (
                                                                        <img src={`http://localhost:5000${eq.logo}`} alt="" className="w-8 h-8 object-contain" />
                                                                    ) : (
                                                                        <span className="text-md">🏀</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 font-bold text-slate-200">{eq.nombre}</td>
                                                            <td className="py-3 px-4 text-slate-400 font-semibold">{eq.entrenador || '—'}</td>
                                                            <td className="py-3 px-4 text-slate-400 font-semibold">{eq.estadio || '—'}</td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${esParticipante ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                                                                    {esParticipante ? 'Activo' : 'Inactivo'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <a
                                                                        href={`/equipos/${eq.id}/detalle`}
                                                                        className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                                                        title="Ver detalles"
                                                                    >
                                                                        <Info className="w-3.5 h-3.5" />
                                                                    </a>
                                                                    <button
                                                                        className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                                                        onClick={() => abrirModalEquipo('editar', eq)}
                                                                        title="Editar"
                                                                    >
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 flex items-center justify-center text-red-400 transition-colors"
                                                                        onClick={() => handleEliminarEquipo(eq.id)}
                                                                        title="Eliminar"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="py-12 text-center text-slate-500 font-medium italic">
                                                        No se encontraron equipos
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {totalPagesEquipos > 1 && (
                                    <div className="flex items-center justify-between border-t border-slate-800/40 pt-4 mt-4">
                                        <button
                                            disabled={pageTeam === 1}
                                            onClick={() => setPageTeam(prev => prev - 1)}
                                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-400 text-xs font-bold rounded-lg border border-slate-850 transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <span className="text-xs text-slate-500 font-bold">Página {pageTeam} de {totalPagesEquipos}</span>
                                        <button
                                            disabled={pageTeam === totalPagesEquipos}
                                            onClick={() => setPageTeam(prev => prev + 1)}
                                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-400 text-xs font-bold rounded-lg border border-slate-850 transition-colors"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VISTA 4: GESTIÓN DE JUGADORES */}
                    {activeTab === 'jugadores' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-350">
                            {/* Estadísticas de Jugadores */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Total Jugadores</p>
                                        <Users className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-2xl font-black text-white mt-2">{jugadores.length}</p>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Jugadores Activos</p>
                                        <Check className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-2xl font-black text-white mt-2">{jugadores.filter(j => j.equipo_id !== null).length}</p>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Agentes Libres</p>
                                        <TrendingUp className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-2xl font-black text-white mt-2">{jugadores.filter(j => j.equipo_id === null).length}</p>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider font-extrabold text-purple-400">Plantilla Más Grande</p>
                                        <Trophy className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-xs font-black text-white mt-3 truncate">{obtenerEquipoConMasJugadores()}</p>
                                </div>
                            </div>

                            {/* Listado de Jugadores */}
                            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl">
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/60 pb-4 mb-5 gap-4">
                                    <div>
                                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                                            <Users className="w-5 h-5 text-orange-500" />
                                            Gestión de Jugadores
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">Administra las fichas y la asignación a equipos.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <div className="relative">
                                            <select
                                                value={filtroJugadorEquipo}
                                                onChange={(e) => setFiltroJugadorEquipo(e.target.value)}
                                                className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-slate-700 rounded-xl py-2 pl-3 pr-8 text-xs font-semibold text-slate-200 outline-none w-full sm:w-44 cursor-pointer appearance-none"
                                            >
                                                <option value="todos">Todos los equipos</option>
                                                <option value="libres">Agentes Libres</option>
                                                {equipos.map(eq => (
                                                    <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre..."
                                                value={searchPlayerQuery}
                                                onChange={(e) => setSearchPlayerQuery(e.target.value)}
                                                className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-slate-700 rounded-xl pt-2 pl-9 pr-4 py-2 text-xs font-semibold text-slate-200 outline-none w-full sm:w-48"
                                            />
                                            <Search className="w-3.5 h-3.5 text-slate-550 absolute left-3 top-1/2 -translate-y-1/2" />
                                        </div>

                                        <button
                                            className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-orange-500/10"
                                            onClick={() => abrirModalJugador('crear')}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Nuevo Jugador</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-slate-800/60 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                                                <th className="p-3 px-4">Foto</th>
                                                <th className="p-3 px-4">Nombre</th>
                                                <th className="p-3 px-4">Equipo</th>
                                                <th className="p-3 px-4">Dorsal</th>
                                                <th className="p-3 px-4">Categoría</th>
                                                <th className="p-3 px-4 text-center">Estado</th>
                                                <th className="p-3 px-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/30">
                                            {jugadoresPaginados.length > 0 ? (
                                                jugadoresPaginados.map(j => {
                                                    const teamObj = equipos.find(eq => eq.id === j.equipo_id);
                                                    return (
                                                        <tr key={j.id} className="hover:bg-slate-800/10 transition-colors">
                                                            <td className="py-3 px-4">
                                                                <div className="w-9 h-9 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-xs font-black text-slate-400">
                                                                    {j.nombre_apellido ? j.nombre_apellido.substring(0, 2).toUpperCase() : 'JG'}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 font-bold text-slate-200">{j.nombre_apellido}</td>
                                                            <td className="py-3 px-4 font-semibold text-orange-500">{teamObj ? teamObj.nombre : 'Agente Libre'}</td>
                                                            <td className="py-3 px-4 text-slate-400 font-bold">{j.dorsal !== null && j.dorsal !== undefined ? `#${j.dorsal}` : '—'}</td>
                                                            <td className="py-3 px-4 text-slate-400 font-semibold">{j.categoria || ''}</td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${j.equipo_id === null || j.equipo_id === undefined ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                                    {j.equipo_id === null || j.equipo_id === undefined ? 'Libre' : 'Fichado'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        className="inline-flex items-center justify-center px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition-colors"
                                                                        onClick={() => abrirModalJugador('fichar', j)}
                                                                        title="Fichar / Cambiar Equipo"
                                                                    >
                                                                        Fichar
                                                                    </button>
                                                                    <button
                                                                        className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                                                        onClick={() => abrirModalJugador('editar', j)}
                                                                        title="Editar"
                                                                    >
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 flex items-center justify-center text-red-400 transition-colors"
                                                                        onClick={() => handleEliminarJugador(j.id)}
                                                                        title="Eliminar"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="py-12 text-center text-slate-500 font-medium italic">
                                                        No se encontraron jugadores
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {totalPagesJugadores > 1 && (
                                    <div className="flex items-center justify-between border-t border-slate-800/40 pt-4 mt-4">
                                        <button
                                            disabled={pagePlayer === 1}
                                            onClick={() => setPagePlayer(prev => prev - 1)}
                                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-400 text-xs font-bold rounded-lg border border-slate-850 transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <span className="text-xs text-slate-500 font-bold">Página {pagePlayer} de {totalPagesJugadores}</span>
                                        <button
                                            disabled={pagePlayer === totalPagesJugadores}
                                            onClick={() => setPagePlayer(prev => prev + 1)}
                                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-400 text-xs font-bold rounded-lg border border-slate-850 transition-colors"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VISTA 5: GESTIÓN DE PARTIDOS */}
                    {activeTab === 'partidos' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-350">
                            {/* Estadísticas de Partidos */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Programados</p>
                                        <Calendar className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-2xl font-black text-white mt-2">
                                        {partidos.filter(p => !p.finalizado).length}
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Finalizados</p>
                                        <Trophy className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-2xl font-black text-white mt-2">
                                        {partidos.filter(p => p.finalizado && p.puntos_local !== null && p.puntos_local !== undefined).length}
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:-translate-y-1 transition-all duration-200 group border-yellow-500/20 bg-yellow-500/5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase text-yellow-500 font-bold tracking-wider">Sin Marcador</p>
                                        <AlertTriangle className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-2xl font-black text-yellow-500 mt-2">
                                        {partidos.filter(p => p.finalizado && (p.puntos_local === null || p.puntos_local === undefined)).length}
                                    </p>
                                </div>
                            </div>

                            {/* Listado de Partidos */}
                            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
                                {isSelectedSeasonFinalized && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-red-400" />
                                        <span>Esta temporada está finalizada. No se pueden programar nuevos partidos ni editar los existentes.</span>
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/60 pb-4 mb-5 gap-4">
                                    <div>
                                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-orange-500" />
                                            Gestión de Partidos
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">Programa y finaliza partidos de la liga.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <div className="relative">
                                            <select
                                                value={filterMatchSeason}
                                                onChange={(e) => setFilterMatchSeason(e.target.value)}
                                                className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-slate-700 rounded-xl py-2 pl-3 pr-8 text-xs font-semibold text-slate-200 outline-none w-full sm:w-44 cursor-pointer appearance-none animate-none"
                                            >
                                                {temporadas.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre} {t.finalizada ? '(Finalizada)' : ''}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
                                        </div>

                                        <div className="relative">
                                            <select
                                                value={filterMatchJornada}
                                                onChange={(e) => setFilterMatchJornada(e.target.value)}
                                                className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-slate-700 rounded-xl py-2 pl-3 pr-8 text-xs font-semibold text-slate-200 outline-none w-full sm:w-32 cursor-pointer appearance-none animate-none"
                                            >
                                                <option value="">Todas</option>
                                                {uniqueJornadas.map(j => (
                                                    <option key={j} value={j}>Jornada {j}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Buscar por equipo..."
                                                value={searchMatchQuery}
                                                onChange={(e) => setSearchMatchQuery(e.target.value)}
                                                className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-slate-700 rounded-xl pt-2 pl-9 pr-4 py-2 text-xs font-semibold text-slate-200 outline-none w-full sm:w-48"
                                            />
                                            <Search className="w-3.5 h-3.5 text-slate-550 absolute left-3 top-1/2 -translate-y-1/2" />
                                        </div>

                                        {!isSelectedSeasonFinalized && (
                                            <button
                                                className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-orange-500/10 cursor-pointer"
                                                onClick={() => abrirModalPartido('crear')}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Nuevo Partido</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-slate-800/60 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                                                <th className="p-3 px-4">Local</th>
                                                <th className="p-3 px-4 text-center">Score</th>
                                                <th className="p-3 px-4">Visitante</th>
                                                <th className="p-3 px-4">Fecha / Hora</th>
                                                <th className="p-3 px-4">Lugar</th>
                                                <th className="p-3 px-4">Jornada</th>
                                                <th className="p-3 px-4 text-center">Estado</th>
                                                <th className="p-3 px-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/30">
                                            {partidosPaginados.length > 0 ? (
                                                partidosPaginados.map(p => {
                                                    const isToday = new Date(p.fecha + 'T00:00:00').toDateString() === new Date().toDateString();
                                                    const sinMarcador = p.finalizado && (p.puntos_local === null || p.puntos_local === undefined);
                                                    const stateColor = sinMarcador ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                                       p.finalizado ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                       isToday ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' :
                                                                       'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                                                    const stateLabel = sinMarcador ? 'Sin Marcador' :
                                                                       p.finalizado ? 'Finalizado' :
                                                                       isToday ? 'En Vivo' :
                                                                       'Programado';

                                                    return (
                                                        <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                                                            <td className="py-3 px-4 font-bold text-slate-200">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-white p-0.5 flex-shrink-0 flex items-center justify-center">
                                                                        {p.logo_local ? (
                                                                            <img src={`http://localhost:5000${p.logo_local}`} alt="" className="w-4 h-4 object-contain" />
                                                                        ) : (
                                                                            <span className="text-[10px]">🏀</span>
                                                                        )}
                                                                    </div>
                                                                    <span>{p.local}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-black text-slate-200 text-sm">
                                                                {sinMarcador ? '—' : p.finalizado ? `${p.puntos_local} - ${p.puntos_visitante}` : 'vs'}
                                                            </td>
                                                            <td className="py-3 px-4 font-bold text-slate-200">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-white p-0.5 flex-shrink-0 flex items-center justify-center">
                                                                        {p.logo_visitante ? (
                                                                            <img src={`http://localhost:5000${p.logo_visitante}`} alt="" className="w-4 h-4 object-contain" />
                                                                        ) : (
                                                                            <span className="text-[10px]">🏀</span>
                                                                        )}
                                                                    </div>
                                                                    <span>{p.visitante}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-slate-400 font-semibold">
                                                                {p.fecha ? p.fecha.split('T')[0] : ''} {p.horario || ''}
                                                            </td>
                                                            <td className="py-3 px-4 text-slate-400 font-semibold">{p.lugar || '—'}</td>
                                                            <td className="py-3 px-4 text-slate-400 font-bold text-center font-semibold">J{p.jornada}</td>
                                                            <td className="py-3 px-4 text-center font-semibold">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${stateColor}`}>
                                                                    {stateLabel}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {isSelectedSeasonFinalized ? (
                                                                        <span className="text-[10px] text-slate-500 font-bold bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-850 flex items-center gap-1">
                                                                            Solo lectura
                                                                        </span>
                                                                    ) : (
                                                                        <>
                                                                            {(!p.finalizado || sinMarcador) && (
                                                                                <button
                                                                                    className={`inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-bold text-white rounded-lg transition-colors cursor-pointer ${sinMarcador ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                                                                                    onClick={() => abrirModalFinalizarPartido(p)}
                                                                                >
                                                                                    {sinMarcador ? 'Completar' : 'Finalizar'}
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                                                                                onClick={() => abrirModalPartido('editar', p)}
                                                                                title="Editar"
                                                                            >
                                                                                <Edit2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            <button
                                                                                className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                                                                                onClick={() => handleEliminarPartido(p.id)}
                                                                                title="Eliminar"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="py-12 text-center text-slate-500 font-medium italic">
                                                        No se encontraron partidos
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {totalPagesPartidos > 1 && (
                                    <div className="flex items-center justify-between border-t border-slate-800/40 pt-4 mt-4">
                                        <button
                                            disabled={pageMatch === 1}
                                            onClick={() => setPageMatch(prev => prev - 1)}
                                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-400 text-xs font-bold rounded-lg border border-slate-850 transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <span className="text-xs text-slate-500 font-bold">Página {pageMatch} de {totalPagesPartidos}</span>
                                        <button
                                            disabled={pageMatch === totalPagesPartidos}
                                            onClick={() => setPageMatch(prev => prev + 1)}
                                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-400 text-xs font-bold rounded-lg border border-slate-850 transition-colors"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </main>

            {/* MODALES */}

            {/* Modal de Confirmación de Finalizar Temporada */}
            {modalFinalizarTemporadaActivo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalFinalizarTemporadaActivo(false)}>
                    <div 
                        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl shadow-black overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 flex-shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    Finalizar Temporada
                                </h2>
                            </div>
                            <button 
                                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                                onClick={() => setModalFinalizarTemporadaActivo(false)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Contenido Modal */}
                        <div className="p-6 space-y-4">
                            {cargandoResumen ? (
                                <div className="py-8 text-center text-slate-500 text-sm font-semibold flex flex-col items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
                                    Cargando resumen de temporada...
                                </div>
                            ) : resumenTemporada ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-350 leading-relaxed">
                                        ¿Estás seguro de que deseas finalizar la temporada <strong className="text-white">{resumenTemporada.nombre}</strong>? 
                                    </p>

                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-semibold leading-relaxed flex gap-2.5">
                                        <Info className="w-5 h-5 flex-shrink-0 text-red-400" />
                                        <div>
                                            <strong>¡IMPORTANTE!</strong> Al finalizar la temporada no se permitirán más cambios: no podrás modificar partidos, generar fixtures, inscribir/remover equipos, ni gestionar fichajes.
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Resumen de Pendientes</h4>
                                        <ul className="divide-y divide-slate-850 bg-slate-950/30 border border-slate-850 rounded-xl px-4 py-2 text-xs font-medium space-y-1">
                                            <li className="flex justify-between items-center py-2">
                                                <span className="text-slate-400">Equipos Inscritos</span>
                                                <span className="text-white font-extrabold">{resumenTemporada.equiposAsignados}</span>
                                            </li>
                                            <li className="flex justify-between items-center py-2">
                                                <span className="text-slate-400">Partidos Totales</span>
                                                <span className="text-white font-extrabold">{resumenTemporada.partidosTotales}</span>
                                            </li>
                                            <li className="flex justify-between items-center py-2">
                                                <span className="text-slate-400">Partidos Pendientes (Sin jugar)</span>
                                                <span className={`font-extrabold ${resumenTemporada.partidosSinJugar > 0 ? 'text-orange-500' : 'text-emerald-400'}`}>
                                                    {resumenTemporada.partidosSinJugar}
                                                </span>
                                            </li>
                                            <li className="flex justify-between items-center py-2">
                                                <span className="text-slate-400">Partidos Jugados Sin Resultado</span>
                                                <span className={`font-extrabold ${resumenTemporada.partidosSinResultado > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                                                    {resumenTemporada.partidosSinResultado}
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    {(resumenTemporada.partidosSinJugar > 0 || resumenTemporada.partidosSinResultado > 0) && (
                                        <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl text-xs font-semibold">
                                            ⚠️ Aún quedan partidos sin jugar o sin resultado cargado en el sistema.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 text-center">No se pudo cargar el resumen.</p>
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-end gap-3">
                            <button
                                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                onClick={() => setModalFinalizarTemporadaActivo(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/10 cursor-pointer"
                                onClick={handleFinalizarTemporada}
                                disabled={cargandoResumen || !resumenTemporada}
                            >
                                Confirmar y Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Modal Asignar Equipos a Temporada */}
            {modalActivo === 'asignar_equipos' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalActivo(null)}>
                    <div 
                        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 flex-shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Asignar Equipos</h2>
                                <p className="text-xs text-slate-400 font-medium">Selecciona los equipos que participarán en la temporada actual.</p>
                            </div>
                            <button 
                                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                onClick={() => setModalActivo(null)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="p-4 bg-slate-950/20 border-b border-slate-800/60 flex-shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar equipo por nombre..."
                                    value={searchTeamQuery}
                                    onChange={(e) => setSearchTeamQuery(e.target.value)}
                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-slate-755 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-200 outline-none transition-colors"
                                />
                                <Search className="w-4 h-4 text-slate-550 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        {/* Team Assignment List Scroll */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <TeamAssignmentList
                                allTeams={equipos}
                                initiallySelected={equiposParticipantes.map(eq => eq.id)}
                                filterQuery={searchTeamQuery}
                                onSave={handleGuardarEquiposAsignados}
                                onCancel={() => setModalActivo(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Modal Crear / Editar Administrador */}
            {(modalActivo === 'crear_admin' || modalActivo === 'editar_admin') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalActivo(null)}>
                    <div 
                        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl shadow-black overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
                            <h2 className="text-md font-bold text-white uppercase tracking-wider">
                                {modalActivo === 'crear_admin' ? 'Nuevo Administrador' : 'Editar Administrador'}
                            </h2>
                            <button 
                                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                onClick={() => setModalActivo(null)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitAdmin} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Nombre de Usuario *</label>
                                <input
                                    type="text"
                                    value={formAdmin.username}
                                    onChange={(e) => setFormAdmin({ ...formAdmin, username: e.target.value })}
                                    required
                                    disabled={modalActivo === 'editar_admin'}
                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200 disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Contraseña *</label>
                                <input
                                    type="password"
                                    value={formAdmin.password}
                                    onChange={(e) => setFormAdmin({ ...formAdmin, password: e.target.value })}
                                    required={modalActivo === 'crear_admin'}
                                    placeholder={modalActivo === 'editar_admin' ? 'Nueva contraseña' : ''}
                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Correo Electrónico *</label>
                                <input
                                    type="email"
                                    value={formAdmin.Email}
                                    onChange={(e) => setFormAdmin({ ...formAdmin, Email: e.target.value })}
                                    required
                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/40">
                                <button 
                                    type="button" 
                                    onClick={() => setModalActivo(null)} 
                                    className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10"
                                >
                                    {modalActivo === 'crear_admin' ? 'Registrar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Crear / Editar Equipo (Stepper) */}
            {modalEquipoActivo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalEquipoActivo(null)}>
                    <div 
                        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
                            <div>
                                <h2 className="text-md font-bold text-white uppercase tracking-wider">
                                    {modalEquipoActivo === 'crear' ? 'Nuevo Equipo' : 'Editar Equipo'}
                                </h2>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                                    {teamStep === 4 ? 'Paso opcional' : `Paso ${teamStep} de 3`}
                                </p>
                            </div>
                            <button 
                                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                onClick={() => setModalEquipoActivo(null)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-950 h-1">
                            <div 
                                className="bg-orange-500 h-1 transition-all duration-350" 
                                style={{ width: teamStep === 4 ? '100%' : `${(teamStep / 3) * 100}%` }}
                            />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitEquipo} className="flex-1 flex flex-col overflow-y-auto">
                            <div className="p-6 flex-1 space-y-4">
                                {teamStep === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 1: Información General</h3>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Nombre del Equipo *</label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formTeam.nombre}
                                                onChange={handleTeamInputChange}
                                                required
                                                className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-550 text-slate-500 tracking-wider">Entrenador *</label>
                                            <input
                                                type="text"
                                                name="entrenador"
                                                value={formTeam.entrenador}
                                                onChange={handleTeamInputChange}
                                                required
                                                className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-550 text-slate-500 tracking-wider">Estadio *</label>
                                            <input
                                                type="text"
                                                name="estadio"
                                                value={formTeam.estadio}
                                                onChange={handleTeamInputChange}
                                                required
                                                className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200"
                                            />
                                        </div>
                                    </div>
                                )}

                                {teamStep === 2 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 2: Identidad Visual</h3>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Logotipo del Equipo</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                                                    {formTeam.fotoUrl ? (
                                                        <img src={formTeam.fotoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-2xl">🏀</span>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    name="foto"
                                                    onChange={handleTeamInputChange}
                                                    accept="image/*"
                                                    className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-950 file:text-slate-300 hover:file:bg-slate-850 file:cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {teamStep === 3 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 3: Confirmación</h3>
                                        <div className="bg-slate-950/40 rounded-xl border border-slate-850 p-4 space-y-2.5">
                                            <h4 className="text-[10px] uppercase font-extrabold text-slate-400">Resumen de Datos</h4>
                                            <div className="grid grid-cols-2 gap-y-2 text-xs">
                                                <p className="text-slate-500 font-bold">Nombre:</p>
                                                <p className="text-slate-200 font-semibold">{formTeam.nombre}</p>
                                                
                                                <p className="text-slate-500 font-bold">Entrenador:</p>
                                                <p className="text-slate-200 font-semibold">{formTeam.entrenador}</p>
                                                
                                                <p className="text-slate-500 font-bold">Estadio:</p>
                                                <p className="text-slate-200 font-semibold">{formTeam.estadio}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 pt-2">
                                            <input
                                                type="checkbox"
                                                id="confirm_team"
                                                required
                                                className="mt-0.5"
                                            />
                                            <label htmlFor="confirm_team" className="text-[10px] text-slate-400 font-semibold select-none leading-relaxed">
                                                Confirmo que todos los datos ingresados son correctos y deseo guardar los cambios del club.
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {teamStep === 4 && (() => {
                                    const agentesLibres = jugadores.filter(j => !j.equipo_id);
                                    const jugadoresDelEquipo = jugadores.filter(j => j.equipo_id === nuevoEquipoId);
                                    return (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                            {/* Header informativo */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                    <UserPlus className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">Paso Opcional: Agregar Jugadores</h3>
                                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Asigna agentes libres al nuevo equipo o crea uno nuevo</p>
                                                </div>
                                            </div>

                                            {/* Equipo actual: jugadores ya asignados */}
                                            {jugadoresDelEquipo.length > 0 && (
                                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                                                    <p className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider mb-2">
                                                        ✓ Jugadores en el equipo ({jugadoresDelEquipo.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {jugadoresDelEquipo.map(j => (
                                                            <span key={j.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-semibold text-emerald-300">
                                                                #{j.dorsal ?? '—'} {j.nombre_apellido}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Botón crear jugador */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setModalEquipoActivo(null);
                                                    setActiveTab('jugadores');
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded-xl text-orange-400 font-bold text-xs uppercase tracking-wider transition-all duration-200"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Crear Nuevo Jugador
                                            </button>

                                            {/* Lista de agentes libres */}
                                            <div>
                                                <p className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider mb-2">
                                                    Agentes Libres ({agentesLibres.length})
                                                </p>
                                                {agentesLibres.length === 0 ? (
                                                    <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-slate-850">
                                                        <Users className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                                                        <p className="text-xs text-slate-500 font-semibold">No hay agentes libres disponibles</p>
                                                        <p className="text-[10px] text-slate-600 mt-0.5">Crea jugadores desde la sección de Jugadores</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                                                        {agentesLibres.map(jugador => (
                                                            <div
                                                                key={jugador.id}
                                                                className="flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-950/50 hover:bg-slate-950/80 border border-slate-850 hover:border-slate-700 rounded-xl transition-all duration-150 group"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                                                                        <span className="text-[10px] font-extrabold text-slate-300">
                                                                            {jugador.dorsal ?? '?'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-bold text-slate-200 truncate">{jugador.nombre_apellido}</p>
                                                                        <p className="text-[10px] text-slate-500 font-medium">{jugador.categoria || 'Profesional'}</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAsignarAgenteLibre(jugador.id)}
                                                                    disabled={asignandoJugadorId === jugador.id}
                                                                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg text-emerald-400 font-bold text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {asignandoJugadorId === jugador.id ? (
                                                                        <span className="animate-pulse">...</span>
                                                                    ) : (
                                                                        <><UserPlus className="w-3 h-3" /> Agregar</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Buttons */}
                            <div className="p-4 border-t border-slate-800/40 bg-slate-950/20 flex items-center justify-between">
                                {teamStep === 4 ? (
                                    // Paso 4: solo botón de Saltar/Finalizar
                                    <>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Equipo creado exitosamente</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setModalEquipoActivo(null)}
                                            className="py-2.5 px-5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                                        >
                                            Saltar y Cerrar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            disabled={teamStep === 1}
                                            onClick={() => setTeamStep(prev => prev - 1)}
                                            className="py-2.5 px-5 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                                        >
                                            Atrás
                                        </button>

                                        {teamStep < 3 ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (teamStep === 1) {
                                                        if (!formTeam.nombre || !formTeam.entrenador || !formTeam.estadio) {
                                                            showNotification("Por favor rellene todos los campos obligatorios", "warning");
                                                            return;
                                                        }
                                                    }
                                                    setTeamStep(prev => prev + 1);
                                                }}
                                                className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10"
                                            >
                                                Siguiente
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10"
                                            >
                                                {modalEquipoActivo === 'crear' ? 'Registrar Club' : 'Guardar Cambios'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Crear / Editar / Fichar Jugador (Stepper) */}
            {modalJugadorActivo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalJugadorActivo(null)}>
                    <div 
                        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
                            <div>
                                <h2 className="text-md font-bold text-white uppercase tracking-wider">
                                    {modalJugadorActivo === 'crear' ? 'Nuevo Jugador' : 
                                     modalJugadorActivo === 'editar' ? 'Editar Jugador' : 'Asignar / Fichar Jugador'}
                                </h2>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Paso {playerStep} de 3</p>
                            </div>
                            <button 
                                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                onClick={() => setModalJugadorActivo(null)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-950 h-1">
                            <div 
                                className="bg-orange-500 h-1 transition-all duration-350" 
                                style={{ width: `${(playerStep / 3) * 100}%` }}
                            />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitJugador} className="flex-1 flex flex-col overflow-y-auto">
                            <div className="p-6 flex-1 space-y-4">
                                {playerStep === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 1: Información Personal</h3>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-555 text-slate-500 tracking-wider">Nombre y Apellido *</label>
                                            <input
                                                type="text"
                                                name="nombre_apellido"
                                                value={formPlayer.nombre_apellido}
                                                onChange={handlePlayerInputChange}
                                                required
                                                disabled={modalJugadorActivo === 'fichar'}
                                                className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200 disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                )}

                                {playerStep === 2 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 2: Dorsal y equipo asignado</h3>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Número / Dorsal</label>
                                                <input
                                                    type="number"
                                                    name="dorsal"
                                                    value={formPlayer.dorsal}
                                                    required
                                                    onChange={handlePlayerInputChange}
                                                    disabled={modalJugadorActivo === 'fichar'}
                                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200 disabled:opacity-50"
                                                />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Equipo Asignado</label>
                                                <select
                                                    name="equipo_id"
                                                    value={formPlayer.equipo_id}
                                                    onChange={handlePlayerInputChange}
                                                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-orange-500/50 cursor-pointer"
                                                >
                                                    <option value="">-- Agente Libre --</option>
                                                    {equipos.map(eq => (
                                                        <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Temporada Fichaje</label>
                                                <select
                                                    name="temporada_id"
                                                    value={formPlayer.temporada_id}
                                                    onChange={handlePlayerInputChange}
                                                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-orange-500/50 cursor-pointer animate-none"
                                                >
                                                    <option value="" disabled>-- Seleccionar Temporada --</option>
                                                    {temporadas.map(t => (
                                                        <option key={t.id} value={t.id} disabled={t.finalizada || t.id === 1}>{t.nombre} {t.finalizada ? '(Finalizada)' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {playerStep === 3 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 3: Revisión Final</h3>
                                        <div className="bg-slate-950/40 rounded-xl border border-slate-850 p-4 space-y-2.5">
                                            <h4 className="text-[10px] uppercase font-extrabold text-slate-400">Resumen Jugador</h4>
                                            <div className="grid grid-cols-2 gap-y-2 text-xs">
                                                <p className="text-slate-500 font-bold">Nombre:</p>
                                                <p className="text-slate-200 font-semibold">{formPlayer.nombre_apellido}</p>
                                                
                                                <p className="text-slate-500 font-bold">Categoría:</p>
                                                <p className="text-slate-200 font-semibold">{'Profesional'}</p>
                                                
                                                <p className="text-slate-500 font-bold">Dorsal:</p>
                                                <p className="text-slate-200 font-semibold">#{formPlayer.dorsal || '—'}</p>

                                                <p className="text-slate-500 font-bold">Asignación:</p>
                                                <p className="text-orange-500 font-bold">
                                                    {equipos.find(eq => eq.id === Number(formPlayer.equipo_id))?.nombre || 'Agente Libre'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 pt-2">
                                            <input
                                                type="checkbox"
                                                id="confirm_player"
                                                required
                                                className="mt-0.5"
                                            />
                                            <label htmlFor="confirm_player" className="text-[10px] text-slate-400 font-semibold select-none leading-relaxed">
                                                Confirmo que deseo registrar la ficha del jugador con los datos correspondientes.
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="p-4 border-t border-slate-800/40 bg-slate-950/20 flex items-center justify-between">
                                <button
                                    type="button"
                                    disabled={playerStep === 1}
                                    onClick={() => setPlayerStep(prev => prev - 1)}
                                    className="py-2.5 px-5 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                                >
                                    Atrás
                                </button>

                                {playerStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (playerStep === 1) {
                                                if (!formPlayer.nombre_apellido) {
                                                    showNotification("Por favor ingrese el nombre del jugador", "warning");
                                                    return;
                                                }
                                            }
                                            setPlayerStep(prev => prev + 1);
                                        }}
                                        className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10"
                                    >
                                        Siguiente
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10"
                                    >
                                        {modalJugadorActivo === 'crear' ? 'Registrar Jugador' : 
                                         modalJugadorActivo === 'editar' ? 'Guardar Cambios' : 'Confirmar Fichaje'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Crear / Editar Partido (Stepper) */}
            {modalPartidoActivo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalPartidoActivo(null)}>
                    <div 
                        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
                            <div>
                                <h2 className="text-md font-bold text-white uppercase tracking-wider">
                                    {modalPartidoActivo === 'crear' ? 'Nuevo Partido' : 'Editar Partido'}
                                </h2>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Paso {matchStep} de 3</p>
                            </div>
                            <button 
                                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                onClick={() => setModalPartidoActivo(null)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-950 h-1">
                            <div 
                                className="bg-orange-500 h-1 transition-all duration-350" 
                                style={{ width: `${(matchStep / 3) * 100}%` }}
                            />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitPartido} className="flex-1 flex flex-col overflow-y-auto">
                            <div className="p-6 flex-1 space-y-4">
                                {matchStep === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 1: Seleccionar Equipos</h3>
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Equipo Local *</label>
                                                <select
                                                    name="id_equipo_local"
                                                    value={formMatch.id_equipo_local}
                                                    onChange={handleMatchInputChange}
                                                    required
                                                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-orange-500/50 cursor-pointer"
                                                >
                                                    <option value="" disabled>-- Seleccionar Local --</option>
                                                    {equipos.map(eq => (
                                                        <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Equipo Visitante *</label>
                                                <select
                                                    name="id_equipo_visitante"
                                                    value={formMatch.id_equipo_visitante}
                                                    onChange={handleMatchInputChange}
                                                    required
                                                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-orange-500/50 cursor-pointer"
                                                >
                                                    <option value="" disabled>-- Seleccionar Visitante --</option>
                                                    {equipos.map(eq => (
                                                        <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {matchStep === 2 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 2: Configuración del Encuentro</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-555 text-slate-500 tracking-wider">Fecha *</label>
                                                <input
                                                    type="date"
                                                    name="fecha"
                                                    value={formMatch.fecha}
                                                    onChange={handleMatchInputChange}
                                                    required
                                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-555 text-slate-500 tracking-wider">Horario *</label>
                                                <input
                                                    type="time"
                                                    name="horario"
                                                    value={formMatch.horario}
                                                    onChange={handleMatchInputChange}
                                                    required
                                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-555 text-slate-500 tracking-wider">Lugar / Estadio </label>
                                            <input
                                                type="text"
                                                name="lugar"
                                                value={formMatch.lugar}
                                                onChange={handleMatchInputChange}
                                                required
                                                placeholder="(Dejar en blanco para usar el estadio del equipo local)"
                                                className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-555 text-slate-500 tracking-wider">Temporada </label>
                                                <select
                                                    name="temporada_id"
                                                    value={formMatch.temporada_id}
                                                    onChange={handleMatchInputChange}
                                                    required
                                                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-orange-500/50 cursor-pointer animate-none"
                                                >
                                                    <option value="" disabled>-- Seleccionar Temporada --</option>
                                                    {temporadas.map(t => (
                                                        <option key={t.id} value={t.id} disabled={t.finalizada}>{t.nombre} {t.finalizada ? '(Finalizada)' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-555 text-slate-500 tracking-wider">Jornada </label>
                                                <input
                                                    type="number"
                                                    name="jornada"
                                                    value={formMatch.jornada}
                                                    onChange={handleMatchInputChange}
                                                    required
                                                    placeholder="(Dejar en blanco para amistoso)"
                                                    className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none transition-colors duration-200"
                                                />
                                            </div>
                                            
                                        </div>
                                    </div>
                                )}

                                {matchStep === 3 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 3: Confirmación de Detalles</h3>
                                        
                                        <div className="bg-slate-950/40 rounded-xl border border-slate-850 p-4 space-y-2.5">
                                            <h4 className="text-[10px] uppercase font-extrabold text-slate-400">Resumen del Encuentro</h4>
                                            <div className="flex items-center justify-around py-3 border-b border-slate-800/40">
                                                <div className="text-center font-bold text-slate-200 text-sm">
                                                    {equipos.find(eq => eq.id === Number(formMatch.id_equipo_local))?.nombre || 'Local'}
                                                </div>
                                                <span className="text-xs font-black text-orange-500">VS</span>
                                                <div className="text-center font-bold text-slate-200 text-sm">
                                                    {equipos.find(eq => eq.id === Number(formMatch.id_equipo_visitante))?.nombre || 'Visitante'}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-2 text-xs pt-1">
                                                <p className="text-slate-500 font-bold">Fecha / Hora:</p>
                                                <p className="text-slate-200 font-semibold">{formMatch.fecha} a las {formMatch.horario}</p>
                                                
                                                <p className="text-slate-500 font-bold">Estadio / Lugar:</p>
                                                <p className="text-slate-200 font-semibold">{formMatch.lugar}</p>

                                                <p className="text-slate-500 font-bold">Jornada:</p>
                                                <p className="text-slate-200 font-semibold">Jornada {formMatch.jornada}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 pt-2">
                                            <input
                                                type="checkbox"
                                                id="confirm_match"
                                                required
                                                className="mt-0.5"
                                            />
                                            <label htmlFor="confirm_match" className="text-[10px] text-slate-400 font-semibold select-none leading-relaxed">
                                                Confirmo que deseo programar este partido en el calendario oficial de la liga.
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="p-4 border-t border-slate-800/40 bg-slate-950/20 flex items-center justify-between">
                                <button
                                    type="button"
                                    disabled={matchStep === 1}
                                    onClick={() => setMatchStep(prev => prev - 1)}
                                    className="py-2.5 px-5 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                                >
                                    Atrás
                                </button>

                                {matchStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (matchStep === 1) {
                                                if (!formMatch.id_equipo_local || !formMatch.id_equipo_visitante) {
                                                    showNotification("Por favor seleccione ambos equipos", "warning");
                                                    return;
                                                }
                                                if (formMatch.id_equipo_local === formMatch.id_equipo_visitante) {
                                                    showNotification("Un equipo no puede jugar contra sí mismo", "warning");
                                                    return;
                                                }
                                            }
                                            setMatchStep(prev => prev + 1);
                                        }}
                                        className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10"
                                    >
                                        Siguiente
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10"
                                    >
                                        {modalPartidoActivo === 'crear' ? 'Programar Partido' : 'Guardar Cambios'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Finalizar Partido (Stepper) */}
            {modalFinalizarActivo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalFinalizarActivo(false)}>
                    <div 
                        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
                            <div>
                                <h2 className="text-md font-bold text-white uppercase tracking-wider">Finalizar Partido</h2>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Paso {finalizarStep} de 3</p>
                            </div>
                            <button 
                                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                onClick={() => setModalFinalizarActivo(false)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-950 h-1">
                            <div 
                                className="bg-orange-500 h-1 transition-all duration-350" 
                                style={{ width: `${(finalizarStep / 3) * 100}%` }}
                            />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleFinalizarPartidoSubmit} className="flex-1 flex flex-col overflow-y-auto">
                            <div className="p-6 flex-1 space-y-4">
                                {finalizarStep === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 1: Marcador Final</h3>
                                        <div className="grid grid-cols-2 gap-6 bg-slate-950/30 rounded-xl p-4 border border-slate-850">
                                            <div className="space-y-2 text-center">
                                                <label className="text-[10px] uppercase font-bold text-slate-450 text-slate-400 tracking-wider block">Puntos Local ({partidoFinalizar?.local})</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={puntosLocal}
                                                    onChange={(e) => setPuntosLocal(e.target.value)}
                                                    required
                                                    placeholder="0"
                                                    className="w-20 bg-slate-950 border border-slate-800 focus:border-orange-500/50 rounded-xl px-3 py-3 text-center text-lg font-black text-white outline-none mx-auto"
                                                />
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <label className="text-[10px] uppercase font-bold text-slate-450 text-slate-400 tracking-wider block">Puntos Visitante ({partidoFinalizar?.visitante})</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={puntosVisitante}
                                                    onChange={(e) => setPuntosVisitante(e.target.value)}
                                                    required
                                                    placeholder="0"
                                                    className="w-20 bg-slate-950 border border-slate-800 focus:border-orange-500/50 rounded-xl px-3 py-3 text-center text-lg font-black text-white outline-none mx-auto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {finalizarStep === 2 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 2: Anotaciones Individuales</h3>
                                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Asigna los puntos de los jugadores de cada equipo. La suma de estos debe coincidir con el marcador final del paso 1.</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                                            {/* Local Team */}
                                            <div className="space-y-3 bg-slate-950/20 rounded-xl p-3 border border-slate-850">
                                                <h4 className="text-[10px] uppercase font-extrabold text-orange-500 tracking-wider border-b border-slate-850 pb-1.5">{partidoFinalizar?.local}</h4>
                                                <div className="space-y-2">
                                                    {jugadoresPartido.filter(j => j.equipo_id === partidoFinalizar?.id_equipo_local).length > 0 ? (
                                                        jugadoresPartido.filter(j => j.equipo_id === partidoFinalizar?.id_equipo_local).map(j => (
                                                            <div key={j.id} className="flex items-center justify-between text-xs">
                                                                <span className="font-semibold text-slate-300 truncate pr-2">{j.nombre_apellido}</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={anotaciones.find(a => a.jugador_id === j.id)?.puntos || ''}
                                                                    onChange={(e) => handleAnotacionChange(j.id, e.target.value)}
                                                                    placeholder="0"
                                                                    className="w-14 bg-slate-950 border border-slate-850 focus:border-orange-555 rounded-lg px-2 py-1 text-center font-bold text-slate-200"
                                                                />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-[10px] text-slate-500 italic">No hay jugadores registrados.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Visitante Team */}
                                            <div className="space-y-3 bg-slate-950/20 rounded-xl p-3 border border-slate-850">
                                                <h4 className="text-[10px] uppercase font-extrabold text-orange-500 tracking-wider border-b border-slate-850 pb-1.5">{partidoFinalizar?.visitante}</h4>
                                                <div className="space-y-2">
                                                    {jugadoresPartido.filter(j => j.equipo_id === partidoFinalizar?.id_equipo_visitante).length > 0 ? (
                                                        jugadoresPartido.filter(j => j.equipo_id === partidoFinalizar?.id_equipo_visitante).map(j => (
                                                            <div key={j.id} className="flex items-center justify-between text-xs">
                                                                <span className="font-semibold text-slate-300 truncate pr-2">{j.nombre_apellido}</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={anotaciones.find(a => a.jugador_id === j.id)?.puntos || ''}
                                                                    onChange={(e) => handleAnotacionChange(j.id, e.target.value)}
                                                                    placeholder="0"
                                                                    className="w-14 bg-slate-950 border border-slate-850 focus:border-orange-555 rounded-lg px-2 py-1 text-center font-bold text-slate-200"
                                                                />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-[10px] text-slate-500 italic">No hay jugadores registrados.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {finalizarStep === 3 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider">Paso 3: Revisión y Confirmación</h3>
                                        
                                        {(() => {
                                            const sumaLocal = anotaciones
                                                .filter(a => jugadoresPartido.find(j => j.id === a.jugador_id)?.equipo_id === partidoFinalizar?.id_equipo_local)
                                                .reduce((s, a) => s + a.puntos, 0);

                                            const sumaVisitante = anotaciones
                                                .filter(a => jugadoresPartido.find(j => j.id === a.jugador_id)?.equipo_id === partidoFinalizar?.id_equipo_visitante)
                                                .reduce((s, a) => s + a.puntos, 0);

                                            const coincideLocal = sumaLocal === Number(puntosLocal);
                                            const coincideVisitante = sumaVisitante === Number(puntosVisitante);
                                            const puedeEnviar = coincideLocal && coincideVisitante;

                                            return (
                                                <div className="space-y-4">
                                                    <div className="bg-slate-950/40 rounded-xl border border-slate-850 p-4 space-y-3">
                                                        <h4 className="text-[10px] uppercase font-extrabold text-slate-400 border-b border-slate-850 pb-1 mb-1">Verificación de Puntos</h4>
                                                        
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-semibold text-slate-300">{partidoFinalizar?.local} (Local):</span>
                                                            <span className={`font-bold ${coincideLocal ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                Suma: {sumaLocal} / Marcador: {puntosLocal} {coincideLocal ? '✓' : '✗'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-semibold text-slate-300">{partidoFinalizar?.visitante} (Visitante):</span>
                                                            <span className={`font-bold ${coincideVisitante ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                Suma: {sumaVisitante} / Marcador: {puntosVisitante} {coincideVisitante ? '✓' : '✗'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {!puedeEnviar && (
                                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-semibold leading-relaxed flex items-start gap-2 animate-pulse">
                                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                            <span>La suma de los puntos individuales no coincide con el marcador final del partido. Regresa al Paso 2 para corregirlos.</span>
                                                        </div>
                                                    )}

                                                    {puedeEnviar && (
                                                        <div className="flex items-start gap-2.5 pt-2">
                                                            <input
                                                                type="checkbox"
                                                                id="confirm_finalizar"
                                                                required
                                                                className="mt-0.5"
                                                            />
                                                            <label htmlFor="confirm_finalizar" className="text-[10px] text-slate-400 font-semibold select-none leading-relaxed">
                                                                Confirmo que los marcadores y las estadísticas individuales son correctos y deseo finalizar el encuentro.
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="p-4 border-t border-slate-800/40 bg-slate-950/20 flex items-center justify-between">
                                <button
                                    type="button"
                                    disabled={finalizarStep === 1}
                                    onClick={() => setFinalizarStep(prev => prev - 1)}
                                    className="py-2.5 px-5 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                                >
                                    Atrás
                                </button>

                                {finalizarStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (finalizarStep === 1) {
                                                if (puntosLocal === '' || puntosVisitante === '') {
                                                    showNotification("Por favor ingrese el marcador del partido", "warning");
                                                    return;
                                                }
                                            }
                                            setFinalizarStep(prev => prev + 1);
                                        }}
                                        className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10"
                                    >
                                        Siguiente
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={
                                            anotaciones
                                                .filter(a => jugadoresPartido.find(j => j.id === a.jugador_id)?.equipo_id === partidoFinalizar?.id_equipo_local)
                                                .reduce((s, a) => s + a.puntos, 0) !== Number(puntosLocal) ||
                                            anotaciones
                                                .filter(a => jugadoresPartido.find(j => j.id === a.jugador_id)?.equipo_id === partidoFinalizar?.id_equipo_visitante)
                                                .reduce((s, a) => s + a.puntos, 0) !== Number(puntosVisitante)
                                        }
                                        className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10 disabled:opacity-50"
                                    >
                                        Finalizar Encuentro
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
};

// Componente secundario para la asignación de equipos
const TeamAssignmentList = ({ allTeams, initiallySelected, filterQuery, onSave, onCancel }) => {
    const [selectedIds, setSelectedIds] = useState(initiallySelected);

    const filteredTeams = allTeams.filter(team =>
        team.nombre.toLowerCase().includes(filterQuery.toLowerCase())
    );

    const handleToggleTeam = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                <span>Equipos en la lista: <strong className="text-slate-200">{filteredTeams.length}</strong></span>
                <span>Seleccionados: <strong className="text-orange-500 font-extrabold">{selectedIds.length}</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                {filteredTeams.length > 0 ? (
                    filteredTeams.map(team => {
                        const isChecked = selectedIds.includes(team.id);
                        return (
                            <div
                                key={team.id}
                                className={`flex items-center gap-3 p-3 rounded-xl bg-slate-950/20 border border-slate-850 hover:bg-slate-800/10 cursor-pointer select-none transition-all duration-200 ${isChecked ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                                onClick={() => handleToggleTeam(team.id)}
                            >
                                <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-700 bg-slate-950/60'}`}>
                                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                                </div>
                                
                                <div className="w-7 h-7 rounded-full bg-white p-0.5 flex items-center justify-center flex-shrink-0">
                                    {team.logo ? (
                                        <img src={`http://localhost:5000${team.logo}`} alt="" className="w-5 h-5 object-contain" />
                                    ) : (
                                        <span className="text-xs">🏀</span>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-slate-200 truncate">{team.nombre}</span>
                            </div>
                        );
                    })
                ) : (
                    <p className="col-span-2 text-center text-xs text-slate-500 italic py-8">
                        No se encontraron equipos para la búsqueda.
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/40">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={() => onSave(selectedIds)}
                    className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10"
                >
                    Confirmar Cambios
                </button>
            </div>
        </div>
    );
};

export default Admin;