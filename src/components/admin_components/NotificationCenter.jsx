import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, deleteReadNotifications } from '../../utils/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NotificationCenter = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        loadNotifications();
        // Poll every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await fetchNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkRead = async (id, e) => {
        if (e) e.preventDefault();
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setLoading(true);
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.preventDefault();
        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleDeleteRead = async () => {
        try {
            setLoading(true);
            await deleteReadNotifications();
            setNotifications(prev => prev.filter(n => !n.read));
        } catch (error) {
            console.error('Error deleting read notifications:', error);
        } finally {
            setLoading(false);
        }
    };


    const getIcon = (type) => {
        switch (type) {
            case 'NEW_BOOKING': return <CheckCircle className="text-teal-500" size={18} />;
            case 'BOOKING_CANCELLED': return <AlertCircle className="text-red-500" size={18} />;
            default: return <Info className="text-blue-500" size={18} />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.round(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-navy-400 hover:text-navy-900 transition-colors focus:outline-none bg-white rounded-full shadow-sm border border-navy-100"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-navy-100 z-[999] overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-navy-50 flex justify-between items-center bg-white">
                        <h3 className="font-bold text-navy-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={loading}
                                className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 transition flex items-center gap-1 disabled:opacity-50"
                            >
                                <Check size={12} /> Mark all read
                            </button>
                        )}
                        {notifications.some(n => n.read) && (
                            <button
                                onClick={handleDeleteRead}
                                disabled={loading}
                                className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition flex items-center gap-1 ml-3 disabled:opacity-50"
                            >
                                <X size={12} /> Delete read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-navy-400">
                                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-navy-50/50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 transition-colors ${notif.read ? 'bg-white opacity-70' : 'bg-blue-50/30'}`}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className="mt-0.5 flex-shrink-0">{getIcon(notif.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm tracking-tight ${notif.read ? 'text-navy-700' : 'text-navy-900 font-bold'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-navy-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[10px] text-navy-400 font-medium">
                                                        {formatTime(notif.createdAt)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {notif.link && (
                                                            <Link
                                                                to={user?.role === 'receptionist' && notif.link === '/admin/bookings' ? '/receptionist/bookings' : notif.link}
                                                                onClick={() => setIsOpen(false)}
                                                                className="text-[10px] bg-navy-50 text-navy-600 px-2 py-1 rounded-md hover:bg-navy-100 font-medium transition"
                                                            >
                                                                View
                                                            </Link>
                                                        )}
                                                        {!notif.read && (
                                                            <button
                                                                onClick={(e) => handleMarkRead(notif._id, e)}
                                                                className="text-navy-300 hover:text-teal-500 transition-colors p-1"
                                                                title="Mark as read"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(notif._id, e)}
                                                            className="text-navy-300 hover:text-red-500 transition-colors p-1 ml-1"
                                                            title="Delete"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
