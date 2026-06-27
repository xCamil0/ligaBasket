import React, { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [confirmData, setConfirmData] = useState(null); // { title, message, resolve }

    // Mostrar una notificación de tipo success, error, warning, info
    const showNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto eliminar después de 4.5 segundos
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4500);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Función de confirmación personalizada que devuelve una Promesa (reemplazo de window.confirm)
    const confirm = useCallback((title, message) => {
        return new Promise((resolve) => {
            setConfirmData({
                title,
                message,
                resolve: (value) => {
                    resolve(value);
                    setConfirmData(null);
                }
            });
        });
    }, []);

    // Helper para renderizar los iconos de notificación
    const renderIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
        }
    };

    // Helper para obtener el color de borde/fondo según el tipo de notificación
    const getNotificationStyles = (type) => {
        switch (type) {
            case 'success':
                return 'border-emerald-500/20 bg-slate-900/95 shadow-emerald-950/10';
            case 'error':
                return 'border-red-500/20 bg-slate-900/95 shadow-red-950/10';
            case 'warning':
                return 'border-orange-500/20 bg-slate-900/95 shadow-orange-950/10';
            case 'info':
            default:
                return 'border-blue-500/20 bg-slate-900/95 shadow-blue-950/10';
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification, confirm }}>
            {children}

            {/* Contenedor de Toasts (Notificaciones en esquina superior derecha) */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm sm:max-w-md pointer-events-none px-4 sm:px-0">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border bg-slate-950/80 backdrop-blur-md shadow-2xl transition-all duration-300 animate-toast-in ${getNotificationStyles(n.type)}`}
                    >
                        {renderIcon(n.type)}
                        <div className="flex-grow">
                            <p className="text-xs font-semibold text-slate-200 leading-relaxed pr-2 whitespace-pre-line">
                                {n.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeNotification(n.id)}
                            className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 p-0.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-400"
                            aria-label="Cerrar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal de Confirmación Personalizado */}
            {confirmData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
                    <div 
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-slate-950/80 transform animate-modal-in relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow decorativo de fondo */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

                        {/* Contenido */}
                        <div className="flex gap-4 items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                                <AlertTriangle className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-white mb-1.5 font-sans leading-snug">
                                    {confirmData.title}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    {confirmData.message}
                                </p>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => confirmData.resolve(false)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-750 hover:border-slate-700 text-slate-300 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => confirmData.resolve(true)}
                                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-slate-950 hover:text-black shadow-lg shadow-orange-500/10 rounded-xl font-extrabold text-[11px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
