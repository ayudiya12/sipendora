import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  Filter,
  Info,
  CreditCard,
  QrCode,
  MessageCircle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { resolveImageUrl } from "../../utils/url";

const CountdownTimer = ({ updatedAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const expiryTime = new Date(updatedAt).getTime() + 10 * 60 * 1000; // +10 Menit
      const now = new Date().getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        setIsExpired(true);
        if (onExpire) onExpire();
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
      );
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();

    return () => clearInterval(timer);
  }, [updatedAt]);

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${isExpired ? "bg-red-50 text-red-500 border-red-100" : "bg-amber-50 text-amber-600 border-amber-200 animate-pulse"}`}
    >
      <Clock size={10} />
      {isExpired ? "Waktu Habis" : `Sisa Waktu: ${timeLeft}`}
    </div>
  );
};

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Semua");

  // Modal & Upload States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rekeningList, setRekeningList] = useState([]);
  const [adminContact, setAdminContact] = useState({
    nama: "Admin Dispora",
    no_telp: "-",
  });

  useEffect(() => {
    fetchBookings();
    fetchRekening();
    fetchAdminContact();
  }, []);

  const fetchAdminContact = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/admin-contact`,
      );
      setAdminContact(res.data);
    } catch (error) {
      console.error("Gagal mengambil kontak admin");
    }
  };

  const fetchRekening = async () => {
    try {
      const res = await api.get("/settings/rekening");
      setRekeningList(res.data);
    } catch (err) {
      console.error("Gagal memuat pengaturan rekening");
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/my");
      setBookings(res.data);
    } catch (err) {
      console.error("Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?"))
      return;

    try {
      await api.patch(`/bookings/cancel/${id}`);
      toast.success("Pesanan berhasil dibatalkan");
      fetchBookings(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal membatalkan pesanan");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedBooking) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("bookingId", selectedBooking.id);
    formData.append("image", uploadFile);

    try {
      await api.post("/payments/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Bukti pembayaran berhasil diunggah!");
      setIsModalOpen(false);
      setUploadFile(null);
      fetchBookings(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal mengunggah bukti");
    } finally {
      setIsUploading(false);
    }
  };

  const handleWhatsAppAdmin = (b) => {
    const phone = adminContact.no_telp.replace(/\D/g, "");
    let cleanPhone = phone;
    if (phone.startsWith("0")) cleanPhone = "62" + phone.substring(1);
    if (!cleanPhone || cleanPhone === "-") {
      toast.error("Nomor admin tidak tersedia");
      return;
    }
    const adminNumber = cleanPhone;
    const dateStr = new Date(b.tanggal_booking).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const message = `Halo Admin Dispora, saya ingin mengonfirmasi pembayaran booking saya:
        
📌 *Detail Booking:*
- ID: #${b.id}
- Fasilitas: ${b.nama_fasilitas}
- Jadwal: ${dateStr} (${b.nama_tarif})
- Total: ${formatIDR(b.total_biaya)}

Saya sudah mengunggah bukti pembayaran di aplikasi. Mohon segera diproses ya. Terima kasih!`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${adminNumber}?text=${encodedMsg}`, "_blank");
  };

  const handleRebooking = async (booking) => {
    try {
      // Ambil tanggal dan konversi ke local date (WIB UTC+7)
      const bookingDate = new Date(booking.tanggal_booking);
      // Tambah offset timezone untuk kembalikan ke local date
      const localDate = new Date(bookingDate.getTime() + (7 * 60 * 60 * 1000));
      const dateStr = localDate.toISOString().split('T')[0];
      
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fasilitas/availability/${booking.fasilitasId}?date=${dateStr}`
      );
      const slot = res.data.find(s => s.id === booking.tarifId);
      
      if (slot && slot.isAvailable) {
        navigate(`/dashboard/facility/${booking.fasilitasId}?date=${dateStr}&prefill_tarif=${booking.tarifId}&existing_booking_id=${booking.id}`);
      } else {
        toast.error("Sesi telah penuh. Silakan pilih fasilitas dan sesi lain.");
        navigate('/facilities');
      }
    } catch (err) {
      toast.error("Gagal cek ketersediaan, silakan pilih ulang");
      navigate('/facilities');
    }
  };

  const isBookingExpired = (updatedAt) => {
    const expiryTime = new Date(updatedAt).getTime() + 10 * 60 * 1000;
    return new Date().getTime() > expiryTime;
  };

  const filteredBookings = bookings.filter(
    (b) => filterStatus === "Semua" || b.status_booking === filterStatus,
  );

  const hasSesiBooking = filteredBookings.some((b) => b.tipe_tarif === "SESI");

  const formatIDR = (v) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(v);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Menunggu Verifikasi Data",
          color: "bg-amber-50 text-amber-600 border-amber-100",
        };
      case "APPROVED":
        return {
          label: "Menunggu Pembayaran",
          color: "bg-blue-50 text-blue-600 border-blue-100",
        };
      case "WAITING_VERIFICATION":
        return {
          label: "Menunggu Konfirmasi Admin",
          color: "bg-purple-50 text-purple-600 border-purple-100",
        };
      case "CONFIRMED":
        return {
          label: "Booking Berhasil (SAH)",
          color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        };
      case "CANCELED":
        return {
          label: "Dibatalkan",
          color: "bg-red-50 text-red-600 border-red-100",
        };
      default:
        return {
          label: status,
          color: "bg-slate-50 text-slate-600 border-slate-100",
        };
    }
  };

  return (
    <MainLayout title="Pesanan Saya">
      <div className="max-w-7xl mx-auto px-6 space-y-10 pb-20 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tightest leading-none">
              Pesanan Saya
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">
              Kelola dan pantau status reservasi lapangan Anda
            </p>
          </div>

          <div className="relative w-full md:w-56 shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {[
                "Semua",
                "PENDING",
                "APPROVED",
                "WAITING_VERIFICATION",
                "CONFIRMED",
              ].map((status) => (
                <option key={status} value={status}>
                  {status === "Semua"
                    ? "SEMUA STATUS"
                    : status.replace("_", " ")}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Filter size={16} />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-[2rem] border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((b) => {
              const badge = getStatusBadge(b.status_booking);
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary-500 rounded-[2rem] p-5 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-6 group"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full xl:w-auto">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors`}
                    >
                      <ClipboardList size={28} />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 mb-3 sm:mb-2">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                          {b.nama_fasilitas}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          {b.paymentId && (
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${b.status_verifikasi ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                            >
                              {b.status_verifikasi
                                ? "Pembayaran Diterima"
                                : "Bukti Terkirim"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4">
                        <div className="flex items-center gap-2 text-slate-200 text-[10px] font-bold uppercase">
                          <Calendar size={14} className="text-primary-500" />
                          {new Date(b.tanggal_booking).toLocaleDateString(
                            "id-ID",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                          , {b.nama_tarif}
                        </div>
                        <div className="flex items-center gap-2 text-slate-200 text-[10px] font-bold uppercase">
                          <Info size={14} className="text-primary-500" />
                          Unit #{b.nomor_unit}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between xl:justify-end gap-5 pt-5 xl:pt-0 border-t xl:border-t-0 border-slate-50 w-full xl:w-auto">
                    <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end">
                      <p className="text-[10px] sm:text-[9px] font-black text-slate-100 uppercase tracking-widest mb-0 sm:mb-1">
                        Total Biaya
                      </p>
                      <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tightest">
                        {formatIDR(b.total_biaya)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {b.status_booking === "PENDING" && (
                        <span className="w-full sm:w-auto text-center px-4 py-3 sm:py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                          Menunggu Verifikasi Data oleh Admin
                        </span>
                      )}

                      {b.status_booking === "APPROVED" && (
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                          {isBookingExpired(b.updatedAt) ? (
                            <div className="flex flex-col gap-2 w-full">
                              <span className="w-full text-center px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100">
                                <Clock size={12} className="inline mr-1" />
                                Waktu 10 Menit Habis
                              </span>
                              <span className="w-full text-center px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-[9px] font-medium border border-amber-100 leading-relaxed">
                                Segera klik Booking Ulang sebelum sesi ini diambil penyewa lain
                              </span>
                              <button
                                onClick={() => handleRebooking(b)}
                                className="w-full justify-center px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-glow-primary transition-all flex items-center gap-2"
                              >
                                <RefreshCw size={14} />
                                Booking Ulang
                              </button>
                            </div>
                          ) : (
                            <>
                              <CountdownTimer
                                updatedAt={b.updatedAt}
                                onExpire={() => {}}
                              />
                              <button
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setIsModalOpen(true);
                                }}
                                className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-glow-primary transition-all flex items-center gap-2"
                              >
                                <CreditCard size={14} />
                                Bayar Sekarang
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {b.status_booking === "WAITING_VERIFICATION" && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <span className="w-full sm:w-auto text-center px-4 py-3 sm:py-2 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-100 flex-1">
                            Menunggu Konfirmasi Admin
                          </span>
                          <button
                            onClick={() => handleWhatsAppAdmin(b)}
                            className="w-full sm:w-auto justify-center px-4 py-3 sm:py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center gap-2 shadow-md shadow-green-900/20"
                          >
                            <MessageCircle size={14} />
                            Hubungi Admin
                          </button>
                        </div>
                      )}

                      {b.status_booking === "CONFIRMED" && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <div
                            className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2 bg-success-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-success-800 transition-all flex items-center gap-2"
                          >
                            <CheckCircle size={14} />
                            <p>Pesanan Selesai</p>
                          </div>
                        </div>
                      )}

                      {["PENDING", "WAITING_VERIFICATION"].includes(
                        b.status_booking,
                      ) && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="w-full sm:w-auto justify-center px-4 py-3 sm:py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          <AlertCircle size={14} />
                          Batalkan
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/bookings/${b.id}`)}
                      className="hidden sm:flex shrink-0 w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 items-center justify-center hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                      title="Detail Pesanan"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : bookings.length === 0 ? (
          /* Truly Empty State (New User) */
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-3xl lg:rounded-[3rem] border-2 border-dashed border-slate-100 px-6">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
              <ClipboardList size={40} className="lg:size-48" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                Belum ada pesanan
              </h3>
              <p className="text-xs lg:text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
                Sepertinya Anda belum melakukan pemesanan lapangan apapun. Yuk,
                cari lapangan favorit Anda sekarang!
              </p>
            </div>
            <button
              onClick={() => navigate("/facilities")}
              className="mt-4 px-10 py-5 bg-slate-900 text-white rounded-2xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-[11px] uppercase tracking-[0.2em] hover:bg-primary-600 hover:shadow-glow-primary transition-all flex items-center gap-4 active:scale-95 shadow-xl"
            >
              Cari Lapangan
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* Filtered Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Search size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Pencarian tidak ditemukan
              </h3>
              <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
                Tidak ada pesanan dengan status{" "}
                <strong>{filterStatus.replace("_", " ")}</strong>. Coba filter
                status lainnya.
              </p>
            </div>
            <button
              onClick={() => setFilterStatus("Semua")}
              className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 underline underline-offset-4"
            >
              Lihat Semua Pesanan
            </button>
          </div>
        )}

        {/* Warning Khusus Olahraga (Muncul jika ada pesanan SESI) */}
        {hasSesiBooking && (
          <div className="bg-amber-50 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 border border-amber-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <AlertCircle size={100} className="text-amber-500" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0 relative z-10">
              <AlertCircle size={24} />
            </div>
            <div className="text-center md:text-left relative z-10">
              <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">
                Perhatian Khusus Penggunaan Fasilitas
              </h4>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Sesuai dengan ketentuan dinas, seluruh fasilitas lapangan yang
                disewakan melalui sistem{" "}
                <strong>hanya diperuntukkan untuk kegiatan olahraga</strong>.
                Penggunaan fasilitas untuk acara non-olahraga (seperti konser,
                bazar, atau pameran komersial) sangat dilarang dan dapat
                mengakibatkan pembatalan pesanan secara sepihak.
              </p>
            </div>
          </div>
        )}

        {/* Footer Info Box */}
        <div className="bg-primary-50 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 border border-primary-100">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary-600 shadow-sm shrink-0">
            <CreditCard size={24} />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
              Informasi Pembayaran
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Pastikan Anda segera melakukan konfirmasi pembayaran setelah
              memesan agar slot Anda tidak dibatalkan secara otomatis oleh sistem.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full sm:max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              {/* Mobile Handle */}
              <div className="w-full flex justify-center pt-4 pb-2 sm:hidden">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>

              <div className="p-6 sm:p-10 pt-2 sm:pt-10 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                    <CreditCard size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tightest leading-tight">
                      Konfirmasi Pembayaran
                    </h2>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Booking #{selectedBooking?.id}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleUpload}
                  className="space-y-5 sm:space-y-6"
                >
                  {/* Nominal Section */}
                  <div className="p-5 sm:p-6 bg-primary-50 rounded-[1.5rem] sm:rounded-[2rem] border border-primary-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-widest">
                        Total Pembayaran
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                        {formatIDR(selectedBooking?.total_biaya || 0)}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-primary-600 text-white rounded-lg text-[8px] sm:text-[9px] font-black uppercase whitespace-nowrap">
                      Flat Per Sesi
                    </div>
                  </div>

                  {rekeningList.length > 0 ? (
                    <div className="space-y-4">
                      {rekeningList.map((rek) => (
                        <div
                          key={rek.id}
                          className="p-5 sm:p-6 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 relative overflow-hidden flex flex-col items-center"
                        >
                          {!rek.is_qris && (
                            <div className="absolute top-0 right-0 opacity-5 -translate-y-4 translate-x-4">
                              <CreditCard
                                size={100}
                                className="sm:w-[120px] sm:h-[120px]"
                              />
                            </div>
                          )}

                          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center w-full">
                            {rek.is_qris
                              ? "Silakan Scan QRIS"
                              : "Transfer Bank"}
                          </p>

                          {rek.is_qris && rek.qris_image_path ? (
                            <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 bg-white mb-3 shadow-sm relative z-10 p-2">
                              <img
                                src={resolveImageUrl(rek.qris_image_path)}
                                alt="QRIS Pembayaran"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : rek.is_qris ? (
                            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 mb-3">
                              <QrCode size={40} className="sm:w-12 sm:h-12" />
                            </div>
                          ) : null}

                          <div className="text-center space-y-1 relative z-10 w-full mt-1 sm:mt-2">
                            <p className="text-xs sm:text-sm font-black text-slate-900 tracking-widest">
                              {rek.nama_bank}
                            </p>
                            {rek.nomor_rekening && (
                              <p
                                className={`font-black text-primary-600 tracking-[0.2em] ${rek.is_qris ? "text-xs sm:text-sm" : "text-lg sm:text-xl"}`}
                              >
                                {rek.nomor_rekening}
                              </p>
                            )}
                            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mt-1">
                              A.N. {rek.atas_nama}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 bg-amber-50 rounded-[1.5rem] border border-amber-100 text-center">
                      <p className="text-[10px] sm:text-xs font-bold text-amber-600">
                        Metode pembayaran belum tersedia. Hubungi Admin.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2.5 sm:space-y-3">
                    <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                      Unggah Bukti Transfer
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="w-full p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] sm:text-xs font-bold text-slate-600 file:hidden cursor-pointer hover:bg-slate-100 transition-colors"
                    />
                    <p className="text-[8px] sm:text-[9px] text-slate-400 italic pl-2">
                      *Hanya file gambar (JPG, PNG, WEBP) maks 5MB
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="order-2 sm:order-1 w-full sm:flex-1 py-3.5 sm:py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || !uploadFile}
                      className="order-1 sm:order-2 w-full sm:flex-[2] py-3.5 sm:py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex justify-center items-center gap-2"
                    >
                      {isUploading ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default MyBookings;
