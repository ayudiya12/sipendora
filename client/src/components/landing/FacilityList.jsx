import React, { useState, useEffect, useMemo, Fragment } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, Tab, TabGroup, TabList, Transition } from '@headlessui/react';
import { Search, Building2, ArrowRight, Users, Tag, Check, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const FacilityList = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [selectedComboItem, setSelectedComboItem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
    const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
    const { isLoggedIn } = useAuthStore();

    useEffect(() => {
        const fetchPublicFacilities = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fasilitas/public`);
                setFacilities(res.data);
            } catch (err) {
                console.error('Gagal mengambil data fasilitas publik');
            } finally {
                setLoading(false);
            }
        };
        fetchPublicFacilities();
    }, []);

    const categories = useMemo(() => {
        const cats = [...new Set(facilities.map((f) => f.jenis_fasilitas))];
        return ['Semua', ...cats];
    }, [facilities]);

    const activeCategory = categories[activeCategoryIdx] ?? 'Semua';

    const filtered = useMemo(() => {
        let result = facilities;
        if (activeCategory !== 'Semua') {
            result = result.filter((f) => f.jenis_fasilitas === activeCategory);
        }
        if (query) {
            result = result.filter(
                (f) =>
                    f.nama_fasilitas.toLowerCase().includes(query.toLowerCase()) ||
                    f.jenis_fasilitas.toLowerCase().includes(query.toLowerCase())
            );
        }
        return result;
    }, [facilities, activeCategory, query]);

    // Reset index when filtered list changes
    useEffect(() => { setCurrentIndex(0); }, [activeCategory, query]);

    const goNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % filtered.length);
    };

    const goPrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    };

    const goTo = (idx) => {
        setDirection(idx > currentIndex ? 1 : -1);
        setCurrentIndex(idx);
    };

    const formatIDR = (v) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(v);

    const slideVariants = {
        enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60, scale: 0.97 }),
        center: { opacity: 1, x: 0, scale: 1 },
        exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, scale: 0.97 }),
    };

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-slate-950">
                <div className="w-12 h-12 border-4 border-primary-900 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    Memuat Katalog...
                </p>
            </div>
        );

    const current = filtered[currentIndex];

    return (
        <section id="fasilitas" className="py-12 bg-slate-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-14"
                >
                    <span className="inline-flex items-center gap-2 text-primary-400 font-black text-[10px] uppercase tracking-[0.25em] bg-primary-950 border border-primary-800/60 px-5 py-2 rounded-full mb-6">
                        <Layers size={10} />
                        Katalog Fasilitas
                    </span>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1]">
                            Temukan
                            <br />
                            <span className="text-primary-500">Arena</span> Terbaik
                        </h2>

                        {/* ── Combobox Search ── */}
                        <Combobox
                            value={selectedComboItem}
                            onChange={(val) => {
                                if (!val) return;
                                setSelectedComboItem(val);
                                // find inside current filtered list; if not found reset category first
                                const idx = filtered.findIndex((f) => f.id === val.id);
                                if (idx !== -1) {
                                    goTo(idx);
                                } else {
                                    setActiveCategoryIdx(0); // reset to "Semua"
                                    // index will be 0 after reset; let the user see the card
                                }
                                setQuery('');
                            }}
                        >
                            <div className="relative w-full lg:max-w-sm">
                                <div className="relative">
                                    <Search
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10"
                                        size={16}
                                    />
                                    <ComboboxInput
                                        className="w-full pl-12 pr-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-semibold text-white placeholder:text-slate-600 focus:border-primary-600 focus:ring-1 focus:ring-primary-600/50 outline-none transition-all"
                                        placeholder="Cari fasilitas olahraga..."
                                        displayValue={(f) => f?.nama_fasilitas ?? ''}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>

                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 -translate-y-1"
                                >
                                    <ComboboxOptions className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden focus:outline-none">
                                        {filtered.length === 0 && query !== '' ? (
                                            <p className="px-5 py-4 text-sm text-slate-500 font-semibold">
                                                Tidak ada hasil.
                                            </p>
                                        ) : (
                                            filtered.slice(0, 7).map((f) => (
                                                <ComboboxOption key={f.id} value={f} as={Fragment}>
                                                    {({ active, selected }) => (
                                                        <li className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-primary-600/20 text-white' : 'text-slate-400 hover:text-white'}`}>
                                                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                                                                {f.image ? (
                                                                    <img src={f.image} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                                        <Building2 size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm truncate leading-tight">{f.nama_fasilitas}</p>
                                                                <p className="text-[11px] text-slate-600 leading-tight">{f.jenis_fasilitas}</p>
                                                            </div>
                                                            {selected && <Check size={14} className="text-primary-500 shrink-0" />}
                                                        </li>
                                                    )}
                                                </ComboboxOption>
                                            ))
                                        )}
                                    </ComboboxOptions>
                                </Transition>
                            </div>
                        </Combobox>
                    </div>
                </motion.div>

                {/* ── Category Tabs ── */}
                <TabGroup selectedIndex={activeCategoryIdx} onChange={setActiveCategoryIdx}>
                    <TabList className="flex items-center gap-2 mb-10 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map((cat) => (
                            <Tab key={cat} as={Fragment}>
                                {({ selected }) => (
                                    <button className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap outline-none transition-all duration-200 ${
                                        selected
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/60 scale-[1.03]'
                                            : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300 hover:border-slate-700'
                                    }`}>
                                        {cat}
                                    </button>
                                )}
                            </Tab>
                        ))}
                    </TabList>
                </TabGroup>

                {/* ── Carousel ── */}
                {filtered.length > 0 && current ? (
                    <div className="relative">
                        <div className="overflow-hidden">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={current.id}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                                >
                                    <div className="bg-primary-600 rounded-3xl lg:rounded-[2.5rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative group shadow-2xl">
                                        {/* Ambient blob */}
                                        <div className="absolute top-0 right-0 w-[300px] lg:w-[480px] h-[300px] lg:h-[480px] bg-white/10 rounded-full blur-[80px] lg:blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                                        {/* ── Image ── */}
                                        <div className="relative aspect-[4/3] md:aspect-[16/9] lg:aspect-auto overflow-hidden bg-primary-700 min-h-[240px] lg:min-h-0">
                                            {current.image ? (
                                                <img
                                                    src={current.image}
                                                    alt={current.nama_fasilitas}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building2 size={60} className="lg:size-80 text-primary-400" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-primary-700/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-primary-600/60" />

                                            {/* Category badge */}
                                            <div className="absolute top-4 lg:top-6 left-4 lg:left-6">
                                                <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-black/30 backdrop-blur-xl rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/15">
                                                    {current.jenis_fasilitas}
                                                </span>
                                            </div>

                                            {/* Counter */}
                                            <div className="absolute top-4 lg:top-6 right-4 lg:right-6">
                                                <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-black/30 backdrop-blur-xl rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black text-white/60 tracking-widest border border-white/10">
                                                    {currentIndex + 1} / {filtered.length}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ── Content ── */}
                                        <div className="p-4 md:p-6 lg:p-8 flex flex-col justify-center relative z-10">
                                            <p className="text-white/40 font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em] mb-2 lg:mb-3">
                                                Fasilitas Unggulan
                                            </p>
                                            <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6 lg:mb-8">
                                                {current.nama_fasilitas}
                                            </h3>

                                            <div className="flex flex-wrap gap-2 lg:gap-3 mb-8 lg:mb-10">
                                                <div className="flex items-center gap-2 bg-white/[0.08] px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl border border-white/[0.08]">
                                                    <Tag size={12} className="text-white/50" />
                                                    <span className="text-[9px] lg:text-[10px] font-black text-white/70 uppercase tracking-wider">Tarif Hemat</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white/[0.08] px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl border border-white/[0.08]">
                                                    <Users size={12} className="text-white/50" />
                                                    <span className="text-[9px] lg:text-[10px] font-black text-white/70 uppercase tracking-wider">Kapasitas OK</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 lg:pt-8 border-t border-white/10">
                                                <div className="text-center sm:text-left">
                                                    <p className="text-[9px] lg:text-[10px] font-black text-white/35 uppercase tracking-[0.3em] mb-1">
                                                        Mulai dari
                                                    </p>
                                                    <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
                                                        <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                                                            {formatIDR(current.minPrice)}
                                                        </span>
                                                        <span className="text-[9px] lg:text-[10px] font-black text-white/30 uppercase">/ Sesi</span>
                                                    </div>
                                                </div>

                                                <Link
                                                    to={isLoggedIn ? `/dashboard/facility/${current.id}` : `/facility/${current.id}`}
                                                    className="w-full sm:w-auto px-10 py-4 lg:py-4 bg-white text-primary-600 rounded-2xl font-black text-[10px] lg:text-[11px] uppercase tracking-widest hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
                                                >
                                                    Detail Lapangan
                                                    <ArrowRight size={15} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ── Navigation Controls ── */}
                        {filtered.length > 1 && (
                            <div className="flex items-center justify-center gap-6 mt-8">
                                <button
                                    onClick={goPrev}
                                    className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-600 transition-all active:scale-90"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {/* Dot indicators — clickable */}
                                <div className="flex items-center gap-2">
                                    {filtered.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => goTo(i)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                currentIndex === i
                                                    ? 'w-8 bg-primary-500'
                                                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={goNext}
                                    className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-600 transition-all active:scale-90"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-900 rounded-[2rem] border border-dashed border-slate-800 max-w-4xl mx-auto">
                        <Building2 size={40} className="text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">
                            Fasilitas tidak ditemukan
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FacilityList;