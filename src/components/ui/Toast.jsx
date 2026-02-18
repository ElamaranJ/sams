import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
    const [progress, setProgress] = React.useState(100);

    React.useEffect(() => {
        if (duration) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev <= 0) {
                        clearInterval(interval);
                        onClose?.();
                        return 0;
                    }
                    return prev - (100 / (duration / 100));
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [duration, onClose]);

    const variants = {
        success: {
            icon: CheckCircle,
            gradient: 'from-green-500 to-emerald-600',
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            iconColor: 'text-green-600'
        },
        error: {
            icon: AlertCircle,
            gradient: 'from-red-500 to-rose-600',
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            iconColor: 'text-red-600'
        },
        warning: {
            icon: AlertTriangle,
            gradient: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-800',
            iconColor: 'text-amber-600'
        },
        info: {
            icon: Info,
            gradient: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            iconColor: 'text-blue-600'
        }
    };

    const config = variants[type] || variants.info;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`${config.bg} ${config.border} border-2 rounded-2xl shadow-xl overflow-hidden min-w-[320px] max-w-md`}
        >
            <div className="p-4 flex items-start gap-3">
                <div className={`p-2 rounded-xl ${config.bg} ${config.iconColor}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <p className={`font-semibold text-sm ${config.text}`}>{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className={`${config.iconColor} hover:opacity-70 transition-opacity p-1`}
                >
                    <X size={18} />
                </button>
            </div>
            {duration && (
                <div className="h-1 bg-white/50">
                    <motion.div
                        className={`h-full bg-gradient-to-r ${config.gradient}`}
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                    />
                </div>
            )}
        </motion.div>
    );
};

// Toast Container Component
export const ToastContainer = ({ toasts = [], removeToast }) => {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Hook for using toasts
export const useToast = () => {
    const [toasts, setToasts] = React.useState([]);

    const addToast = React.useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = React.useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
};

export default Toast;
