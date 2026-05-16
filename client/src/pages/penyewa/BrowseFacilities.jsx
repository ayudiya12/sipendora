import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Search, MapPin, ArrowRight, Filter, 
    Calendar, Star, Users, Info 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';

const BrowseFacilities = () => {
    const navigate = useNavigate();
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('Semua');

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fasilitas/public`);
                setFacilities(res.data);
            } catch (err) {
                console.error("Gagal memuat fasilitas");
            } finally {
                setLoading(false);
            }
        };
        fetchFacilities();
    }, []);

    const filteredFacilities = facilities.filter(f => {
        const matchesSearch = f.nama_fasilitas.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'Semua' || f.jenis_fasilitas === filterType;
        return matchesSearch && matchesFilter;
    });

    const formatIDR = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    const categories = ['Semua', 'Lapangan Sepak Bola', 'Lapangan Bulu Tangkis', 'Lapangan Tenis', 'Gedung Olahraga'];

    return (
        <MainLayout title="Cari Fasilitas">
            <div className="max-w-7xl mx-auto px-6 space-y-10 pb-20 pt-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tightest leading-none">Cari Fasilitas</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Temukan tempat olahraga terbaik untuk hobi Anda</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 pl-6 rounded-[2rem] border border-slate-100 shadow-sm w-full md:w-96 focus-within:ring-2 ring-primary-500/20 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari nama lapangan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none w-full text-xs font-bold text-slate-700 placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Filter Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilterType(cat)}
                            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === cat ? 'bg-primary-600 text-white shadow-md shadow-primary-400/80' : 'bg-white text-slate-400 border border-slate-100 hover:border-primary-200 hover:text-primary-600'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Facilities Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-4 border border-slate-100 animate-pulse">
                                <div className="aspect-[16/10] bg-slate-100 rounded-[2rem] mb-6" />
                                <div className="space-y-3 px-2">
                                    <div className="h-6 bg-slate-100 rounded-full w-2/3" />
                                    <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredFacilities.map((f) => (
                            <motion.div
                                key={f.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -8 }}
                                className="bg-primary-500 rounded-[2.5rem] p-4 border border-primary-400/30 shadow-sm hover:shadow-2xl hover:shadow-primary-900/20 transition-all group relative overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/dashboard/facility/${f.id}`)}
                            >
                                {/* Image Container */}
                                <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 relative">
                                    <img 
                                        src={f.image || '/placeholder.png'} 
                                        alt={f.nama_fasilitas}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                            {f.jenis_fasilitas}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-2 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight leading-none group-hover:text-slate-100 transition-colors">
                                            {f.nama_fasilitas}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-3 text-slate-100/70 font-bold text-[11px] uppercase tracking-tighter">
                                            <MapPin size={14} className="text-white" />
                                            Kec. Bukit Kecil, Palembang
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-primary-400/30 flex items-center justify-between">
                                        <div>
                                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-100/70">Mulai dari</span>
                                            <span className="text-lg font-black text-white tracking-tight">{formatIDR(f.minPrice)}</span>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-white text-primary-600 flex items-center justify-center group-hover:bg-slate-100 group-hover:shadow-lg transition-all active:scale-90">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>

                                {/* Availability Badge (Static for now) */}
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                        <Info size={10} /> Tersedia
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredFacilities.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                            <Search size={40} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Fasilitas tidak ditemukan</h3>
                            <p className="text-sm font-medium text-slate-400">Coba gunakan kata kunci atau kategori lain</p>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default BrowseFacilities;
