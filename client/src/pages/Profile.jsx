import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, User, Mail, Phone, MapPin, Edit2, Lock, 
    Eye, EyeOff, Check, X, Shield, Calendar, Save, Camera
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const navigate = useNavigate();
    const { user, login } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        no_telp: '',
        alamat: '',
        nik: '',
        foto_profil: ''
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Fetch user data
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/me');
            const userData = res.data;
            
            setFormData({
                nama: userData.nama || '',
                email: userData.email || '',
                no_telp: userData.no_telp || '',
                alamat: userData.alamat || '',
                nik: userData.nik || '',
                foto_profil: userData.foto_profil || ''
            });
            setPreviewPhoto(getPhotoUrl(userData.foto_profil));
        } catch (err) {
            toast.error("Gagal memuat profil");
        } finally {
            setLoading(false);
        }
    };

    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) return photoPath;
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
        const normalizedPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
        return `${baseUrl}${normalizedPath}`;
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran foto maksimal 5MB');
            e.target.value = '';
            return;
        }
        setProfilePhoto(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewPhoto(event.target?.result);
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'nik') {
            setFormData(prev => ({ ...prev, nik: value.replace(/\D/g, '').slice(0, 16) }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            if (profilePhoto) {
                const payload = new FormData();
                payload.append('nama', formData.nama);
                payload.append('email', formData.email);
                payload.append('no_telp', formData.no_telp);
                payload.append('alamat', formData.alamat);
                payload.append('nik', formData.nik);
                payload.append('foto_profil', formData.foto_profil);
                payload.append('profilePhoto', profilePhoto);

                const res = await api.put('/auth/profile', payload);

                toast.success("Profil berhasil diperbarui");
                if (res.data.user) {
                    login(res.data.user, useAuthStore.getState().token);
                }
                setProfilePhoto(null);
                setIsEditing(false);
            } else {
                const res = await api.put('/auth/profile', formData);
                toast.success("Profil berhasil diperbarui");
                if (res.data.user) {
                    login(res.data.user, useAuthStore.getState().token);
                }
                setIsEditing(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Gagal memperbarui profil");
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Password baru tidak cocok");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password baru minimal 6 karakter");
            return;
        }

        try {
            await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            toast.success("Password berhasil diubah");
            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            toast.error(err.response?.data?.error || "Gagal mengubah password");
        }
    };

    if (loading) {
        return (
            <MainLayout title="Profil">
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Profil Saya">
            <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} /> Kembali
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tightest">Profil Saya</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Kelola informasi akun Anda
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-bold hover:bg-primary-100 transition-all flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> Edit Profil
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all flex items-center gap-2"
                                    >
                                        <Save size={16} /> Simpan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6"
                >
                    {/* Avatar Header */}
                    <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-8 text-center relative">
                        <div className="relative inline-block">
                            {previewPhoto ? (
                                <img src={previewPhoto} alt={formData.nama} className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-white shadow-lg mb-4" />
                            ) : (
                                <div className="w-24 h-24 mx-auto rounded-full bg-white flex items-center justify-center text-4xl font-black text-primary-600 shadow-lg mb-4">
                                    {formData.nama?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                            {isEditing && (
                                <>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        id="profilePhotoInput"
                                    />
                                    <label 
                                        htmlFor="profilePhotoInput"
                                        className="absolute bottom-2 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-primary-50 transition-colors"
                                    >
                                        <Camera size={14} className="text-primary-600" />
                                    </label>
                                </>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-white">{formData.nama}</h2>
                        <p className="text-sm text-primary-100 capitalize">{user?.role}</p>
                    </div>

                    {/* Form Fields */}
                    <div className="p-6 space-y-5">
                        {/* Nama */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <User size={14} /> Nama Lengkap
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Masukkan nama lengkap"
                                />
                            ) : (
                                <p className="px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700">
                                    {formData.nama || '-'}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <Mail size={14} /> Email
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Masukkan email"
                                />
                            ) : (
                                <p className="px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700">
                                    {formData.email || '-'}
                                </p>
                            )}
                        </div>

                        {/* No Telp */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <Phone size={14} /> Nomor Telepon
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="no_telp"
                                    value={formData.no_telp}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Masukkan nomor telepon"
                                />
                            ) : (
                                <p className="px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700">
                                    {formData.no_telp || '-'}
                                </p>
                            )}
                        </div>

                        {/* Alamat */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <MapPin size={14} /> Alamat
                            </label>
                            {isEditing ? (
                                <textarea
                                    name="alamat"
                                    value={formData.alamat}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                                    placeholder="Masukkan alamat"
                                />
                            ) : (
                                <p className="px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 min-h-[80px]">
                                    {formData.alamat || '-'}
                                </p>
                            )}
                        </div>

                        {user?.role?.toLowerCase() === 'penyewa' && (
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    <Shield size={14} /> NIK
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="nik"
                                        value={formData.nik}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        placeholder="16 digit angka"
                                    />
                                ) : (
                                    <p className="px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 tracking-tight">
                                        {formData.nik || '-'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Security Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Shield size={16} /> Keamanan
                        </h3>
                    </div>
                    <div className="p-6">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Lock size={18} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400"><span className="font-bold">Perbarui password</span> untuk keamanan akun</p>
                                </div>
                            </div>
                            <ArrowLeft size={18} className="text-slate-300 rotate-180 group-hover:text-slate-500 transition-colors" />
                        </button>
                    </div>
                </motion.div>

                {/* Password Change Modal */}
                <AnimatePresence>
                    {showPasswordModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                            onClick={() => setShowPasswordModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                            >
                                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-lg font-black text-slate-900">Ubah Password</h3>
                                    <button 
                                        onClick={() => setShowPasswordModal(false)}
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                            Password Saat Ini
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.current ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                placeholder="Masukkan password saat ini"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                            Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.new ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                placeholder="Masukkan password baru (min. 6 karakter)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                            Konfirmasi Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.confirm ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                placeholder="Konfirmasi password baru"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-5 border-t border-slate-100 flex gap-3">
                                    <button
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                        className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} /> Simpan Password
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
};

export default Profile;
