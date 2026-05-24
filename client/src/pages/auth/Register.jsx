import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ArrowRight, User, Phone, MapPin, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import logo from '../../logo.png';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [formData, setFormData] = useState({  
    fullName: '',
    email: '',
    phone: '',
    alamat: '',
    password: '',
    nik: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nik') {
      setFormData({ ...formData, nik: value.replace(/\D/g, '').slice(0, 16) });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('alamat', formData.alamat);
      payload.append('password', formData.password);
      payload.append('nik', formData.nik);
      if (profilePhoto) {
        payload.append('profilePhoto', profilePhoto);
      }

      // 1. Tembak API Backend Register
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, payload);

      // 2. Auto-login setelah register berhasil
      login(res.data.user, res.data.token);
      toast.success("Registrasi Berhasil! Akun Anda sedang menunggu verifikasi admin.");
      
      // 3. Redirect ke halaman pending
      navigate('/pending');

    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Gagal melakukan registrasi";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-128 h-128 bg-primary-100/40 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[-10%] w-128 h-128 bg-secondary-100/30 rounded-full blur-[100px] animate-pulse-soft" />
      </div>

      {/* Main Card */}
      <div
        className="w-full max-w-[540px] bg-white border border-slate-100 rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-10 shadow-2xl shadow-slate-200/50 relative z-10 animate-fade-up"
      >
        {/* Back Button */}
        <Link to="/login" className="absolute top-6 lg:top-8 left-6 lg:left-8 text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest group">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Kembali
        </Link>

        {/* Logo & Header */}
        <div className="text-center mb-8 mt-6">
          <img 
            src={logo} 
            alt="SIPENDORA" 
            className="h-12 mx-auto mb-5 brightness-0 transition-transform duration-700 hover:scale-110" 
          />
          <h2 className="text-2xl font-black text-slate-900 tracking-tightest mb-1.5">Daftar Akun</h2>
          <p className="text-slate-400 text-xs font-medium">Lengkapi data untuk mulai memesan fasilitas</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={16} />
              <input 
                name="fullName"
                type="text" 
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Masukkan nama sesuai KTP"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-medium text-sm"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={16} />
                <input 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@anda.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-medium text-sm"
                    required
                    disabled={isLoading}
                />
                </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={16} />
                <input 
                    name="phone"
                    type="tel" 
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0812xxx"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-medium text-sm"
                    required
                    disabled={isLoading}
                />
                </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Domisili</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={16} />
              <textarea 
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Contoh: Jl. Merdeka No. 10, Palembang"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-medium text-sm min-h-[80px]"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NIK */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={16} />
                <input 
                  name="nik"
                  type="text" 
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder="Nomor Identitas Kependudukan"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-medium text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium ml-1">16 digit angka</p>
            </div>

            {/* Foto Profil */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Foto Profil</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photoInput"
                disabled={isLoading}
              />
              <label 
                htmlFor="photoInput"
                className="flex flex-col items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl py-5 px-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-all duration-300 group"
              >
                {previewPhoto ? (
                  <div className="relative">
                    <img src={previewPhoto} alt="Preview" className="w-20 h-20 object-cover rounded-full border-2 border-slate-200" />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Camera size={24} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-primary-600 transition-colors">Pilih Foto</span>
                  </>
                )}
              </label>
              <div className="flex items-center justify-between ml-1">
                <p className="text-[10px] text-slate-400 font-medium">Maksimal 5MB</p>
                {previewPhoto && (
                  <label htmlFor="photoInput" className="text-[10px] text-primary-600 font-black cursor-pointer hover:underline">Ubah</label>
                )}
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={16} />
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={handleChange}
                placeholder="Buat sandi kuat"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-11 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-medium text-sm"
                required
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 group transition-all duration-350 active:scale-[0.98] shadow-xl shadow-slate-200 mt-4 disabled:opacity-70"
          >
            {isLoading ? "Sedang Mendaftar..." : "Daftar Sekarang"}
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 pt-5 border-t border-slate-50">
          <p className="text-slate-400 text-xs font-medium">
            Sudah punya akun? <br />
            <Link to="/login" className="text-slate-900 font-black hover:text-primary-600 transition-colors underline underline-offset-4 decoration-slate-200 hover:decoration-primary-200">Masuk ke Akun</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
