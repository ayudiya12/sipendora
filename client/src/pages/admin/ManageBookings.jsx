import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { 
    ClipboardList, CheckCircle2, X, Eye, 
    Calendar, Clock, User, Info,
    Filter, CreditCard, ExternalLink, MessageCircle, XCircle,
    ChevronDown,
} from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import MainLayout from "../../components/layout/MainLayout";
import DataTable from '../../components/ui/DataTable';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import DataListCard, { DataListCardHeader, DataListCardMeta, DataListCardFooter } from '../../components/ui/DataListCard';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState(null);
    const [selectedBookingData, setSelectedBookingData] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/bookings/admin/all');
            setBookings(response.data);
        } catch (error) {
            toast.error("Gagal mengambil data pesanan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleVerify = async (bookingId) => {
        if (!window.confirm("Verifikasi pembayaran ini dan konfirmasi booking?")) return;
        
        setIsVerifying(true);
        try {
            await api.patch(`/payments/verify/${bookingId}`);
            toast.success("Booking berhasil dikonfirmasi!");
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal verifikasi");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRejectPayment = async (bookingId) => {
        const reason = window.prompt("Masukkan alasan penolakan bukti pembayaran:");
        if (reason === null) return; // Batal klik OK/Cancel tanpa isi

        setIsVerifying(true);
        try {
            await api.patch(`/payments/reject/${bookingId}`, { reason });
            toast.success("Pembayaran ditolak & Notifikasi dikirim");
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal menolak pembayaran");
        } finally {
            setIsVerifying(false);
        }
    };

    const [dataApproved, setDataApproved] = useState(false);
    const [approvedBooking, setApprovedBooking] = useState(null);

    const handleApproveData = async (booking) => {
        setIsVerifying(true);
        try {
            await api.patch(`/bookings/admin/approve-data/${booking.id}`);
            toast.success("Data berhasil disetujui!");
            
            // Set state untuk tampilkan tombol WA
            setDataApproved(true);
            setApprovedBooking(booking);
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal menyetujui data");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleChatWhatsApp = () => {
        if (approvedBooking) {
            handleWhatsApp(approvedBooking, 'APPROVED');
        }
    };

    const closeModal = () => {
        setSelectedBookingData(null);
        setDataApproved(false);
        setApprovedBooking(null);
    };

    const handleRejectData = async (bookingId) => {
        if (!window.confirm("Yakin ingin menolak pesanan ini secara permanen?")) return;
        
        setIsVerifying(true);
        try {
            await api.patch(`/bookings/admin/reject-data/${bookingId}`);
            toast.success("Pesanan berhasil ditolak.");
            setSelectedBookingData(null);
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal menolak pesanan");
        } finally {
            setIsVerifying(false);
        }
    };

    const formatIDR = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    const getProofUrl = (proofPath) => {
        if (!proofPath) return null;
        // Jika path sudah full URL (http/https), gunakan langsung
        if (proofPath.startsWith('http://') || proofPath.startsWith('https://')) {
            return proofPath;
        }
        // Normalisasi: pastikan path relatif selalu diawali '/' agar URL valid
        const normalizedPath = proofPath.startsWith('/') ? proofPath : `/${proofPath}`;
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
        return `${baseUrl}${normalizedPath}`;
    };

    const handleWhatsApp = (booking, type = 'CONFIRMED') => {
        const phone = booking.phone_user;
        if (!phone) return toast.error("Nomor HP penyewa tidak tersedia");
        
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);
        
        const tanggal = new Date(booking.tanggal_booking).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        
        let message = "";
        if (type === 'APPROVED') {
            message = `Halo ${booking.nama_user}, 

*KONFIRMASI BOOKING - SIPENDORA*
Booking Anda untuk *${booking.nama_fasilitas}* (${booking.nama_tarif}) pada tanggal *${tanggal}* telah *DISETUJUI* oleh Admin.

Silakan selesaikan pembayaran dalam waktu *10 MENIT* dari sekarang untuk mengunci slot Anda. Jika lewat batas waktu, booking akan dibatalkan otomatis oleh sistem.

Cek detail & Bayar di sini: https://sipendora-u5wa.vercel.app/bookings

Terima kasih.`;
        } else {
            message = `Halo ${booking.nama_user}, 

*BOOKING SUKSES - SIPENDORA*
Pembayaran Anda untuk *${booking.nama_fasilitas}* (${booking.nama_tarif}) pada tanggal *${tanggal}* telah kami *VERIFIKASI*.

Booking Anda kini berstatus *CONFIRMED*. Silakan datang tepat waktu sesuai jadwal.

Terima kasih!`;
        }

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const columns = useMemo(() => [
        {
            header: 'Penyewa',
            accessorKey: 'nama_user',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <User size={14} />
                    </div>
                    <div>
                        <span className="block font-bold text-slate-800 text-xs leading-tight">{info.getValue()}</span>
                        <span className="text-[9px] text-slate-400 font-medium lowercase tracking-tight">{info.row.original.email_user}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Fasilitas & Sesi',
            accessorKey: 'nama_fasilitas',
            cell: info => (
                <div>
                    <span className="block font-bold text-slate-800 text-xs leading-tight">{info.getValue()}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{info.row.original.nama_tarif}</span>
                        <span className="text-[9px] text-slate-300">•</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(info.row.original.tanggal_booking).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status Booking',
            accessorKey: 'status_booking',
            cell: info => {
                const status = info.getValue();
                const labels = {
                    'PENDING': 'Verifikasi Data',
                    'APPROVED': 'Menunggu Bayar',
                    'WAITING_VERIFICATION': 'Cek Pembayaran',
                    'CONFIRMED': 'Berhasil',
                    'CANCELED': 'Dibatalkan'
                };
                const colors = {
                    'PENDING': 'bg-amber-500/10 text-amber-600 border-amber-200',
                    'APPROVED': 'bg-primary-500/10 text-primary-600 border-primary-200',
                    'WAITING_VERIFICATION': 'bg-secondary-500/10 text-secondary-600 border-secondary-200',
                    'CONFIRMED': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
                    'CANCELED': 'bg-red-500/10 text-red-600 border-red-200'
                };
                return (
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${colors[status] || 'bg-slate-50 text-slate-400'}`}>
                        {labels[status] || status}
                    </span>
                );
            }
        },
        {
            header: 'Pembayaran',
            accessorKey: 'bukti_pembayaran',
            cell: info => {
                const proof = info.getValue();
                const isVerified = info.row.original.status_verifikasi === 1;
                const isRejected = info.row.original.status_verifikasi === 2;
                
                if (!proof) return <span className="text-[9px] font-bold text-slate-300 italic uppercase">Belum Bayar</span>;
                
                return (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setSelectedProof(getProofUrl(proof))}
                            className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Lihat Bukti"
                        >
                            <Eye size={12} />
                        </button>
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${isVerified ? 'text-emerald-600' : isRejected ? 'text-red-500' : 'text-blue-600 animate-pulse'}`}>
                            {isVerified ? 'Diterima' : isRejected ? 'Ditolak' : 'Bukti Terkirim'}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Biaya',
            accessorKey: 'total_biaya',
            cell: info => <span className="font-black text-slate-900 text-xs tracking-tight">{formatIDR(info.getValue())}</span>
        },
        {
            header: 'Aksi',
            cell: info => {
                const b = info.row.original;
                const canApproveData = b.status_booking === 'PENDING' || (b.status_booking === 'WAITING_VERIFICATION' && !b.bukti_pembayaran);
                const canVerifyPayment = b.status_booking === 'WAITING_VERIFICATION' && b.bukti_pembayaran;
                
                return (
                    <div className="flex gap-1 items-center">
                        {canApproveData ? (
                            <button 
                                onClick={() => setSelectedBookingData(b)}
                                className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center gap-1 shadow-md shadow-primary-200 active:scale-95"
                            >
                                <Info size={12} /> Cek Data
                            </button>
                        ) : canVerifyPayment ? (
                            <div className="flex gap-1">
                                {b.bukti_pembayaran ? (
                                    <>
                                        <button 
                                            onClick={() => handleVerify(b.id)}
                                            disabled={isVerifying}
                                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-1 shadow-md shadow-emerald-200 active:scale-95 disabled:opacity-50"
                                        >
                                            <CheckCircle2 size={12} /> Verif
                                        </button>
                                        <button 
                                            onClick={() => handleRejectPayment(b.id)}
                                            disabled={isVerifying}
                                            className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-1 border border-red-200 active:scale-95 disabled:opacity-50"
                                            title="Tolak Pembayaran"
                                        >
                                            <XCircle size={12} /> Tolak
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter animate-pulse">
                                        Menunggu Bukti...
                                    </span>
                                )}
                            </div>
                        ) : b.status_booking === 'CONFIRMED' ? (
                            <button 
                                onClick={() => handleWhatsApp(b, 'CONFIRMED')}
                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center gap-1 shadow-md shadow-green-200 active:scale-95"
                            >
                                <MessageCircle size={12} /> WA
                            </button>
                        ) : b.status_booking === 'APPROVED' ? (
                            <button 
                                onClick={() => handleWhatsApp(b, 'APPROVED')}
                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center gap-1 shadow-md shadow-green-200 active:scale-95"
                            >
                                <MessageCircle size={12} /> WA
                            </button>
                        ) : (
                            <span className="text-[9px] font-bold text-slate-300 uppercase italic">
                                {b.status_booking === 'CANCELED' ? 'Dibatalkan' : 'Selesai'}
                            </span>
                        )}
                    </div>
                );
            }
        }
    ], [isVerifying]);

    const filteredBookings = useMemo(() => {
        let result = bookings;

        // Filter by status
        if (filterStatus === 'pending') {
            result = result.filter(b => ['PENDING', 'WAITING_VERIFICATION'].includes(b.status_booking));
        } else if (filterStatus !== 'all') {
            result = result.filter(b => b.status_booking === filterStatus.toUpperCase());
        }

        // Filter by date range (tanggal_booking)
        if (filterDateStart) {
            result = result.filter(b => b.tanggal_booking.slice(0, 10) >= filterDateStart);
        }
        if (filterDateEnd) {
            result = result.filter(b => b.tanggal_booking.slice(0, 10) <= filterDateEnd);
        }

        return result;
    }, [bookings, filterStatus, filterDateStart, filterDateEnd]);

    // Mobile Card Component
    const MobileBookingCard = ({ booking }) => {
        const status = booking.status_booking;
        const labels = {
            'PENDING': 'Verifikasi Data',
            'APPROVED': 'Menunggu Bayar',
            'WAITING_VERIFICATION': 'Konfirmasi Pembayaran',
            'CONFIRMED': 'Berhasil',
            'CANCELED': 'Dibatalkan'
        };
        const colors = {
            'PENDING': 'bg-amber-500/10 text-amber-600 border-amber-200',
            'APPROVED': 'bg-primary-500/10 text-primary-600 border-primary-200',
            'WAITING_VERIFICATION': 'bg-secondary-500/10 text-secondary-600 border-secondary-200',
            'CONFIRMED': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
            'CANCELED': 'bg-red-500/10 text-red-600 border-red-200'
        };

        const actions = (
            <>
                {booking.status_booking === 'PENDING' && (
                    <button 
                        onClick={() => setSelectedBookingData(booking)}
                        className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider"
                    >
                        Cek Data
                    </button>
                )}
                {booking.status_booking === 'WAITING_VERIFICATION' && booking.bukti_pembayaran && (
                    <>
                        <button 
                            onClick={() => handleVerify(booking.id)}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase"
                        >
                            <CheckCircle2 size={12} />
                        </button>
                        <button 
                            onClick={() => setSelectedProof(getProofUrl(booking.bukti_pembayaran))}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg"
                        >
                            <Eye size={12} />
                        </button>
                    </>
                )}
                {booking.status_booking === 'CONFIRMED' && (
                    <button 
                        onClick={() => handleWhatsApp(booking, 'CONFIRMED')}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1"
                    >
                        <MessageCircle size={12} /> WA
                    </button>
                )}
            </>
        );

        return (
            <DataListCard>
                <DataListCardHeader 
                    icon={User}
                    title={booking.nama_user}
                    subtitle={booking.nama_fasilitas}
                    badge={labels[status]}
                    badgeColor={colors[status]}
                />
                <DataListCardMeta 
                    items={[
                        { icon: Calendar, text: new Date(booking.tanggal_booking).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) },
                        { icon: Clock, text: booking.nama_tarif }
                    ]}
                />
                <DataListCardFooter 
                    value={formatIDR(booking.total_biaya)}
                    actions={actions}
                />
            </DataListCard>
        );
    };

    return (
        <MainLayout title="Kelola Pesanan">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tightest leading-none">Manajemen Pesanan</h1>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 md:mt-2">Verifikasi & Monitoring Booking</p>
                    </div>
                </div>

                {/* Stats Grid - Mobile: 2 cols, Desktop: 4 cols */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card className="border border-primary-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary-500 flex items-center justify-center shadow-md">
                                <ClipboardList className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                                <p className="text-lg md:text-2xl font-black text-slate-900">{bookings.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="border border-emerald-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500 flex items-center justify-center shadow-md">
                                <CheckCircle2 className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Sukses</p>
                                <p className="text-lg md:text-2xl font-black text-slate-900">{bookings.filter(b => b.status_booking === 'CONFIRMED').length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="border border-secondary-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-secondary-500 flex items-center justify-center shadow-md">
                                <CreditCard className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Cek Bayar</p>
                                <p className="text-lg md:text-2xl font-black text-slate-900">{bookings.filter(b => b.status_booking === 'WAITING_VERIFICATION' && b.bukti_pembayaran).length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="border border-accent-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-accent-500 flex items-center justify-center shadow-md">
                                <Filter className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tindakan</p>
                                <p className="text-lg md:text-2xl font-black text-slate-900">{bookings.filter(b => ['PENDING', 'WAITING_VERIFICATION'].includes(b.status_booking)).length}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Card with Header, Filter, Table/List */}
                <Card noPadding className="shadow-xl shadow-slate-100/50">
                    {/* Header - Always visible */}
                    <div className="px-4 md:px-8 py-4 md:py-6 bg-primary-50 border-b border-primary-100">
                        {/* Row 1: Title + Status Filter */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <ClipboardList size={20} className="text-primary-600" />
                                <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">Daftar Pesanan</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Filter Status:</span>
                                <div className="relative flex-1 md:w-56">
                                    <Select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full md:w-56"
                                    >
                                        <option value="pending">Perlu Tindakan ({bookings.filter(b => ['PENDING', 'WAITING_VERIFICATION'].includes(b.status_booking)).length})</option>
                                        <option value="approved">Menunggu Bayar ({bookings.filter(b => b.status_booking === 'APPROVED').length})</option>
                                        <option value="confirmed">Selesai ({bookings.filter(b => b.status_booking === 'CONFIRMED').length})</option>
                                        <option value="canceled">Dibatalkan ({bookings.filter(b => b.status_booking === 'CANCELED').length})</option>
                                        <option value="all">Semua ({bookings.length})</option>
                                    </Select>
                                </div>
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
                                    id="filter-date-start"
                                    type="date"
                                    value={filterDateStart}
                                    onChange={(e) => setFilterDateStart(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all cursor-pointer"
                                />
                                <span className="text-[10px] font-black text-slate-400">–</span>
                                <input
                                    id="filter-date-end"
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
                                    {filteredBookings.length} hasil
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Desktop: Table View */}
                    <div className="hidden md:block">
                        <DataTable 
                            columns={columns} 
                            data={filteredBookings} 
                            loading={loading} 
                        />
                    </div>

                    {/* Mobile: List View */}
                    <div className="md:hidden p-4 space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                                <MobileBookingCard key={booking.id} booking={booking} />
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <p className="text-sm font-medium">Tidak ada pesanan</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Proof Modal */}
            <AnimatePresence>
                {selectedProof && (
                    <Dialog static open={!!selectedProof} as="div" className="relative z-[1000]" onClose={() => setSelectedProof(null)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm" />
                        <div className="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative max-w-2xl w-full bg-white rounded-[2.5rem] p-4 shadow-2xl overflow-hidden"
                            >
                                <div className="flex justify-between items-center mb-4 px-4 pt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                            <CreditCard size={14}/>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Detail Bukti Transfer</span>
                                    </div>
                                    <button onClick={() => setSelectedProof(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={18} className="text-slate-400"/></button>
                                </div>
                                <div className="aspect-[4/5] md:aspect-video rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 mb-2">
                                    <img src={selectedProof} className="w-full h-full object-contain" alt="Bukti Pembayaran" />
                                </div>
                                <div className="p-4 flex gap-4">
                                    <a 
                                        href={selectedProof} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={14}/> Buka Gambar Asli
                                    </a>
                                    <button 
                                        onClick={() => setSelectedProof(null)}
                                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-glow-dark transition-all"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* Modal Approve Data */}
            <AnimatePresence>
                {selectedBookingData && (
                    <Dialog static open={!!selectedBookingData} as="div" className="relative z-[1000]" onClose={() => setSelectedBookingData(null)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm" />
                        <div className="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative max-w-lg w-full bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tightest">Validasi Data Penyewa</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cek sebelum menyetujui pesanan</p>
                                    </div>
                                    <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                        <X size={20} className="text-slate-400"/>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Informasi Penyewa</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">Nama</span>
                                                <span className="text-xs font-black text-slate-900">{selectedBookingData.nama_user}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">Email</span>
                                                <span className="text-xs font-black text-slate-900">{selectedBookingData.email_user}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">No. WhatsApp</span>
                                                <span className="text-xs font-black text-slate-900">{selectedBookingData.phone_user}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detail Pemesanan</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">Fasilitas</span>
                                                <span className="text-xs font-black text-slate-900 text-right">{selectedBookingData.nama_fasilitas}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">Sesi/Tarif</span>
                                                <span className="text-xs font-black text-slate-900">{selectedBookingData.nama_tarif}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">Tanggal</span>
                                                <span className="text-xs font-black text-slate-900">{new Date(selectedBookingData.tanggal_booking).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-primary-50 rounded-3xl border border-primary-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Total Tagihan</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatIDR(selectedBookingData.total_biaya)}</p>
                                        </div>
                                    </div>
                                </div>

                                {!dataApproved ? (
                                    <div className="flex gap-4 mt-8">
                                        <button 
                                            onClick={() => handleRejectData(selectedBookingData.id)}
                                            disabled={isVerifying}
                                            className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                        >
                                            <XCircle size={16}/> Tolak Pesanan
                                        </button>
                                        <button 
                                            onClick={() => handleApproveData(selectedBookingData)}
                                            disabled={isVerifying}
                                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                        >
                                            <CheckCircle2 size={16}/> Setujui Data
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-8 space-y-3">
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                            <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                                            <p className="text-xs font-black text-emerald-700">Data Pesanan Disetujui!</p>
                                            <p className="text-[10px] text-emerald-600 mt-1">Silakan hubungi penyewa via WhatsApp</p>
                                        </div>
                                        <button 
                                            onClick={handleChatWhatsApp}
                                            className="w-full py-4 bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 shadow-md shadow-green-200 transition-all flex justify-center items-center gap-2"
                                        >
                                            <MessageCircle size={16}/> Chat WhatsApp Penyewa
                                        </button>
                                        <button 
                                            onClick={closeModal}
                                            className="w-full py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </Dialog>
                )}
            </AnimatePresence>
        </MainLayout>
    );
};

export default ManageBookings;
