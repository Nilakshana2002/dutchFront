import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ICONS = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
};

const STYLES = {
    success: 'bg-emerald-600 shadow-emerald-500/30',
    error: 'bg-red-600 shadow-red-500/30',
    info: 'bg-teal-600 shadow-teal-500/30',
};

const Toast = ({ message, type = 'success', onClose }) => {
    const Icon = ICONS[type] || Info;

    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div
            className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-xl ${STYLES[type]} animate-fadeIn`}
            style={{ animation: 'fadeInDown 0.3s ease' }}
        >
            <Icon size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={onClose}
                className="ml-2 p-0.5 rounded-md hover:bg-white/20 transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default Toast;
