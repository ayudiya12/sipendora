import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertCircle, CheckCircle2, X, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => n.isRead === 0).length);
        } catch (err) {
            toast.error("Gagal memuat notifikasi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            toast.error("Gagal menandai baca");
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            fetchNotifications();
            toast.success("Semua notifikasi ditandai baca");
        } catch (err) {
            toast.error("Gagal menandai semua baca");
        }
    };

    const deleteNotification = async (id) => {
        if (!window.confirm("Hapus notifikasi ini?")) return;
        try {
            await api.delete(`/notifications/${id}`);
            fetchNotifications();
            toast.success("Notifikasi dihapus");
        } catch (err) {
            toast.error("Gagal menghapus notifikasi");
        }
    };

    const deleteAllRead = async () => {
        if (!window.confirm("Hapus semua notifikasi yang sudah dibaca?")) return;
        try {
            await api.delete('/notifications/read');
            fetchNotifications();
            toast.success("Notifikasi dibaca dihapus");
        } catch (err) {
            toast.error("Gagal menghapus notifikasi");
        }
    };

    const typeIcons = {
        'INFO': <Info size={16} className="text-blue-500" />,
        'SUCCESS': <CheckCircle2 size={16} className="text-emerald-500" />,
        'WARNING': <AlertCircle size={16} className="text-amber-500" />,
        'DANGER': <X size={16} className="text-red-500" />
    };

    const typeColors = {
        'INFO': 'bg-blue-50 border-blue-100',
        'SUCCESS': 'bg-emerald-50 border-emerald-100',
        'WARNING': 'bg-amber-50 border-amber-100',
        'DANGER': 'bg-red-50 border-red-100'
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <MainLayout title="Notifikasi">
            <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} /> Kembali
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tightest">Notifikasi</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {unreadCount} Belum dibaca
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all flex items-center gap-2"
                                >
                                    <Check size={14} /> Tandai Semua Baca
                                </button>
                            )}
                            {notifications.some(n => n.isRead === 1) && (
                                <button
                                    onClick={deleteAllRead}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Hapus Dibaca
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notification List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 px-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                            <Bell size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak ada notifikasi</p>
                        <p className="text-xs text-slate-300 mt-2">Anda akan menerima notifikasi di sini</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {notifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    onClick={() => notification.isRead === 0 && markAsRead(notification.id)}
                                    className={`p-4 lg:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${
                                        notification.isRead === 0 
                                            ? 'bg-white border-primary-200 shadow-md' 
                                            : 'bg-slate-50 border-slate-100'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl shrink-0 flex items-center justify-center border ${typeColors[notification.type]}`}>
                                            {typeIcons[notification.type]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <h3 className={`text-sm lg:text-base font-black tracking-tight ${
                                                    notification.isRead === 0 ? 'text-slate-900' : 'text-slate-500'
                                                }`}>
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase whitespace-nowrap">
                                                        {formatDate(notification.createdAt)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="p-1 hover:bg-red-50 rounded-lg transition-colors text-slate-300 hover:text-red-500"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className={`text-xs leading-relaxed ${
                                                notification.isRead === 0 ? 'text-slate-600 font-medium' : 'text-slate-400'
                                            }`}>
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                    {notification.isRead === 0 && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-primary-500 rounded-full" />
                                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Belum dibaca</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Notifications;
