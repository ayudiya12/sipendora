import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, ClipboardList, MapPin, 
    TrendingUp, Clock, CheckCircle2, AlertCircle,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Activity, Info, CalendarDays } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalBooking: 0,
        pending: 0,
        confirmed: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/bookings/my');
                const bookings = res.data;
                setRecentBookings(bookings.slice(0, 5));
                
                setStats({
                    totalBooking: bookings.length,
                    pending: bookings.filter(b => b.status_booking === 'PENDING').length,
                    confirmed: bookings.filter(b => b.status_booking === 'CONFIRMED').length
                });
            } catch (err) {
                console.error("Gagal memuat data dashboard");
            } finally {
                setLoading(false);
            }
        };

        const showLoginNotifs = async () => {
            const hasShown = sessionStorage.getItem('notif_shown');
            if (hasShown) return;

            try {
                const res = await api.get('/notifications');
                // Ambil 4 notifikasi terbaru yang belum dibaca
                const latestNotifs = res.data.filter(n => n.isRead === 0).slice(0, 4);
                
                if (latestNotifs.length > 0) {
                    latestNotifs.forEach((notif, index) => {
                        setTimeout(() => {
                            toast(notif.message, {
                                icon: notif.type === 'SUCCESS' ? '✅' : '🔔',
                                duration: 4000,
                                style: {
                                    border: '1px solid #E2E8F0',
                                    padding: '16px',
                                    color: '#0F172A',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '800'
                                }
                            });
                        }, index * 1000);
                    });
                }
                sessionStorage.setItem('notif_shown', 'true');
            } catch (err) {
                console.error("Gagal memuat notifikasi login");
            }
        };

        fetchDashboardData();
        showLoginNotifs();
    }, []);

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-primary-600 p-5 lg:p-8 rounded-3xl lg:rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4 lg:gap-6">
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                <Icon className="size-6 lg:size-7" />
            </div>
            <div>
                <p className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-widest mb-0.5 lg:mb-1">{label}</p>
                <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tightest leading-none">{value}</p>
            </div>
        </div>
    );

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-5 lg:px-6 py-6 lg:py-10 space-y-8 lg:space-y-12 pb-20">
                {/* Welcome Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tightest leading-none uppercase">Halo, {user?.nama}!</h1>
                        <p className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mt-3 lg:mt-4 italic flex items-center justify-center lg:justify-start gap-2">
                            <Activity size={14} className="text-primary-500" /> Semangat olahraga hari ini!
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/facilities')}
                        className="w-full lg:w-auto px-8 lg:px-10 py-4 lg:py-5 bg-slate-900 text-white rounded-2xl lg:rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-glow-primary transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl"
                    >
                        <MapPin size={18} />
                        Lihat Lapangan
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard icon={ClipboardList} label="Total Pesanan" value={stats.totalBooking} color="bg-primary-900" />
                    <StatCard icon={Clock} label="Menunggu Bayar" value={stats.pending} color="bg-amber-500" />
                    <StatCard icon={CheckCircle2} label="Pesanan Sukses" value={stats.confirmed} color="bg-emerald-500" />
                </div>

                {/* Quick Activities & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                    {/* Welcome Card */}
                    <div className="bg-slate-900 rounded-3xl lg:rounded-[3.5rem] p-8 lg:p-12 text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
                        <div className="absolute top-0 right-0 w-64 lg:w-80 h-64 lg:h-80 bg-primary-600/20 rounded-full -mr-10 lg:-mr-20 -mt-10 lg:-mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-white/10 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-6 lg:mb-10 border border-white/10">
                                <Info size={14} className="text-primary-400" /> Tips Olahraga
                            </span>
                            <h3 className="text-3xl lg:text-4xl font-black text-slate-100 tracking-tightest leading-tight mb-4 lg:mb-6">Ingin Bermain <br className="hidden lg:block" /> Hari Ini?</h3>
                            <p className="text-xs lg:text-sm text-slate-400 font-medium leading-relaxed mb-8 lg:mb-12 max-w-sm">
                                Temukan lapangan yang tersedia dan lakukan reservasi instan.
                            </p>
                            <button 
                                onClick={() => navigate('/facilities')}
                                className="w-full lg:w-auto flex items-center justify-center gap-4 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] bg-white text-slate-900 px-8 lg:px-10 py-4 lg:py-5 rounded-xl lg:rounded-2xl hover:bg-primary-600 hover:text-white transition-all active:scale-95 shadow-xl"
                            >
                                Cari Sekarang <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Booking Progress Tracker */}
                    <div className="bg-primary-50 rounded-3xl lg:rounded-[3.5rem] p-8 lg:p-12 border border-primary-500 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tightest">Pesanan Aktif</h3>
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary-600"><ClipboardList size={20} /></div>
                            </div>
                            <p className="text-[11px] lg:text-xs text-slate-500 font-medium mb-8 lg:mb-10">Pantau progres reservasi terbaru Anda.</p>

                            <div className="space-y-4 lg:space-y-5">
                                {recentBookings.length > 0 ? (
                                    <div className="p-4 lg:p-6 bg-primary-500 rounded-2xl lg:rounded-[2rem] text-slate-100 flex items-center justify-between group hover:bg-primary-700 transition-all">
                                        <div className="flex items-center gap-4 lg:gap-5">
                                            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-primary-900 shadow-sm shrink-0">
                                                <CalendarDays size={20} className="md:size-15" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm lg:text-base font-black text-slate-800 tracking-tight truncate">{recentBookings[0].nama_fasilitas}</p>
                                                <div className="text-[9px] lg:text-[10px] font-black text-slate-800 uppercase tracking-widest mt-1 flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${recentBookings[0].status_booking === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    {recentBookings[0].status_booking}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/bookings')}
                                            className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all flex items-center justify-center shrink-0"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>  
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center text-slate-300">
                                        <AlertCircle size={48} className="mb-4 opacity-20" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Tidak ada pesanan aktif</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-10">
                            <button
                                onClick={() => navigate('/bookings')}
                                className="w-full py-5 bg-emerald-500 text-slate-800 hover:bg-emerald-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                                Lihat Semua Pesanan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
