import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  Tag,
  CheckCircle2,
  Info,
  Calendar,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import api from "../../utils/api";

const FacilityBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillDateRaw = searchParams.get("date");
  // Extract YYYY-MM-DD dari ISO string atau pakai langsung kalau sudah format YYYY-MM-DD
  const prefillDate = prefillDateRaw ? prefillDateRaw.split("T")[0] : null;
  const prefillTarif = searchParams.get("prefill_tarif");
  const existingBookingId = searchParams.get("existing_booking_id");

  const [data, setData] = useState(null);
  const [allFacilities, setAllFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    prefillDate || new Date().toISOString().split("T")[0],
  );
  const [availability, setAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // Slot yang sedang dipilih
  const [prefillAttempted, setPrefillAttempted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Untuk image slider
  const { user } = useAuthStore();

  // Auto-select slot dari prefill (hanya sekali)
  useEffect(() => {
    if (prefillTarif && availability.length > 0 && !prefillAttempted) {
      const slot = availability.find(
        (s) => s.id === parseInt(prefillTarif) && s.isAvailable,
      );
      if (slot) {
        setSelectedSlot(slot);
        toast.success(
          "Sesi sebelumnya masih tersedia, data telah diisi otomatis",
        );
      } else {
        const slotFull = availability.find(
          (s) => s.id === parseInt(prefillTarif),
        );
        if (slotFull) {
          toast.error(
            `Sesi ${slotFull.nama_tarif} sudah penuh, silakan pilih sesi lain`,
          );
        }
      }
      setPrefillAttempted(true);
    }
  }, [availability, prefillTarif, prefillAttempted]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch semua fasilitas untuk navigasi
        const allRes = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fasilitas/public`,
        );
        setAllFacilities(allRes.data);

        // Fetch detail fasilitas saat ini
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fasilitas/public/${id}`,
        );
        setData(res.data);
      } catch (err) {
        toast.error("Gagal memuat data fasilitas");
        navigate("/facilities");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Notifikasi prefill jika ada
    if (prefillDate || prefillTarif) {
      toast("Data booking sebelumnya akan diisi otomatis jika tersedia", {
        duration: 3000,
      });
    }
  }, [id, prefillDate, prefillTarif]);

  // Reset image index when facility changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [id]);

  useEffect(() => {
    if (data) fetchAvailability();
  }, [selectedDate, data]);

  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fasilitas/availability/${id}?date=${selectedDate}`,
      );
      setAvailability(res.data);

      // Reset selected slot if not available in new data
      if (selectedSlot) {
        const stillAvailable = res.data.find(
          (s) => s.id === selectedSlot.id && s.isAvailable,
        );
        if (!stillAvailable) setSelectedSlot(null);
      }
    } catch (err) {
      console.error("Gagal cek ketersediaan");
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    try {
      const bookingData = {
        fasilitasId: id,
        tarifId: selectedSlot.id,
        tanggal_booking: selectedDate,
      };
      // Tambah existingBookingId jika ada (untuk rebooking)
      if (existingBookingId) {
        bookingData.existingBookingId = existingBookingId;
      }
      const res = await api.post("/bookings", bookingData);
      toast.success(
        "Booking Berhasil Diajukan! Mohon tunggu verifikasi Admin.",
      );
      navigate("/bookings");
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal melakukan pemesanan");
    } finally {
      setIsBooking(false);
    }
  };

  const formatIDR = (v) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(v);

  // Fungsi navigasi fasilitas
  const navigateFacility = (direction) => {
    const currentIndex = allFacilities.findIndex((f) => f.id === parseInt(id));
    if (direction === "prev" && currentIndex > 0) {
      navigate(`/facility/${allFacilities[currentIndex - 1].id}`);
    } else if (
      direction === "next" &&
      currentIndex < allFacilities.length - 1
    ) {
      navigate(`/facility/${allFacilities[currentIndex + 1].id}`);
    }
  };

  // Fungsi image slider
  const nextImage = () => {
    if (data?.images && currentImageIndex < data.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Get current facility index for navigation
  const currentFacilityIndex = allFacilities.findIndex(
    (f) => f.id === parseInt(id),
  );
  const canGoPrev = currentFacilityIndex > 0;
  const canGoNext = currentFacilityIndex < allFacilities.length - 1;

  if (loading)
    return (
      <MainLayout>
        <div className="p-20 text-center font-black uppercase text-slate-400 animate-pulse">
          Memuat Fasilitas...
        </div>
      </MainLayout>
    );

  return (
    <MainLayout title="Reservasi Lapangan">
      <div className="max-w-7xl mx-auto px-6 space-y-8 pb-40 pt-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/facilities")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-90"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {data.nama_fasilitas}
              </h1>
              <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                <ShieldCheck size={10} /> Sistem Antrean Otomatis
              </p>
            </div>
          </div>

          {/* Simple Facility Navigation */}
          {allFacilities.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateFacility("prev")}
                disabled={!canGoPrev}
                className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-slate-500 min-w-[3rem] text-center">
                {currentFacilityIndex + 1}/{allFacilities.length}
              </span>
              <button
                onClick={() => navigateFacility("next")}
                disabled={!canGoNext}
                className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Info Bar */}
        <div className="lg:hidden flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          <div className="flex-none bg-secondary-500 px-4 py-3 rounded-2xl border border-secondary-400/30 flex items-center gap-3">
            <MapPin size={14} className="text-white" />
            <span className="text-[10px] font-bold text-white">
              {data.jenis_fasilitas}
            </span>
          </div>
          <div className="flex-none bg-accent-500 px-4 py-3 rounded-2xl border border-accent-400/30 flex items-center gap-3">
            <Users size={14} className="text-white" />
            <span className="text-[10px] font-bold text-white">
              {data.jumlah_unit} Unit
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Photo Slider & Desktop Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Simple Image Slider */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
              <div className="aspect-[4/3] overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={data.images?.[currentImageIndex] || "/placeholder.png"}
                    className="w-full h-full object-cover"
                    alt={`${data.nama_fasilitas} ${currentImageIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>

                {/* Minimal Image Navigation */}
                {data.images && data.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur text-slate-600 rounded-full flex items-center justify-center disabled:opacity-0 disabled:cursor-not-allowed hover:bg-white transition-all shadow-sm"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImageIndex === data.images.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur text-slate-600 rounded-full flex items-center justify-center disabled:opacity-0 disabled:cursor-not-allowed hover:bg-white transition-all shadow-sm"
                    >
                      <ChevronRight size={14} />
                    </button>

                    {/* Simple Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                      {data.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-white w-4"
                              : "bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="hidden lg:block p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Kapasitas
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {data.jumlah_unit} Unit
                  </span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Setiap sesi bersifat eksklusif. Gunakan fasilitas sesuai
                  jadwal yang Anda pesan.
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Booking Flow */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Date Selection - REDESIGNED */}
            <div className="bg-primary-600 rounded-[2.5rem] p-8 border border-accent-400/30 shadow-xl shadow-accent-900/20 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-2xl hover:shadow-accent-900/30">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.25rem] bg-white/20 flex items-center justify-center text-white shadow-inner">
                  <Calendar size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    Tentukan Tanggal
                  </h3>
                  <p className="text-[10px] text-accent-100 font-bold uppercase tracking-[0.2em] mt-1">
                    Cek Ketersediaan Real-Time
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-accent-600">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full md:w-auto bg-white pl-10 pr-8 py-5 rounded-[1.5rem] border-2 border-transparent focus:border-accent-600 focus:bg-white outline-none text-sm font-black text-accent-800 cursor-pointer transition-all shadow-inner hover:bg-accent-50"
                />
              </div>
            </div>

            {/* 2. Session List (Horizontal Scroll) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} className="text-secondary-600" /> Pilih Sesi
                </h3>
                {selectedSlot && (
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="text-[10px] font-black text-primary-600 uppercase"
                  >
                    Reset
                  </button>
                )}
              </div>

              {loadingAvailability ? (
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="min-w-[240px] h-32 bg-white rounded-3xl border border-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : availability.length > 0 ? (
                <div className="space-y-10">
                  {/* Horizontal Swipe for Sessions */}
                  <div className="flex gap-4 overflow-x-auto pb-4 mx-2 px-6 scrollbar-hide snap-x">
                    {availability.map((slot) => {
                      const isFull = !slot.isAvailable;
                      const isSelected = selectedSlot?.id === slot.id;
                      const isEvent = slot.tipe_tarif === "EVENT";

                      return (
                        <motion.div
                          key={slot.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => !isFull && setSelectedSlot(slot)}
                          className={`min-w-[240px] md:min-w-[280px] snap-start rounded-[2rem] p-5 border-2 transition-all cursor-pointer relative ${
                            isSelected
                              ? isEvent
                                ? "bg-accent-500 border-accent-400 shadow-md shadow-accent-900/30"
                                : "bg-secondary-500 border-secondary-400 shadow-md shadow-secondary-900/30"
                              : isFull
                                ? "opacity-40 grayscale border-slate-100 bg-slate-50 cursor-not-allowed"
                                : isEvent
                                  ? "bg-accent-500/10 border-accent-200 hover:border-accent-300 hover:bg-accent-500/20"
                                  : "bg-secondary-500/10 border-secondary-200 hover:border-secondary-300 hover:bg-secondary-500/20"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isSelected ? (isEvent ? "bg-white text-accent-600" : "bg-white text-secondary-600") + " scale-110 shadow-lg" : isEvent ? "bg-accent-200 text-accent-600" : "bg-secondary-200 text-secondary-600"}`}
                            >
                              {isSelected ? (
                                <CheckCircle2 size={18} />
                              ) : (
                                <Tag size={16} />
                              )}
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-[10px] font-black tracking-tight ${isSelected ? "text-white" : "text-slate-800"}`}
                              >
                                {formatIDR(slot.harga)}
                              </p>
                              <p
                                className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${isSelected ? (isEvent ? "text-accent-100" : "text-secondary-100") : isEvent ? "text-accent-500" : "text-secondary-500"}`}
                              >
                                {isEvent ? "Per Hari" : "Per Sesi"}
                              </p>
                            </div>
                          </div>

                          <h4
                            className={`text-sm font-black mb-1 ${isSelected ? "text-white" : "text-slate-800"}`}
                          >
                            {slot.nama_tarif}
                          </h4>
                          <p
                            className={`text-[10px] font-bold flex items-center gap-1.5 uppercase ${isSelected ? (isEvent ? "text-accent-100" : "text-secondary-100") : isEvent ? "text-accent-500" : "text-secondary-500"}`}
                          >
                            <Clock size={10} /> {slot.jam_mulai} -{" "}
                            {slot.jam_selesai}
                          </p>

                          {isFull && (
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                                {slot.reason || "Full"}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* 3. Detailed Selection Panel (Shown below when slot active) */}
                  <AnimatePresence mode="wait">
                    {selectedSlot && (
                      <motion.div
                        key={selectedSlot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden"
                      >
                        {/* Background Accent */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl -mr-20 -mt-20" />

                        <div className="relative z-10 space-y-8">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em]">
                                  Konfirmasi Pesanan
                                </span>
                              </div>
                              <h2 className="text-2xl font-black text-white tracking-tightest">
                                {selectedSlot.nama_tarif}
                              </h2>
                            </div>
                            <div className="flex gap-2">
                              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5 flex flex-col items-center">
                                <span className="text-[7px] font-bold text-slate-400 uppercase">
                                  Mulai
                                </span>
                                <span className="text-xs font-black">
                                  {selectedSlot.jam_mulai}
                                </span>
                              </div>
                              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5 flex flex-col items-center">
                                <span className="text-[7px] font-bold text-slate-400 uppercase">
                                  Selesai
                                </span>
                                <span className="text-xs font-black">
                                  {selectedSlot.jam_selesai}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-400 uppercase tracking-widest">
                                  Estimasi Mulai
                                </span>
                                <span className="text-emerald-400 font-black">
                                  {new Date(
                                    selectedSlot.queueInfo.estimated_next_start,
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-400 uppercase tracking-widest">
                                  Waktu Tunggu
                                </span>
                                <span className="text-amber-400 font-black">
                                  {(() => {
                                    const diff = Math.max(
                                      0,
                                      Math.round(
                                        (new Date(
                                          selectedSlot.queueInfo
                                            .estimated_next_start,
                                        ) -
                                          new Date()) /
                                          60000,
                                      ),
                                    );
                                    return diff > 0
                                      ? `${diff} Menit`
                                      : "Tanpa Antrean";
                                  })()}
                                </span>
                              </div>
                              <div className="h-px bg-white/10" />
                              <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black text-slate-400 uppercase">
                                  Total Biaya
                                </span>
                                <span className="text-2xl font-black text-white">
                                  {formatIDR(selectedSlot.harga)}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3">
                              <button
                                onClick={handleBooking}
                                disabled={isBooking}
                                className="flex-1 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-2"
                              >
                                {isBooking ? "Memproses..." : "Ajukan Booking"}{" "}
                                <ArrowRight size={16} />
                              </button>
                              <button
                                onClick={() => setSelectedSlot(null)}
                                className="py-3 text-[9px] font-black text-slate-500 uppercase hover:text-red-400 transition-colors"
                              >
                                Batal Pilih
                              </button>
                            </div>
                          </div>

                          <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                            <div className="flex items-center gap-2 text-amber-600">
                              <Info size={16} />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                Informasi Penting
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                              Setelah Anda mengajukan booking, Admin akan
                              memverifikasi data Anda. Jika disetujui, Anda
                              memiliki waktu maksimal{" "}
                              <span className="font-black text-slate-900">
                                10 MENIT
                              </span>{" "}
                              untuk menyelesaikan pembayaran. Jika lewat batas
                              waktu, pesanan akan dibatalkan otomatis agar slot
                              bisa digunakan pemesan lain.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <AlertCircle size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Tidak ada jadwal tersedia
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FacilityBooking;
