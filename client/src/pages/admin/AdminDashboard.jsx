import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Calendar, CreditCard, Clock, 
    ShieldCheck, AlertCircle,
    Activity, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import DataTable from '../../components/ui/DataTable';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-500 border border-primary-400/30 p-4 md:px-8 rounded-3xl md:rounded-[2.5rem] shadow-md shadow-primary-900/20 hover:shadow-xl hover:shadow-primary-900/30 transition-all duration-300"
    >
        <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${color} shadow-lg`}>
                <Icon size={20} className="md:w-6 md:h-6 text-white" />
            </div>
            <p className="text-primary-100 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{title}</p>
        </div>
        <h5 className="text-xl md:text-2xl font-black text-white tracking-tightest break-words leading-tight" title={value}>{value}</h5>
    </motion.div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeUsers: 0,
        pendingVerifications: 0,
        revenue: 0
    });
    const [pendingPayments, setPendingPayments] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await api.get('/bookings/admin/dashboard-stats');
                setStats(response.data.stats);
                setPendingPayments(response.data.pendingPayments);
                setLogs(response.data.logs);
            } catch (err) {
                console.error("Gagal memuat data admin:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const formatIDR = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    const pendingColumns = useMemo(() => [
        {
            header: 'Penyewa',
            accessorKey: 'user',
            cell: info => <span className="font-bold text-slate-800 text-xs">{info.getValue()}</span>
        },
        {
            header: 'Fasilitas',
            accessorKey: 'facility',
            cell: info => (
                <div>
                    <span className="block font-bold text-slate-800 text-xs">{info.getValue()}</span>
                    <span className="text-[9px] text-slate-400">{new Date(info.row.original.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: () => (
                <span className="px-2 py-1 bg-secondary-500/10 text-secondary-600 border border-secondary-200 rounded-lg text-[8px] font-black uppercase tracking-wider">
                    Verifikasi
                </span>
            )
        },
        {
            header: 'Aksi',
            cell: () => (
                <button 
                    onClick={() => navigate('/admin/bookings')}
                    className="p-2 bg-slate-900 text-white rounded-lg hover:bg-primary-600 transition-all active:scale-90"
                >
                    <ArrowRight size={14} />
                </button>
            )
        }
    ], [navigate]);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tightest leading-none uppercase">Dashboard Admin</h1>
                    <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 md:mt-3 italic">Monitor operasional dan verifikasi sistem</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 md:px-4 md:py-2 bg-emerald-50 border border-emerald-100 rounded-lg md:rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sistem Online</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                <StatCard title="Total Booking" value={stats.totalBookings} icon={Calendar} color="bg-white/20 text-white" />
                <StatCard title="Verifikasi Pembayaran" value={stats.pendingVerifications} icon={Clock} color="bg-amber-400 text-amber-700" />
                <StatCard title="Pengguna Aktif" value={stats.activeUsers} icon={Users} color="bg-accent-400/20 text-white" />
                <StatCard title="Total Pendapatan" value={formatIDR(stats.revenue)} icon={CreditCard} color="bg-emerald-400 text-emerald-700" />
            </div>

            {/* Operational Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
                {/* Pending Verifications */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 md:gap-3">
                            <ShieldCheck size={20} className="text-primary-600 md:w-6 md:h-6" />
                            Verifikasi Pembayaran
                        </h2>
                        <button 
                            onClick={() => navigate('/admin/bookings')}
                            className="text-[9px] md:text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                        >
                            Lihat Semua
                        </button>
                    </div>
                    
                    <DataTable 
                        columns={pendingColumns} 
                        data={pendingPayments} 
                        loading={loading} 
                    />
                </div>

                {/* System Activity */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 md:gap-3 px-1">
                        <Activity size={20} className="text-primary-600 md:w-6 md:h-6" />
                        Log Sistem
                    </h2>
                    <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-800 shadow-lg shadow-slate-900/50 space-y-6">
                        {logs.length > 0 ? logs.map((log, i) => (
                            <div key={i} className="flex gap-4 items-start border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                                <span className="text-[10px] font-black text-slate-500 uppercase shrink-0">{log.time}</span>
                                <p className="text-xs font-bold text-slate-300 line-clamp-2">{log.msg}</p>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-500 text-center py-4">Belum ada aktivitas hari ini</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
