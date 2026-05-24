import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, MapPin, Users, Tag, 
    CheckCircle2, Info, Calendar,
    Building2, ShieldCheck,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { resolveImageUrl } from '../utils/url';

const FacilityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availability, setAvailability] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const { isLoggedIn } = useAuthStore();

    // Redirect logged-in users to the functional booking page
    useEffect(() => {
        if (isLoggedIn && id) {
            navigate(`/dashboard/facility/${id}`);
        }
    }, [isLoggedIn, id, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fasilitas/public/${id}`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Gagal memuat data");
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!id || !selectedDate) return;
            try {
                setLoadingAvailability(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fasilitas/availability/${id}?date=${selectedDate}`);
                setAvailability(res.data);
            } catch (err) {
                console.error("Gagal memuat ketersediaan");
            } finally {
                setLoadingAvailability(false);
            }
        };
        fetchAvailability();
    }, [id, selectedDate]);

    const handleBookingRedirect = () => {
        toast.error("Silakan login terlebih dahulu untuk melakukan pemesanan");
        navigate('/login');
    };

    const formatIDR = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    if (loading && !data) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menyiapkan Informasi...</p>
        </div>
    );

    if (!data) return <div className="min-h-screen flex items-center justify-center">Fasilitas tidak ditemukan</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-32 overflow-x-hidden">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-6 pt-32">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tightest leading-none">{data.nama_fasilitas}</h1>
                            <div className="flex items-center gap-3 mt-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                <MapPin size={14} className="text-primary-500" />
                                Komplek Olahraga Jakabaring, Palembang
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                        {/* Image Showcase */}
                        <div className="space-y-6">
                            <div className="relative bg-white rounded-[3rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group">
                                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-100">
                                    <AnimatePresence mode="wait">
                                        <motion.img 
                                            key={activeImage}
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            src={resolveImageUrl(data.images[activeImage]) || '/placeholder.png'} 
                                            className="w-full h-full object-cover" 
                                            alt={data.nama_fasilitas}
                                        />
                                    </AnimatePresence>

                                    {/* Navigation Buttons */}
                                    {data.images.length > 1 && (
                                        <>
                                            <button 
                                                onClick={() => setActiveImage((prev) => (prev === 0 ? data.images.length - 1 : prev - 1))}
                                                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:text-slate-900 transition-all z-10"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button 
                                                onClick={() => setActiveImage((prev) => (prev === data.images.length - 1 ? 0 : prev + 1))}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:text-slate-900 transition-all z-10"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </>
                                    )}

                                    {/* Image Counter Badge */}
                                    <div className="absolute bottom-8 right-8 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                                        {activeImage + 1} / {data.images.length}
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {data.images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                    {data.images.map((img, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`relative w-24 aspect-video rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === i ? 'border-primary-500 scale-105 shadow-lg shadow-primary-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={resolveImageUrl(img)} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                                            {activeImage === i && <div className="absolute inset-0 bg-primary-500/10" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FCFS Info & Preview */}
                        <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tightest">Aturan Antrean (Siapa Cepat, Dia Dapat)</h2>
                                    <p className="text-xs text-slate-400 font-medium italic">Sistem reservasi adil dan transparan berdasarkan urutan waktu pemesanan Anda.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                <div className="p-6 bg-slate-100 rounded-3xl border border-slate-100">
                                    <h4 className="text-lg font-black text-slate-900 tracking-tightest leading-tight mb-4">Arrival Time (AT)</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Waktu saat Anda menekan tombol booking dan masuk ke antrean sistem.</p>
                                </div>
                                <div className="p-6 bg-slate-100 rounded-3xl border border-slate-100">
                                    <h4 className="text-lg font-black text-slate-900 tracking-tightest leading-tight mb-4">Service Time (ST)</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Waktu sistem memproses verifikasi pembayaran Anda untuk kunci slot.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Sesi & Tarif Tersedia</h3>
                                {data.tariffs.map((t, i) => {
                                    // Cari sisa unit dari data availability
                                    const avail = availability.find(a => a.id === t.id);
                                    const sisa = avail ? avail.remainingUnits : 0;
                                    const isPenuh = avail && sisa <= 0;

                                    return (
                                        <div 
                                            key={i} 
                                            className={`group bg-slate-50 hover:bg-white rounded-[2rem] p-6 border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${isPenuh ? 'opacity-70' : ''}`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center transition-colors shadow-sm ${isPenuh ? 'text-slate-300' : 'text-slate-400 group-hover:text-primary-600'}`}>
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <span className={`block font-black text-lg leading-none mb-2 ${isPenuh ? 'text-slate-400' : 'text-slate-900'}`}>{t.nama_tarif}</span>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <Tag size={12} className="text-primary-500" />
                                                            {t.jam_mulai} - {t.jam_selesai}
                                                        </div>
                                                        {avail && (
                                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isPenuh ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                                {isPenuh ? 'Penuh' : `Tersisa ${sisa} Unit`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-8 pt-6 md:pt-0 border-t md:border-t-0 border-slate-200/50">
                                                <div className="text-left md:text-right">
                                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Mulai Dari</p>
                                                    <p className={`text-xl font-black tracking-tightest ${isPenuh ? 'text-slate-400' : 'text-slate-900'}`}>{formatIDR(t.harga)}</p>
                                                </div>
                                                <button 
                                                    onClick={isPenuh ? null : handleBookingRedirect}
                                                    disabled={isPenuh}
                                                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                                        isPenuh 
                                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                                            : 'bg-slate-900 text-white hover:bg-primary-600 hover:shadow-glow-primary'
                                                    }`}
                                                >
                                                    {isPenuh ? 'Sudah Penuh' : 'Pesan Sekarang'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
                            <Building2 size={40} className="text-primary-400 mb-6" />
                            <h3 className="text-2xl font-black text-white tracking-tightest leading-tight mb-4">Siap Berolahraga?</h3>
                            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
                                Silakan login ke akun SIPENDORA Anda untuk melakukan reservasi lapangan dan memilih unit yang tersedia.
                            </p>
                            <Link 
                                to="/login"
                                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 hover:text-white transition-all shadow-glow-white"
                            >
                                Login Sekarang
                            </Link>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Keunggulan Fasilitas</h4>
                            <div className="space-y-4">
                                {data.items.slice(0, 4).map((it, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 size={14} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-700">{it.nama_item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
};

export default FacilityDetail;
