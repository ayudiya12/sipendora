import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, MapPin, Calendar, Clock, 
    CheckCircle2, AlertCircle, CreditCard,
    ClipboardList, Download, Activity, Receipt
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BookingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/bookings/my/${id}`);
            setBooking(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || "Gagal memuat detail pesanan");
            toast.error(err.response?.data?.error || "Gagal memuat detail pesanan");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

        try {
            await api.patch(`/bookings/cancel/${id}`);
            toast.success("Pesanan berhasil dibatalkan");
            fetchDetail(); // Refresh data
        } catch (err) {
            toast.error(err.response?.data?.error || "Gagal membatalkan pesanan");
        }
    };

    const formatIDR = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'PENDING': return { label: 'Cek Data', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: AlertCircle };
            case 'APPROVED': return { label: 'Siap Bayar', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: CreditCard };
            case 'WAITING_VERIFICATION': return { label: 'Cek Dana', color: 'bg-purple-50 text-purple-600 border-purple-100', icon: Activity };
            case 'CONFIRMED': return { label: 'Selesai', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 };
            case 'CANCELED': return { label: 'Dibatalkan', color: 'bg-red-50 text-red-600 border-red-100', icon: AlertCircle };
            default: return { label: status, color: 'bg-slate-50 text-slate-600 border-slate-100', icon: ClipboardList };
        }
    };

    if (loading) {
        return (
            <MainLayout title="Detail Pesanan">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
                        <div className="h-64 w-full bg-slate-200 rounded-[2rem]"></div>
                        <div className="h-40 w-full bg-slate-200 rounded-[2rem]"></div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !booking) {
        return (
            <MainLayout title="Detail Pesanan">
                <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                    <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
                    <h2 className="text-2xl font-black text-slate-900">Oops, Ada Masalah</h2>
                    <p className="text-slate-500 mt-2">{error || "Pesanan tidak ditemukan"}</p>
                    <button 
                        onClick={() => navigate('/bookings')}
                        className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary-600 transition-all"
                    >
                        Kembali ke Daftar Pesanan
                    </button>
                </div>
            </MainLayout>
        );
    }

    const badge = getStatusBadge(booking.status_booking);
    const StatusIcon = badge.icon;

    return (
        <MainLayout title={`Detail Pesanan #${booking.id}`}>
            <div className="max-w-3xl mx-auto px-6 space-y-8 pb-20 pt-6">
                {/* Header Actions */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/bookings')}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Detail Pesanan</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: #{booking.id.toString().padStart(6, '0')}</p>
                    </div>
                </div>

                {/* Status Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-[2rem] p-6 border ${badge.color} flex items-center gap-4`}
                >
                    <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center shrink-0">
                        <StatusIcon size={28} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest mb-1">Status Saat Ini</h2>
                        <p className="text-lg font-bold">{badge.label}</p>
                    </div>
                </motion.div>

                {/* Facility & Schedule Details */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Fasilitas</h3>
                            <p className="text-xl font-black text-slate-900">{booking.nama_fasilitas}</p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Calendar size={14} className="text-primary-500" />
                                Tanggal Main
                            </h4>
                            <p className="text-sm font-bold text-slate-900">
                                {new Date(booking.tanggal_booking).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Clock size={14} className="text-primary-500" />
                                Waktu Sesi
                            </h4>
                            <p className="text-sm font-bold text-slate-900">
                                {booking.snapshot_jam_mulai.slice(0,5)} - {booking.snapshot_jam_selesai.slice(0,5)} WIB
                            </p>
                        </div>
                        <div className="col-span-2 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paket/Tarif</h4>
                                <p className="text-sm font-bold text-slate-900">{booking.snapshot_nama_sesi}</p>
                            </div>
                            <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-[10px] font-black uppercase">
                                Unit #{booking.nomor_unit || '-'}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Payment Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Receipt size={100} />
                    </div>
                    
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">Rincian Pembayaran</h3>
                    
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold mb-1">Total Tagihan</p>
                                <p className="text-2xl sm:text-3xl font-black text-white">{formatIDR(booking.total_biaya)}</p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${booking.paymentId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {booking.paymentId ? 'Sudah Dibayar' : 'Belum Dibayar'}
                            </div>
                        </div>

                        {booking.paymentId && (
                            <div className="pt-2 text-xs font-medium text-slate-300 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Status Verifikasi Dana</span>
                                    <span className={booking.status_verifikasi ? 'text-emerald-400 font-bold' : 'text-blue-400 font-bold'}>
                                        {booking.status_verifikasi ? 'Dana Diterima' : 'Menunggu Pengecekan'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Metode</span>
                                    <span className="uppercase">{booking.metode_pembayaran || 'Transfer'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Informational Notes */}
                {booking.tipe_tarif === 'SESI' && (
                    <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-200 flex gap-4">
                        <AlertCircle size={24} className="text-amber-600 shrink-0" />
                        <div>
                            <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Aturan Fasilitas Olahraga</h4>
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                Penggunaan fasilitas lapangan ini hanya diperuntukkan untuk kegiatan olahraga. Segala bentuk kegiatan komersial atau non-olahraga dilarang keras dan dapat membatalkan pesanan.
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {['PENDING', 'APPROVED', 'WAITING_VERIFICATION'].includes(booking.status_booking) && (
                    <div className="pt-4">
                        <button 
                            onClick={handleCancel}
                            className="w-full py-4 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 font-black text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                        >
                            <AlertCircle size={18} />
                            Batalkan Pesanan Ini
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default BookingDetail;
