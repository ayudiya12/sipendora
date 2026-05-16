import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { 
    TrendingUp, BarChart3, PieChart, ArrowRight, 
    ArrowUpRight, Building2, CalendarDays, Award
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';

const ReportCard = ({ title, value, icon: Icon, color, subtitle, loading }) => (
    <div className="bg-primary-500 border border-primary-400/30 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-md shadow-primary-900/20 hover:shadow-xl hover:shadow-primary-900/30 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8 md:-mr-10 md:-mt-10 transition-transform group-hover:scale-110" />
        <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${color} shadow-lg`}>
                <Icon size={20} className="md:w-6 md:h-6" />
            </div>
            <p className="text-primary-100 text-sm font-black uppercase tracking-widest">{title}</p>
        </div>
        <div className="relative z-10">
            {loading ? (
                <div className="h-8 md:h-10 w-3/4 bg-white/20 animate-pulse rounded-lg"></div>
            ) : (
                <h5 className="text-lg md:text-2xl font-black text-white tracking-tightest break-words leading-tight line-clamp-2" title={value}>{value}</h5>
            )}
            {subtitle && !loading && <p className="text-[9px] md:text-[10px] font-bold text-primary-200 uppercase tracking-widest italic mt-2 md:mt-3">{subtitle}</p>}
        </div>
    </div>
);

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PimpinanDashboard = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        totalBookings: 0,
        topFacility: '-',
        facilityDistribution: []
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month'); // 'month' or 'year'

    useEffect(() => {
        const fetchPimpinanData = async () => {
            setLoading(true);
            try {
                const [statsRes, chartRes] = await Promise.all([
                    api.get(`/pimpinan/dashboard-stats?period=${period}`),
                    api.get(`/pimpinan/chart-data?year=${new Date().getFullYear()}`)
                ]);
                
                setStats(statsRes.data);
                setChartData(chartRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPimpinanData();
    }, [period]);

    const formatIDR = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v || 0);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
            {/* Header & Export */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
                <div>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary-50 rounded-full text-[9px] md:text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4 md:mb-6 border border-primary-100">
                        <Award size={14} /> Ringkasan Eksekutif
                    </span>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tightest leading-none uppercase">Analitik Strategis</h1>
                    <p className="text-xs md:text-sm text-slate-400 font-medium mt-3 md:mt-4 max-w-md">Pantau performa bisnis, tren pendapatan, dan efisiensi pemanfaatan fasilitas SIPORA.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                    <select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-3 md:px-6 md:py-4 bg-white border border-slate-200 text-slate-700 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-bold outline-none focus:border-primary-500 transition-all shadow-sm w-full sm:w-auto"
                    >
                        <option value="month">Data Bulan Ini</option>
                        <option value="year">Data Tahun Ini</option>
                    </select>
                    <Link to="/pimpinan/laporan" className="flex items-center justify-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl active:scale-95 text-center">
                        Lihat Laporan <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
                    </Link>
                </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                <ReportCard 
                    title="Pendapatan" 
                    value={formatIDR(stats.revenue)} 
                    icon={TrendingUp} 
                    color="bg-emerald-400 text-emerald-900" 
                    loading={loading}
                />
                <ReportCard 
                    title="Total Reservasi Berhasil" 
                    value={stats.totalBookings} 
                    icon={CalendarDays} 
                    color="bg-white/20 text-white" 
                    loading={loading}
                />
                <ReportCard 
                    title="Fasilitas Terfavorit" 
                    value={stats.topFacility} 
                    icon={Building2} 
                    color="bg-amber-400 text-amber-900" 
                    subtitle={`Teratas pada ${period === 'month' ? 'bulan' : 'tahun'} ini`}
                    loading={loading}
                />
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl md:rounded-[3.5rem] p-6 md:p-12 shadow-sm">
                    <div className="flex items-center justify-between mb-8 md:mb-12">
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tightest">Tren Pendapatan</h3>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 md:mt-2">Data Tahun Berjalan ({new Date().getFullYear()})</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><BarChart3 size={18} className="md:w-5 md:h-5" /></div>
                    </div>
                    
                    <div className="aspect-square sm:aspect-video md:aspect-[21/9] w-full min-h-[250px]">
                        {loading ? (
                            <div className="w-full h-full bg-slate-50 animate-pulse rounded-2xl md:rounded-3xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: window.innerWidth < 768 ? 10 : 12, fontWeight: 700}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} width={80} tick={{fill: '#94a3b8', fontSize: window.innerWidth < 768 ? 10 : 12}} tickFormatter={(value) => `Rp${value/1000000}Jt`} />
                                    <RechartsTooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold'}}
                                        formatter={(value) => formatIDR(value)}
                                        labelStyle={{color: '#64748b', marginBottom: '4px'}}
                                    />
                                    <Bar dataKey="revenue" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl md:rounded-[3.5rem] p-6 md:p-12 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tightest">Proporsi Booking</h3>
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Berdasarkan Fasilitas</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><PieChart size={18} className="md:w-5 md:h-5" /></div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center relative min-h-[200px] md:min-h-[250px]">
                        {loading ? (
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-slate-50 animate-pulse" />
                        ) : stats.facilityDistribution.length === 0 ? (
                            <p className="text-sm font-bold text-slate-400">Belum ada data transaksi</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <RechartsPieChart>
                                    <Pie
                                        data={stats.facilityDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.facilityDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                        itemStyle={{fontWeight: 'bold', color: '#0f172a'}}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PimpinanDashboard;
