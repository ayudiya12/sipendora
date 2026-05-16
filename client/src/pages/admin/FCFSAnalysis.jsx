import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { 
    Activity, Clock, TrendingUp, BarChart3,
    Info, Calendar, Calculator, X, Eye, User
} from 'lucide-react';
import MainLayout from "../../components/layout/MainLayout";
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../components/ui/DataTable';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import DataListCard, { DataListCardHeader, DataListCardMeta, DataListCardFooter } from '../../components/ui/DataListCard';

const CalculationModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const formatDate = (date) => new Date(date).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500 rounded-xl">
                                <Calculator size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight">Detail Waktu Antrean</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Perhitungan Waktu Penggunaan</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Variables Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Datang</p>
                                <p className="text-[11px] font-bold text-slate-700">{formatDate(data.arrival_time)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Durasi Sewa</p>
                                <p className="text-[11px] font-bold text-slate-700">{data.burst_time} Menit</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Mulai</p>
                                <p className="text-[11px] font-bold text-slate-700">{formatDate(data.start_time)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Selesai</p>
                                <p className="text-[11px] font-bold text-slate-700">{formatDate(data.completion_time)}</p>
                            </div>
                        </div>

                        {/* Calculation Steps */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                                Langkah Perhitungan
                            </h4>
                            
                            <div className="space-y-3">
                                {/* Step 1: CT */}
                                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-primary-900 uppercase">1. Waktu Selesai</span>
                                        <span className="text-[9px] font-bold text-primary-600 italic">Mulai + Durasi</span>
                                    </div>
                                    <p className="text-xs text-primary-800 font-medium leading-relaxed">
                                        {new Date(data.start_time).toLocaleTimeString()} + {data.burst_time} menit = <span className="font-black">{new Date(data.completion_time).toLocaleTimeString()}</span>
                                    </p>
                                </div>

                                {/* Step 2: TAT */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-slate-900 uppercase">2. Total Waktu Proses</span>
                                        <span className="text-[9px] font-bold text-slate-400 italic">Selesai - Datang</span>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Selesai ({new Date(data.completion_time).toLocaleTimeString()}) - Datang ({new Date(data.arrival_time).toLocaleTimeString()}) = <span className="font-black text-slate-900">{data.turnaround_time} Menit</span>
                                    </p>
                                </div>

                                {/* Step 3: WT */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-slate-900 uppercase">3. Waktu Tunggu</span>
                                        <span className="text-[9px] font-bold text-slate-400 italic">Total - Durasi</span>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Total ({data.turnaround_time}) - Durasi ({data.burst_time}) = <span className="font-black text-slate-900">{data.waiting_time} Menit</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-slate-200"
                        >
                            Tutup Detail
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const FCFSAnalysis = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFacility, setSelectedFacility] = useState('all');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/bookings/admin/fcfs-stats');
            setStats(res.data);
        } catch (err) {
            console.error("Gagal memuat log FCFS");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleViewCalc = (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const formatDuration = (minutes) => {
        const mins = Math.round(minutes);
        if (mins === 0) return '0 mnt';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        
        if (h === 0) return `${m} mnt`;
        if (m === 0) return `${h} jam`;
        return `${h}j ${m}m`;
    };

    const filteredData = useMemo(() => {
        if (!stats?.data) return [];
        let result = stats.data;

        // Filter by fasilitas
        if (selectedFacility !== 'all') {
            result = result.filter(b => b.nama_fasilitas === selectedFacility);
        }

        // Filter by date range (tanggal_booking)
        if (filterDateStart) {
            result = result.filter(b => b.tanggal_booking?.slice(0, 10) >= filterDateStart);
        }
        if (filterDateEnd) {
            result = result.filter(b => b.tanggal_booking?.slice(0, 10) <= filterDateEnd);
        }

        return result;
    }, [stats, selectedFacility, filterDateStart, filterDateEnd]);

    const facilitiesList = useMemo(() => {
        if (!stats?.data) return [];
        return [...new Set(stats.data.map(b => b.nama_fasilitas))];
    }, [stats]);

    const columns = useMemo(() => [
        {
            header: 'Penyewa',
            accessorKey: 'nama_user',
            cell: info => <span className="font-bold text-slate-800 text-xs">{info.getValue()}</span>
        },
        {
            header: 'Fasilitas',
            accessorKey: 'nama_fasilitas',
            cell: info => <span className="text-[10px] font-black uppercase text-slate-500">{info.getValue()}</span>
        },
        {
            header: 'Waktu Datang',
            accessorKey: 'arrival_time',
            cell: info => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-900">{new Date(info.getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">{new Date(info.getValue()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                </div>
            )
        },
        {
            header: 'Waktu Mulai',
            accessorKey: 'start_time',
            cell: info => <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md">{new Date(info.getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        },
        {
            header: 'Waktu Selesai',
            accessorKey: 'completion_time',
            cell: info => <span className="text-[10px] font-black text-slate-700">{new Date(info.getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        },
        {
            header: 'Tunggu',
            accessorKey: 'waiting_time',
            cell: info => <span className={`font-black text-xs ${info.getValue() > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>{info.getValue()} mnt</span>
        },
        {
            header: 'Aksi',
            cell: ({ row }) => (
                <button 
                    onClick={() => handleViewCalc(row.original)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 group"
                >
                    <Eye size={14} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest pr-1">Kalkulasi</span>
                </button>
            )
        }
    ], []);

    return (
        <MainLayout title="Log Antrean Lapangan">
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tightest leading-none">Log & Riwayat Antrean</h1>
                        <p className="text-sm text-slate-500 font-bold mt-4 max-w-xl">
                            Urutan penggunaan lapangan berdasarkan waktu kedatangan penyewa secara otomatis.
                        </p>
                    </div>
                </div>

                {/* Academic Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border border-primary-500">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rata-rata Waktu Tunggu</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-black text-slate-900">{stats?.summary?.average_waiting_time || 0} mnt</p>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">({formatDuration(stats?.summary?.average_waiting_time || 0)})</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-primary-500">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rata-rata Waktu Selesai</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-black text-slate-900">{stats?.summary?.average_turnaround_time || 0} mnt</p>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">({formatDuration(stats?.summary?.average_turnaround_time || 0)})</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Table */}
                <Card noPadding className="shadow-xl shadow-slate-100/50">
                    {/* Header - Always visible */}
                    <div className="px-4 md:px-8 py-4 md:py-6 bg-primary-50 border-b border-primary-100">
                        {/* Row 1: Title + Filter Fasilitas */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <BarChart3 size={18} className="text-primary-500" />
                                <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">Daftar Eksekusi Antrean</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Filter Fasilitas:</span>
                                <Select
                                    value={selectedFacility}
                                    onChange={(e) => setSelectedFacility(e.target.value)}
                                    className="w-full md:w-48"
                                >
                                    <option value="all">Semua Fasilitas</option>
                                    {facilitiesList.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* Row 2: Date Range Filter */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
                            <div className="flex items-center gap-2">
                                <Calendar size={13} className="text-primary-400 shrink-0" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Rentang Tanggal:</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    id="fcfs-date-start"
                                    type="date"
                                    value={filterDateStart}
                                    onChange={(e) => setFilterDateStart(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all cursor-pointer"
                                />
                                <span className="text-[10px] font-black text-slate-400">–</span>
                                <input
                                    id="fcfs-date-end"
                                    type="date"
                                    value={filterDateEnd}
                                    min={filterDateStart || undefined}
                                    onChange={(e) => setFilterDateEnd(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all cursor-pointer"
                                />
                                {(filterDateStart || filterDateEnd) && (
                                    <button
                                        onClick={() => { setFilterDateStart(''); setFilterDateEnd(''); }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Reset filter tanggal"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                            {(filterDateStart || filterDateEnd) && (
                                <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest bg-primary-50 border border-primary-200 px-2 py-1 rounded-lg whitespace-nowrap">
                                    {filteredData.length} hasil
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Desktop: DataTable */}
                    <div className="hidden md:block">
                        <DataTable 
                            columns={columns} 
                            data={filteredData} 
                            loading={loading} 
                        />
                    </div>

                    {/* Mobile: DataListCard */}
                    <div className="md:hidden p-4 space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, idx) => (
                                <DataListCard key={idx}>
                                    <DataListCardHeader 
                                        icon={User}
                                        iconBg="bg-primary-100"
                                        iconColor="text-primary-600"
                                        title={item.nama_user}
                                        subtitle={item.nama_fasilitas}
                                    />
                                    <DataListCardMeta 
                                        items={[
                                            { icon: Calendar, text: new Date(item.arrival_time).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) },
                                            { icon: Clock, text: `${item.burst_time} mnt` },
                                            { icon: Clock, text: `Tunggu: ${item.waiting_time} mnt`, color: item.waiting_time > 0 ? 'text-amber-600' : 'text-emerald-600' },
                                            { icon: Activity, text: `Total: ${item.turnaround_time} mnt` }
                                        ]}
                                    />
                                    <DataListCardFooter 
                                        value={item.status === 'completed' ? 'Selesai' : 'Proses'}
                                        valueClass={item.status === 'completed' ? 'font-black text-emerald-600' : 'font-black text-primary-600'}
                                        actions={(
                                            <button 
                                                onClick={() => handleViewCalc(item)}
                                                className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-[9px] font-black uppercase hover:bg-primary-600 transition-colors flex items-center gap-1"
                                            >
                                                <Eye size={12} />
                                                Detail
                                            </button>
                                        )}
                                    />
                                </DataListCard>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <p className="text-sm font-medium">Tidak ada data</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Formulas Info Card */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-sm font-black text-primary-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Calculator size={18} /> Keterangan Waktu Antrean
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-xs font-bold text-slate-400">Waktu Selesai</span>
                                    <span className="text-xs font-black italic">Mulai + Durasi</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-xs font-bold text-slate-400">Total Waktu</span>
                                    <span className="text-xs font-black italic">Selesai - Datang</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-xs font-bold text-slate-400">Waktu Tunggu</span>
                                    <span className="text-xs font-black italic">Total - Durasi</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                                "Sistem memastikan keadilan pelayanan di mana setiap pesanan diproses berdasarkan urutan kedatangan penyewa tanpa ada penyrobotan antrean."
                            </p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Activity size={150} />
                    </div>
                </div>

                {/* Calculation Modal */}
                <CalculationModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    data={selectedRow}
                />
            </div>
        </MainLayout>
    );
};

export default FCFSAnalysis;
