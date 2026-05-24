import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { 
    CreditCard, QrCode, Plus, Edit2, Trash2, 
    CheckCircle2, XCircle, AlertCircle,
    Loader2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveImageUrl } from '../../utils/url';

const ManageRekening = () => {
    const [rekening, setRekening] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [previewImage, setPreviewImage] = useState(null);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        nama_bank: '',
        nomor_rekening: '',
        atas_nama: '',
        is_qris: false,
        is_active: true,
        qris_image_path: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchRekening();
    }, []);

    const fetchRekening = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings/admin/rekening');
            setRekening(res.data);
        } catch (error) {
            toast.error("Gagal mengambil data rekening");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (rek = null) => {
        if (rek) {
            setFormData({
                id: rek.id,
                nama_bank: rek.nama_bank,
                nomor_rekening: rek.nomor_rekening || '',
                atas_nama: rek.atas_nama,
                is_qris: rek.is_qris === 1,
                is_active: rek.is_active === 1,
                qris_image_path: rek.qris_image_path || ''
            });
        } else {
            setFormData({
                id: null,
                nama_bank: '',
                nomor_rekening: '',
                atas_nama: '',
                is_qris: false,
                is_active: true,
                qris_image_path: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return toast.error("File maks 5MB");
        
        const fData = new FormData();
        fData.append('qris_image', file);
        setIsUploading(true);
        try {
            const res = await api.post('/settings/admin/rekening/upload', fData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, qris_image_path: res.data.url }));
            toast.success("Gambar QRIS berhasil diunggah!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Gagal mengunggah gambar");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (formData.is_qris && !formData.qris_image_path) {
            return toast.error("Gambar QRIS wajib diunggah!");
        }

        setIsSaving(true);
        try {
            const payload = {
                nama_bank: formData.nama_bank,
                nomor_rekening: formData.is_qris ? (formData.nomor_rekening || '') : formData.nomor_rekening,
                atas_nama: formData.atas_nama,
                is_qris: formData.is_qris,
                is_active: formData.is_active,
                qris_image_path: formData.is_qris ? formData.qris_image_path : null
            };

            if (formData.id) {
                await api.put(`/settings/admin/rekening/${formData.id}`, payload);
                toast.success("Data berhasil diperbarui");
            } else {
                await api.post('/settings/admin/rekening', payload);
                toast.success("Rekening baru berhasil ditambahkan");
            }
            setIsModalOpen(false);
            fetchRekening();
        } catch (error) {
            toast.error(error.response?.data?.error || "Terjadi kesalahan saat menyimpan");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus metode pembayaran ini secara permanen?")) return;
        try {
            await api.delete(`/settings/admin/rekening/${id}`);
            toast.success("Data berhasil dihapus");
            fetchRekening();
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal menghapus data");
        }
    };

    const toggleStatus = async (rek) => {
        try {
            await api.put(`/settings/admin/rekening/${rek.id}`, {
                ...rek,
                is_active: !rek.is_active
            });
            toast.success(`Metode pembayaran ${!rek.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
            fetchRekening();
        } catch (error) {
            toast.error("Gagal mengubah status");
        }
    };

    return (
        <MainLayout title="Pengaturan Rekening">
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tightest leading-none">Master Data Pembayaran</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Kelola Rekening Bank dan QRIS untuk Penyewa</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-glow-primary transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> Tambah Metode
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rekening.map(rek => (
                            <Card key={rek.id} className={`relative overflow-hidden ${!rek.is_active ? 'opacity-60 grayscale' : ''}`}>
                                <div className="absolute top-0 right-0 p-4">
                                    <button 
                                        onClick={() => toggleStatus(rek)}
                                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                            rek.is_active 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                        }`}
                                    >
                                        {rek.is_active ? 'AKTIF' : 'NONAKTIF'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-6 pt-2">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${rek.is_qris ? 'bg-indigo-500 shadow-indigo-500/30' : 'bg-primary-500 shadow-primary-500/30'}`}>
                                        {rek.is_qris ? <QrCode size={24} /> : <CreditCard size={24} />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rek.is_qris ? 'Scan QRIS' : 'Transfer Bank'}</p>
                                        <p className="text-lg font-black text-slate-900 tracking-tight">{rek.nama_bank}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 flex justify-between items-center gap-4 min-h-[96px]">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{rek.is_qris ? 'Link QRIS / Tujuan' : 'Nomor Rekening'}</p>
                                        <p className="text-lg font-black text-slate-900 tracking-tight leading-normal break-all">{rek.nomor_rekening || '-'}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">A.N. {rek.atas_nama}</p>
                                    </div>
                                    {rek.is_qris && rek.qris_image_path && (
                                        <div 
                                            className="w-14 h-14 rounded-xl border border-slate-200 bg-white overflow-hidden p-1 shrink-0 shadow-sm cursor-zoom-in hover:border-primary-500 hover:scale-105 transition-all"
                                            onClick={() => setPreviewImage(rek.qris_image_path)}
                                            title="Klik untuk memperbesar QRIS"
                                        >
                                            <img src={resolveImageUrl(rek.qris_image_path)} alt="QRIS Mini Preview" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(rek)}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(rek.id)}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all flex justify-center items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Edit/Add */}
            <AnimatePresence>
                {isModalOpen && (
                    <Dialog static open={isModalOpen} as="div" className="relative z-[1000]" onClose={() => setIsModalOpen(false)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm" />
                        <div className="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative max-w-lg w-full bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tightest">{formData.id ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pastikan data valid agar penyewa tidak salah transfer</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                        <XCircle size={20} className="text-slate-400"/>
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-5">
                                    {/* is QRIS Toggle */}
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input 
                                            type="checkbox" 
                                            id="is_qris"
                                            checked={formData.is_qris}
                                            onChange={(e) => setFormData({...formData, is_qris: e.target.checked})}
                                            className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <div>
                                            <label htmlFor="is_qris" className="text-xs font-black text-slate-900 uppercase tracking-widest cursor-pointer">Metode ini adalah QRIS</label>
                                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">Centang jika ini merupakan metode pembayaran berbasis scan kode QR</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">
                                            Nama Bank / Layanan
                                        </label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.nama_bank}
                                            onChange={e => setFormData({...formData, nama_bank: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                                            placeholder="Contoh: BANK SUMSEL BABEL atau DANA"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">
                                            {formData.is_qris ? 'Keterangan Singkat QRIS (Opsional)' : 'Nomor Rekening'}
                                        </label>
                                        <input 
                                            type="text" 
                                            required={!formData.is_qris}
                                            value={formData.nomor_rekening}
                                            onChange={e => setFormData({...formData, nomor_rekening: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-colors tracking-widest"
                                            placeholder={formData.is_qris ? 'Contoh: Pembayaran Lapangan' : 'Contoh: 142-01-00000'}
                                        />
                                    </div>

                                    {/* Upload QRIS khusus jika is_qris dicentang */}
                                    {formData.is_qris && (
                                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center justify-between">
                                                <span>Upload Gambar QRIS</span>
                                                {isUploading && <Loader2 size={12} className="animate-spin text-indigo-500" />}
                                            </label>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                required={!formData.id && !formData.qris_image_path} // Wajib jika data baru
                                                onChange={handleFileUpload}
                                                className="w-full p-3 bg-white rounded-xl border border-indigo-100 text-xs font-bold text-slate-600 file:hidden cursor-pointer hover:bg-indigo-50 transition-colors"
                                                disabled={isUploading}
                                            />
                                            {!formData.qris_image_path && (
                                                <p className="text-[9px] text-indigo-400 mt-2 font-bold italic">*Silakan unggah berkas gambar QRIS terlebih dahulu.</p>
                                            )}
                                            {formData.id && formData.qris_image_path && (
                                                <p className="text-[9px] text-indigo-400 mt-2 font-bold italic">*Biarkan kosong jika tidak ingin mengubah gambar QRIS.</p>
                                            )}
                                            
                                            {/* Preview Gambar QRIS Terunggah */}
                                            {formData.qris_image_path && (
                                                <div className="mt-4 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-indigo-100/50 shadow-inner">
                                                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-2">Preview Gambar QRIS</p>
                                                    <div className="w-28 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-1">
                                                        <img 
                                                            src={resolveImageUrl(formData.qris_image_path)} 
                                                            alt="Preview QRIS" 
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">
                                            Atas Nama
                                        </label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.atas_nama}
                                            onChange={e => setFormData({...formData, atas_nama: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                                            placeholder="Contoh: DISPORA PALEMBANG"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full py-5 mt-4 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary-600 hover:shadow-glow-primary transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                        {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* Full-size Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <Dialog static open={!!previewImage} as="div" className="relative z-[2000]" onClose={() => setPreviewImage(null)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm" />
                        <div className="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-sm w-full flex flex-col items-center">
                                <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center justify-center w-80 h-80 sm:w-[24rem] sm:h-[24rem]">
                                    <img src={resolveImageUrl(previewImage)} className="w-full h-full object-contain rounded-2xl" alt="QRIS Full Preview" />
                                </div>
                                <button onClick={() => setPreviewImage(null)} className="absolute -top-12 text-white font-black text-xs uppercase flex items-center gap-2 tracking-[0.2em] hover:text-primary-400 transition-colors">
                                    <XCircle size={20}/> Tutup Preview
                                </button>
                            </motion.div>
                        </div>
                    </Dialog>
                )}
            </AnimatePresence>

        </MainLayout>
    );
};

export default ManageRekening;
