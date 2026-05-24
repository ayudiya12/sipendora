import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { 
  Plus, Pencil, Trash2, User, Mail, Phone, Shield, 
  X, CheckCircle2, AlertCircle, Loader2, RotateCcw,
  UserPlus, ShieldCheck, UserCheck, ShieldAlert, MapPin
} from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import MainLayout from "../../components/layout/MainLayout";

// Import Reusable Components
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';

const Users = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [formData, setFormData] = useState({
    nama: '', email: '', password: '', no_telp: '', alamat: '', role: 'PENYEWA', nik: ''
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Gagal mengambil data pengguna");
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openModal = (user = null) => {
    if (user) {
      setEditId(user.id);
      setFormData({
        nama: user.nama,
        email: user.email,
        password: '',
        no_telp: user.no_telp || '',
        alamat: user.alamat || '',
        role: user.role,
        nik: user.nik || ''
      });
    } else {
      setEditId(null);
      setFormData({ nama: '', email: '', password: '', no_telp: '', alamat: '', role: 'PENYEWA', nik: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.email) return toast.error("Nama dan Email wajib diisi");
    if (!editId && !formData.password) return toast.error("Password wajib diisi untuk pengguna baru");
    
    setIsSubmitting(true);
    try {
      if (editId) {
        await api.put(`/users/${editId}`, formData);
        toast.success("Profil diperbarui!");
      } else {
        await api.post('/users', formData);
        toast.success("Pengguna baru terdaftar!");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Terjadi kesalahan");
    } finally { setIsSubmitting(false); }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus ? 0 : 1;
      await api.put(`/users/${id}/status`, { status_akun: newStatus });
      toast.success(newStatus ? "Akun diaktifkan" : "Akun diblokir");
      fetchUsers();
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus pengguna ini secara permanen?")) {
      try {
        await api.delete(`/users/${id}`);
        toast.success("Pengguna dihapus");
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.error || "Gagal menghapus");
      }
    }
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) return photoPath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    const normalizedPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
    return `${baseUrl}${normalizedPath}`;
  };

  const columns = useMemo(() => [
    {
      header: 'Identitas Pengguna',
      accessorKey: 'nama',
      cell: info => {
        const user = info.row.original;
        const photoUrl = user.role === 'PENYEWA' ? getPhotoUrl(user.foto_profil) : null;
        return (
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <button onClick={() => setSelectedPhoto(photoUrl)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 hover:border-primary-400 transition-colors shrink-0">
                <img src={photoUrl} alt={user.nama} className="w-full h-full object-cover" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
                <User size={18} />
              </div>
            )}
            <div>
              <span className="block font-bold text-slate-800 text-sm leading-tight tracking-tight">{info.getValue()}</span>
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-wider mt-0.5"><Mail size={10}/> {info.row.original.email}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'NIK',
      accessorKey: 'nik',
      cell: info => {
        const user = info.row.original;
        if (user.role !== 'PENYEWA') return <span className="text-[10px] text-slate-300 font-bold uppercase">—</span>;
        return <span className="text-xs font-bold text-slate-700 tracking-tight">{user.nik || '-'}</span>;
      }
    },
    {
        header: 'Akses & Peran',
        accessorKey: 'role',
        cell: info => {
            const isAdmin = info.getValue() === 'ADMIN';
            return (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                    {isAdmin ? <Shield size={10}/> : <User size={10}/>}
                    {info.getValue()}
                </div>
            );
        }
    },
    {
      header: 'Kontak & Alamat',
      accessorKey: 'no_telp',
      cell: info => (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <Phone size={12} className="text-slate-300"/>
                {info.getValue() || '-'}
            </div>
            <div className="flex items-start gap-1.5 text-[9px] font-medium text-slate-400 leading-tight">
                <MapPin size={10} className="text-slate-300 mt-0.5 shrink-0"/>
                <span className="line-clamp-1">{info.row.original.alamat || 'Alamat belum diisi'}</span>
            </div>
        </div>
      )
    },
    {
      header: 'Status Akun',
      accessorKey: 'status_akun',
      cell: info => {
        const isActive = info.getValue() === 1;
        return (
          <button 
            onClick={() => toggleStatus(info.row.original.id, info.getValue())}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all active:scale-95 group ${
              isActive 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' 
                : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-sm animate-pulse-soft'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-tight">
              {isActive ? 'Verified' : 'Verify Now'}
            </span>
            {!isActive && <ShieldCheck size={12} className="group-hover:scale-125 transition-transform" />}
          </button>
        );
      }
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
    <MainLayout title="Data Pengguna">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Manajemen Pengguna</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Kontrol Akses & Verifikasi Penyewa</p>
          </div>
          <Button variant="dark" icon={UserPlus} onClick={() => openModal()}>Tambah Pengguna</Button>
        </div>
        <Card noPadding><DataTable columns={columns} data={data} loading={loading} /></Card>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Dialog static open={isModalOpen} as="div" className="relative z-[999]" onClose={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="w-full max-w-lg">
                  <DialogPanel className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <DialogTitle className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                                {editId ? 'Edit Profil User' : 'Daftarkan User Baru'}
                            </DialogTitle>
                            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest opacity-70">Lengkapi informasi identitas pengguna</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20} className="text-slate-400"/></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input label="Nama Lengkap" icon={User} required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Email" type="email" icon={Mail} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <Select label="Role / Peran" icon={Shield} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="PENYEWA">Penyewa</option>
                                <option value="ADMIN">Administrator</option>
                                <option value="PIMPINAN">Pimpinan</option>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="No. Telepon (WA)" icon={Phone} value={formData.no_telp} onChange={e => setFormData({...formData, no_telp: e.target.value})} />
                            {!editId && (
                                <Input label="Password" type="password" icon={ShieldAlert} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            )}
                        </div>

                        {formData.role === 'PENYEWA' && (
                            <Input label="NIK" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value.replace(/\D/g, '').slice(0, 16)})} placeholder="16 digit angka" />
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[100px]"
                                    placeholder="Masukkan alamat lengkap penyewa..."
                                    value={formData.alamat}
                                    onChange={e => setFormData({...formData, alamat: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Batal</button>
                            <Button type="submit" disabled={isSubmitting} className="flex-1 py-4 shadow-2xl shadow-primary-200">
                                {isSubmitting ? 'Memproses...' : editId ? 'Simpan Perubahan' : 'Daftarkan Sekarang'}
                            </Button>
                        </div>
                    </form>
                  </DialogPanel>
                </motion.div>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPhoto && (
          <Dialog static open={!!selectedPhoto} as="div" className="relative z-[1000]" onClose={() => setSelectedPhoto(null)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm" />
            <div className="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative max-w-md w-full bg-white rounded-[2.5rem] p-4 shadow-2xl overflow-hidden"
              >
                <div className="flex justify-between items-center mb-4 px-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                      <User size={14}/>
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Foto Profil</span>
                  </div>
                  <button onClick={() => setSelectedPhoto(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={18} className="text-slate-400"/></button>
                </div>
                <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 mb-2">
                  <img src={selectedPhoto} className="w-full h-full object-cover" alt="Foto Profil" />
                </div>
                <div className="p-4">
                  <button 
                    onClick={() => setSelectedPhoto(null)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-glow-dark transition-all"
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default Users;