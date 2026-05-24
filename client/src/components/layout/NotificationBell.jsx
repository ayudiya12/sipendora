import { useState, useEffect, Fragment } from 'react';
import { Bell, X, Check, Info, AlertCircle, CheckCircle2, ArrowRight, BellOff } from 'lucide-react';
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const NotificationBell = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => n.isRead === 0).length);
        } catch (err) {
            console.error("Gagal memuat notifikasi");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error("Gagal menandai baca");
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            fetchNotifications();
        } catch (err) {
            console.error("Gagal menandai baca");
        }
    };

    const typeConfig = {
        INFO:    { icon: <Info size={13} />,         bg: 'bg-blue-50',    text: 'text-blue-500',    dot: 'bg-blue-400' },
        SUCCESS: { icon: <CheckCircle2 size={13} />, bg: 'bg-emerald-50', text: 'text-emerald-500', dot: 'bg-emerald-400' },
        WARNING: { icon: <AlertCircle size={13} />,  bg: 'bg-amber-50',   text: 'text-amber-500',   dot: 'bg-amber-400' },
        DANGER:  { icon: <X size={13} />,            bg: 'bg-red-50',     text: 'text-red-500',     dot: 'bg-red-400' },
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1)   return 'Baru saja';
        if (diffMins < 60)  return `${diffMins}m lalu`;
        if (diffHours < 24) return `${diffHours}j lalu`;
        if (diffDays < 7)   return `${diffDays}h lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <Menu as="div" className="relative">
            {/* Bell Button */}
            <MenuButton className="relative p-2 sm:p-2.5 text-text-secondary hover:bg-surface-muted rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </MenuButton>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95 translate-y-1"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-1"
            >
                {/* 
                    FIX UTAMA:
                    - Mobile: fixed, posisi tepat di bawah header (top-[68px]),
                      lebar penuh dengan margin kiri-kanan
                    - Desktop: absolute, anchored ke kanan button
                    - Tidak ada lagi top-1/2 + -translate-y-1/2 yang menyebabkan terpotong
                */}
                <MenuItems className="
                    fixed top-[68px] left-3 right-3 z-[100]
                    lg:absolute lg:top-auto lg:left-auto lg:right-0 lg:mt-3
                    w-auto lg:w-96
                    origin-top-right
                    rounded-2xl lg:rounded-3xl
                    bg-white
                    shadow-xl lg:shadow-2xl
                    ring-1 ring-black/5
                    border border-slate-100
                    overflow-hidden
                    focus:outline-none
                ">
                    {/* Header Panel */}
                    <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                                <Bell size={14} className="text-primary-600" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Notifikasi</h3>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    {unreadCount > 0 ? (
                                        <span className="text-primary-500 font-black">{unreadCount} belum dibaca</span>
                                    ) : (
                                        'Semua sudah dibaca'
                                    )}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="shrink-0 flex items-center gap-1 text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-wider transition-colors px-2.5 py-1.5 rounded-lg hover:bg-primary-50 active:scale-95"
                            >
                                <Check size={11} />
                                <span className="hidden sm:inline">Tandai Baca</span>
                                <span className="sm:hidden">Baca</span>
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[55vh] sm:max-h-[360px] overflow-y-auto overscroll-contain">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {notifications.slice(0, 5).map((n) => {
                                    const cfg = typeConfig[n.type] ?? typeConfig.INFO;
                                    return (
                                        <MenuItem key={n.id}>
                                            {({ focus }) => (
                                                <button
                                                    onClick={() => {
                                                        if (n.isRead === 0) markAsRead(n.id);
                                                        navigate('/notifications');
                                                    }}
                                                    className={`
                                                    w-full text-left px-4 sm:px-5 py-3.5 sm:py-4
                                                    flex items-start gap-3
                                                    transition-colors duration-150
                                                    ${focus ? 'bg-slate-50' : ''}
                                                    ${n.isRead === 0 ? 'bg-primary-50/40' : 'bg-white'}
                                                    active:bg-slate-100
                                                `}>
                                                    {/* Icon */}
                                                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center ${cfg.bg} ${cfg.text} mt-0.5`}>
                                                        {cfg.icon}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-0.5">
                                                            <h4 className={`text-[11px] sm:text-xs font-bold leading-tight truncate ${n.isRead === 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                                                                {n.title}
                                                            </h4>
                                                            <span className="shrink-0 text-[9px] sm:text-[10px] text-slate-300 font-semibold">
                                                                {formatTime(n.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[10px] sm:text-[11px] leading-relaxed line-clamp-2 ${n.isRead === 0 ? 'text-slate-600' : 'text-slate-400'}`}>
                                                            {n.message}
                                                        </p>
                                                    </div>

                                                    {/* Unread dot */}
                                                    {n.isRead === 0 && (
                                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${cfg.dot}`} />
                                                    )}
                                                </button>
                                            )}
                                        </MenuItem>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-10 sm:py-12 flex flex-col items-center justify-center text-center px-6">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                                    <BellOff size={20} className="text-slate-300" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada notifikasi</p>
                                <p className="text-[10px] text-slate-300 mt-1">Kamu sudah up-to-date!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 sm:px-5 py-3 bg-slate-50/80 border-t border-slate-100">
                            <MenuItem>
                                {({ focus }) => (
                                    <button
                                        onClick={() => navigate('/notifications')}
                                        className={`w-full flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-black text-primary-600 uppercase tracking-widest transition-colors py-0.5 ${focus ? 'text-primary-700' : ''}`}
                                    >
                                        Lihat Semua Notifikasi <ArrowRight size={11} />
                                    </button>
                                )}
                            </MenuItem>
                        </div>
                    )}
                </MenuItems>
            </Transition>
        </Menu>
    );
};

export default NotificationBell;