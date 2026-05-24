import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../../utils/api';
import { 
  Plus, Pencil, Trash2, Building2, X, CheckCircle2, 
  AlertCircle, Image as ImageIcon, Tag, Trash, Upload, Camera, Loader2,
  Maximize2, Clock, Calendar, ChevronRight, Users, RotateCcw
} from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import MainLayout from "../../components/layout/MainLayout";
import { resolveImageUrl } from "../../utils/url";

// Import Reusable Components
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';

const Facilities = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    nama_fasilitas: '', jenis_fasilitas: '', jumlah_unit: 1, status_fasilitas: 1,
    images: [], items: [], tariffs: []
  });

  const [tempImage, setTempImage] = useState('');
  const [tempItem, setTempItem] = useState('');
  
  // Master Tarif State
  const [tempTariff, setTempTariff] = useState({
    tipe_tarif: 'SESI', nama_tarif: '', jam_mulai: '', jam_selesai: '', harga: '', kapasitas: ''
  });
  const [tariffEditIndex, setTariffEditIndex] = useState(null);

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/fasilitas');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Gagal mengambil data");
      setLoading(false);
    }
  };

  useEffect(() => { fetchFacilities(); }, []);

  const openModal = (facility = null) => {
    setTariffEditIndex(null);
    if (facility) {
      setEditId(facility.id);
      setFormData({
        nama_fasilitas: facility.nama_fasilitas,
        jenis_fasilitas: facility.jenis_fasilitas,
        jumlah_unit: facility.jumlah_unit || 1,
        status_fasilitas: facility.status_fasilitas,
        images: facility.images || [],
        items: facility.items || [],
        tariffs: facility.tariffs || []
      });
    } else {
      setEditId(null);
      setFormData({
        nama_fasilitas: '', jenis_fasilitas: '', jumlah_unit: 1,
        status_fasilitas: 1, images: [], items: [], tariffs: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_fasilitas) return toast.error("Nama fasilitas wajib diisi");
    if (formData.tariffs.length === 0) return toast.error("Minimal tambahkan 1 skema tarif");
    
    setIsSubmitting(true);
    try {
      if (editId) await api.put(`/fasilitas/${editId}`, formData);
      else await api.post('/fasilitas', formData);
      toast.success("Berhasil disimpan!");
      setIsModalOpen(false);
      fetchFacilities();
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal menyimpan data");
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus fasilitas ini?")) {
      try {
        await api.delete(`/fasilitas/${id}`);
        toast.success("Terhapus!");
        fetchFacilities();
      } catch (error) { toast.error("Gagal hapus"); }
    }
  };

  const saveTariff = () => {
    if (!tempTariff.nama_tarif || !tempTariff.harga || !tempTariff.kapasitas) return toast.error("Lengkapi Nama, Harga, dan Kapasitas");
    if (tempTariff.tipe_tarif === 'SESI' && (!tempTariff.jam_mulai || !tempTariff.jam_selesai)) return toast.error("Waktu mulai dan selesai wajib diisi");
    
    if (tariffEditIndex !== null) {
        const newTariffs = [...formData.tariffs];
        newTariffs[tariffEditIndex] = { ...tempTariff };
        setFormData({ ...formData, tariffs: newTariffs });
        setTariffEditIndex(null);
        toast.success("Tarif diperbarui");
    } else {
        setFormData({ ...formData, tariffs: [...formData.tariffs, { ...tempTariff }] });
    }
    setTempTariff({ tipe_tarif: 'SESI', nama_tarif: '', jam_mulai: '', jam_selesai: '', harga: '', kapasitas: '' });
  };

  const startEditTariff = (index) => {
    const tariff = formData.tariffs[index];
    setTempTariff({
        ...tariff,
        jam_mulai: tariff.jam_mulai?.substring(0, 5) || '',
        jam_selesai: tariff.jam_selesai?.substring(0, 5) || ''
    });
    setTariffEditIndex(index);
    const formElement = document.getElementById('tariff-input-area');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelEditTariff = () => {
    setTempTariff({ tipe_tarif: 'SESI', nama_tarif: '', jam_mulai: '', jam_selesai: '', harga: '', kapasitas: '' });
    setTariffEditIndex(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("File maks 5MB");
    const fData = new FormData();
    fData.append('image', file);
    setIsUploading(true);
    try {
        const res = await api.post('/fasilitas/upload', fData);
        setFormData(p => ({ ...p, images: [...p.images, res.data.url] }));
    } catch (err) { toast.error("Upload gagal"); }
    finally { setIsUploading(false); }
  };

  const formatIDR = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

  const columns = useMemo(() => [
    {
      header: 'Fasilitas',
      accessorKey: 'nama_fasilitas',
      cell: info => {
        const img = info.row.original.images?.[0];
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
                {img ? <img src={resolveImageUrl(img)} className="w-full h-full object-cover" /> : <Building2 className="w-full h-full p-2 text-slate-300" />}
            </div>
            <div>
              <span className="block font-bold text-slate-800 text-sm leading-tight tracking-tight">{info.getValue()}</span>
              <span className="text-[10px] text-primary-500 font-black uppercase tracking-widest">{info.row.original.jenis_fasilitas}</span>
            </div>
          </div>
        );
      }
    },
    {
        header: 'Tarif & Kapasitas',
        accessorKey: 'tariffs',
        cell: info => {
          const tariffs = info.getValue() || [];
          const sessionPrices = tariffs.filter(t => t.tipe_tarif === 'SESI').map(t => parseFloat(t.harga));
          const sessionCaps = tariffs.filter(t => t.tipe_tarif === 'SESI').map(t => parseInt(t.kapasitas));
          if (sessionPrices.length === 0) return <span className="text-[10px] font-bold text-slate-300 italic uppercase">No Config</span>;
          const minP = Math.min(...sessionPrices), maxP = Math.max(...sessionPrices);
          const minC = Math.min(...sessionCaps), maxC = Math.max(...sessionCaps);
          return (
            <div className="flex flex-col gap-1">
                <span className="font-bold text-emerald-600 text-xs tracking-tight">{minP === maxP ? formatIDR(minP) : `${formatIDR(minP)} - ${formatIDR(maxP)}`}</span>
                <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    <Users size={10} />
                    <span>{minC === maxC ? minC : `${minC}-${maxC}`}</span>
                    {tariffs.some(t => t.tipe_tarif === 'EVENT') && <span className="text-amber-500 ml-1">• Event Ready</span>}
                </div>
            </div>
          );
        }
    },
    {
      header: 'Status',
      accessorKey: 'status_fasilitas',
      cell: info => (
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${info.getValue() ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className={`text-[10px] font-black uppercase ${info.getValue() ? 'text-emerald-600' : 'text-slate-400'}`}>{info.getValue() ? 'Ready' : 'Off'}</span>
        </div>
      )
    },
    {
      header: 'Aksi',
      cell: info => (
        <div className="flex gap-1">
          <button onClick={() => openModal(info.row.original)} className="p-2 text-slate-400 hover:text-primary-600 transition-all hover:bg-primary-50 rounded-lg"><Pencil size={16} /></button>
          <button onClick={() => handleDelete(info.row.original.id)} className="p-2 text-slate-400 hover:text-red-600 transition-all hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
        </div>
      )
    }
  ], []);

  return (
    <MainLayout title="Fasilitas">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Fasilitas Olahraga</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Sistem Retribusi Sesi & Event</p>
          </div>
          <Button variant="dark" icon={Plus} onClick={() => openModal()}>Tambah</Button>
        </div>
        <Card noPadding><DataTable columns={columns} data={data} loading={loading} /></Card>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Dialog static open={isModalOpen} as="div" className="relative z-[999]" onClose={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="w-full max-w-5xl">
                  <DialogPanel className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    
                    <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-8">
                        <div className="flex items-center gap-3 text-slate-900 mb-2">
                             <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg"><Building2 size={16} /></div>
                             <span className="font-black text-sm uppercase tracking-widest">{editId ? 'Edit Data' : 'Baru'}</span>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><ImageIcon size={12}/> Galeri Foto</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1 group">
                                    <input type="text" placeholder="URL..." className="w-full pl-3 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary-500 transition-all shadow-sm" value={tempImage} onChange={e => setTempImage(e.target.value)} disabled={isUploading} />
                                    <button type="button" disabled={isUploading} onClick={() => fileInputRef.current.click()} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-500 transition-colors disabled:opacity-50">
                                        {isUploading ? <Loader2 size={16} className="animate-spin text-primary-500" /> : <Camera size={16} />}
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                                </div>
                                <button type="button" disabled={isUploading} onClick={() => { if(tempImage) setFormData({...formData, images: [...formData.images, tempImage]}); setTempImage(''); }} className="p-3 bg-slate-900 text-white rounded-xl shadow-md disabled:bg-slate-300"><Plus size={16}/></button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {formData.images.map((url, i) => (
                                    <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-white shadow-sm cursor-zoom-in" onClick={() => setPreviewImage(url)}>
                                        <img src={resolveImageUrl(url)} className="w-full h-full object-cover" />
                                        <button type="button" onClick={e => { e.stopPropagation(); setFormData({...formData, images: formData.images.filter((_,idx) => idx !== i)}); }} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Trash size={12}/></button>
                                    </div>
                                ))}
                                {isUploading && (
                                    <div className="aspect-square rounded-lg border border-dashed border-primary-200 bg-primary-50/20 flex flex-col items-center justify-center text-primary-500 animate-pulse">
                                        <Loader2 size={14} className="animate-spin mb-1 text-primary-600" />
                                        <span className="text-[7px] font-black uppercase tracking-widest text-primary-600">Uploading</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-200">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Tag size={12}/> Benefit / Sarana</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Raket 2x..." className="flex-1 px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none shadow-sm focus:border-primary-500 transition-all" value={tempItem} onChange={e => setTempItem(e.target.value)} />
                                <button type="button" onClick={() => { if(tempItem) setFormData({...formData, items: [...formData.items, {nama_item: tempItem, status_item:'Tersedia'}]}); setTempItem(''); }} className="p-3 bg-slate-900 text-white rounded-xl"><Plus size={16}/></button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {formData.items.map((it, i) => (
                                    <span key={i} className="px-2 py-1 bg-white border border-slate-200 text-[9px] font-black text-slate-500 rounded-md flex items-center gap-1 shadow-sm">
                                        {it.nama_item} <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => setFormData({...formData, items: formData.items.filter((_,idx) => idx !== i)})}/>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-8 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{editId ? 'Perbarui Fasilitas' : 'Fasilitas Baru'}</DialogTitle>
                                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest opacity-70">Konfigurasi data fisik & skema tarif</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20} className="text-slate-400"/></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <Input label="Nama Fasilitas" required value={formData.nama_fasilitas} onChange={e => setFormData({...formData, nama_fasilitas: e.target.value})} />
                                </div>
                                <Input label="Jumlah Unit/Lapangan" type="number" required value={formData.jumlah_unit} onChange={e => setFormData({...formData, jumlah_unit: parseInt(e.target.value) || 1})} />
                                <Select label="Jenis Fasilitas" value={formData.jenis_fasilitas} onChange={e => setFormData({...formData, jenis_fasilitas: e.target.value})}>
                                    <option value="">Pilih...</option>
                                    <option value="Lapangan Sepak Bola">Sepak Bola</option>
                                    <option value="Lapangan Bulu Tangkis">Bulu Tangkis</option>
                                    <option value="Lapangan Tenis">Tenis</option>
                                    <option value="Gedung Olahraga">Gedung</option>
                                </Select>
                            </div>

                            <div className="bg-slate-50 rounded-[2.5rem] p-4 border border-slate-100" id="tariff-input-area">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Clock size={18} className="text-primary-600"/>
                                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                            {tariffEditIndex !== null ? `Sedang Edit: ${tempTariff.nama_tarif}` : 'Master Tarif & Kapasitas'}
                                        </span>
                                    </div>
                                    <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <button type="button" onClick={() => setTempTariff({...tempTariff, tipe_tarif: 'SESI'})} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${tempTariff.tipe_tarif === 'SESI' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>SESI</button>
                                        <button type="button" onClick={() => setTempTariff({...tempTariff, tipe_tarif: 'EVENT'})} className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${tempTariff.tipe_tarif === 'EVENT' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400'}`}>EVENT</button>
                                    </div>
                                </div>

                                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-2 items-end bg-white p-2 rounded-2xl border transition-all shadow-sm ${tariffEditIndex !== null ? 'border-primary-300 ring-4 ring-primary-500/5 bg-primary-50/10' : 'border-slate-200'}`}>
                                    <div className="lg:col-span-3 space-y-1">
                                        <span className="text-[8px] font-black text-slate-400 ml-1 uppercase">Nama Tarif</span>
                                        <input type="text" placeholder="Sesi I..." className="w-full px-2 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold outline-none border border-transparent focus:bg-white focus:border-slate-200 transition-all" value={tempTariff.nama_tarif} onChange={e => setTempTariff({...tempTariff, nama_tarif: e.target.value})} />
                                    </div>
                                    
                                    <div className="lg:col-span-2 space-y-1">
                                        <span className="text-[8px] font-black text-slate-400 ml-1 uppercase">Kapasitas</span>
                                        <div className="relative">
                                            <input type="number" placeholder="22" className="w-full pl-7 pr-1 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold outline-none border border-transparent focus:bg-white focus:border-slate-200 transition-all" value={tempTariff.kapasitas} onChange={e => setTempTariff({...tempTariff, kapasitas: e.target.value})} />
                                            <Users size={10} className="absolute left-2 top-2.5 text-slate-400" />
                                        </div>
                                    </div>

                                    {tempTariff.tipe_tarif === 'SESI' ? (
                                        <div className="lg:col-span-3 space-y-1">
                                            <span className="text-[8px] font-black text-slate-400 uppercase">Waktu Sesi</span>
                                            <div className="flex items-center gap-0.5">
                                                <input type="time" className="flex-1 py-1.5 px-1 text-center bg-slate-50 rounded-lg text-[9px] font-bold outline-none border border-transparent focus:bg-white focus:border-slate-200 transition-all" value={tempTariff.jam_mulai} onChange={e => setTempTariff({...tempTariff, jam_mulai: e.target.value})} />
                                                <span className="text-slate-300 font-bold">-</span>
                                                <input type="time" className="flex-1 py-1.5 px-1 text-center bg-slate-50 rounded-lg text-[9px] font-bold outline-none border border-transparent focus:bg-white focus:border-slate-200 transition-all" value={tempTariff.jam_selesai} onChange={e => setTempTariff({...tempTariff, jam_selesai: e.target.value})} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="lg:col-span-3 space-y-1">
                                            <span className="text-[8px] font-black text-slate-400 ml-1 uppercase opacity-30">Waktu (N/A)</span>
                                            <div className="px-2 py-1.5 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-400">Full Day</div>
                                        </div>
                                    )}

                                    <div className="lg:col-span-2 space-y-1">
                                        <span className="text-[8px] font-black text-slate-400 ml-1 uppercase">Harga (Rp)</span>
                                        <input type="number" placeholder="50000" className="w-full px-2 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black text-emerald-600 outline-none border border-transparent focus:bg-white focus:border-slate-200 transition-all" value={tempTariff.harga} onChange={e => setTempTariff({...tempTariff, harga: e.target.value})} />
                                    </div>
                                    
                                    <div className="lg:col-span-2 flex gap-1">
                                        <button type="button" onClick={saveTariff} className={`flex-1 py-1.5 text-white rounded-lg text-[9px] font-black uppercase transition-all active:scale-95 shadow-md ${tariffEditIndex !== null ? 'bg-primary-600 hover:bg-primary-700' : 'bg-slate-900 hover:bg-black'}`}>
                                            {tariffEditIndex !== null ? 'Update' : 'Simpan'}
                                        </button>
                                        {tariffEditIndex !== null && (
                                            <button type="button" onClick={cancelEditTariff} className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-colors" title="Batal Edit">
                                                <RotateCcw size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto pr-2 pt-3 custom-scrollbar">
                                    {formData.tariffs.map((t, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => startEditTariff(i)}
                                            className={`group p-2 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer hover:border-primary-300 relative ${tariffEditIndex === i ? 'border-primary-500 bg-primary-50/20 ring-1 ring-primary-500' : t.tipe_tarif === 'EVENT' ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/50' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center ${t.tipe_tarif === 'EVENT' ? 'bg-amber-600' : 'bg-primary-600'} text-white shadow-lg shadow-current/10`}>
                                                <Users size={12}/>
                                                <span className="text-[8px] font-black">{t.kapasitas}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1 truncate tracking-tight">{t.nama_tarif}</div>
                                                <div className="text-[9px] font-bold text-slate-400 truncate">{t.tipe_tarif === 'SESI' ? `${t.jam_mulai?.substring(0, 5)} - ${t.jam_selesai?.substring(0, 5)}` : 'Harian Event'}</div>
                                                <div className="text-[10px] font-black text-emerald-600 mt-1 tracking-tight">{formatIDR(t.harga)}</div>
                                            </div>
                                            <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, tariffs: formData.tariffs.filter((_,idx)=>idx!==i)}); if(tariffEditIndex === i) cancelEditTariff(); }} className="p-1.5 bg-white border border-slate-200 text-red-500 rounded-lg hover:bg-red-50 shadow-sm">
                                                    <Trash2 size={12}/>
                                                </button>
                                            </div>
                                            {tariffEditIndex === i && (
                                                <div className="absolute -top-2 -right-1 bg-primary-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg uppercase tracking-widest">Editing</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-6">
                                    {editId && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Operasional</span>
                                            <button type="button" onClick={() => setFormData({...formData, status_fasilitas: formData.status_fasilitas ? 0 : 1})} className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${formData.status_fasilitas ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md transform ${formData.status_fasilitas ? 'translate-x-7' : 'translate-x-1'}`} />
                                            </button>
                                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{formData.status_fasilitas ? 'AKTIF' : 'OFF'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Batal</button>
                                    <Button type="submit" disabled={isSubmitting || isUploading} className="px-12 py-4 shadow-2xl shadow-primary-200">
                                        {isSubmitting ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Publish Sekarang'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                  </DialogPanel>
                </motion.div>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewImage && (
          <Dialog static open={!!previewImage} as="div" className="relative z-[1000]" onClose={() => setPreviewImage(null)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm" />
            <div className="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-4xl w-full">
                  <img src={resolveImageUrl(previewImage)} className="w-full rounded-[2.5rem] shadow-2xl border-4 border-white/10" />
                  <button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 text-white font-black text-xs uppercase flex items-center gap-2 tracking-[0.2em] hover:text-primary-400 transition-colors"><X size={24}/> Tutup</button>
                </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default Facilities;