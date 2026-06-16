import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ArrowRight, User, Phone, MapPin, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import logo from '../../logo.png';

const UPLOAD_IMAGE = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80';

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

      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, payload);

      login(res.data.user, res.data.token);
      toast.success("Registrasi Berhasil! Akun Anda sedang menunggu verifikasi admin.");

      navigate('/pending');

    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Gagal melakukan registrasi";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ───────── LEFT: Image Panel (60%) ───────── */}
      <div className="relative w-full lg:w-3/5 min-h-[280px] lg:sticky lg:top-0 lg:h-screen overflow-hidden">
        <img
          src={UPLOAD_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-primary-950/80 via-primary-950/50 to-primary-950/20" />

        <div className="relative z-10 h-full flex flex-col justify-end lg:justify-center px-8 py-10 lg:px-16 lg:py-16 text-white">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-6 lg:mb-10 group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Link>
          <h1 className="text-3xl lg:text-5xl xl:text-6xl font-heading font-black tracking-tightest leading-tight mb-4">
            Bergabung dengan<br />SIPENDORA
          </h1>
          <p className="text-white/60 text-sm lg:text-base leading-relaxed max-w-md">
            Daftar sekarang dan mulai memesan fasilitas olahraga favorit Anda — mudah, cepat, terpercaya.
          </p>

          <div className="hidden lg:block w-16 h-1 bg-white/20 rounded-full mt-8" />
        </div>
      </div>

      {/* ───────── RIGHT: Form Panel (40%) — scrollable ───────── */}
      <div className="w-full lg:w-2/5 bg-white px-6 py-12 lg:px-14 lg:py-16 lg:overflow-y-auto lg:max-h-screen">
        <div className="w-full max-w-[420px] mx-auto animate-fade-up">

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="SIPENDORA"
              className="h-11 mx-auto mb-5 brightness-0 transition-transform duration-700 hover:scale-110"
            />
            <h2 className="text-2xl font-black text-text-primary tracking-tightest mb-2">Daftar Akun</h2>
            <p className="text-text-muted text-xs font-medium">Lengkapi data untuk mulai memesan fasilitas</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-border-dark group-focus-within:text-primary-500 transition-colors" size={16} />
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Masukkan nama sesuai KTP"
                  className="w-full bg-surface-subtle border border-border rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-500 focus:bg-surface-base focus:shadow-focus transition-all duration-300 font-medium text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-border-dark group-focus-within:text-primary-500 transition-colors" size={16} />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@anda.com"
                    className="w-full bg-surface-subtle border border-border rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-500 focus:bg-surface-base focus:shadow-focus transition-all duration-300 font-medium text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">WhatsApp</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-border-dark group-focus-within:text-primary-500 transition-colors" size={16} />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0812xxx"
                    className="w-full bg-surface-subtle border border-border rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-500 focus:bg-surface-base focus:shadow-focus transition-all duration-300 font-medium text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Alamat Domisili</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 text-border-dark group-focus-within:text-primary-500 transition-colors" size={16} />
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Contoh: Jl. Merdeka No. 10, Palembang"
                  className="w-full bg-surface-subtle border border-border rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-500 focus:bg-surface-base focus:shadow-focus transition-all duration-300 font-medium text-sm min-h-[80px]"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* NIK */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">NIK</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-border-dark group-focus-within:text-primary-500 transition-colors" size={16} />
                  <input
                    name="nik"
                    type="text"
                    value={formData.nik}
                    onChange={handleChange}
                    placeholder="Nomor Identitas Kependudukan"
                    className="w-full bg-surface-subtle border border-border rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-500 focus:bg-surface-base focus:shadow-focus transition-all duration-300 font-medium text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[10px] text-text-muted font-medium ml-1">16 digit angka</p>
              </div>

              {/* Foto Profil */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Foto Profil</label>
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
                  className="flex flex-col items-center justify-center gap-2 w-full bg-surface-subtle border-2 border-dashed border-border-light rounded-xl py-5 px-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-all duration-300 group"
                >
                  {previewPhoto ? (
                    <div className="relative">
                      <img src={previewPhoto} alt="Preview" className="w-20 h-20 object-cover rounded-full border-2 border-border" />
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                        <Camera size={24} className="text-border-dark group-hover:text-primary-500 transition-colors" />
                      </div>
                      <span className="text-xs font-semibold text-text-secondary group-hover:text-primary-600 transition-colors">Pilih Foto</span>
                    </>
                  )}
                </label>
                <div className="flex items-center justify-between ml-1">
                  <p className="text-[10px] text-text-muted font-medium">Maksimal 5MB</p>
                  {previewPhoto && (
                    <label htmlFor="photoInput" className="text-[10px] text-primary-600 font-black cursor-pointer hover:underline">Ubah</label>
                  )}
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-border-dark group-focus-within:text-primary-500 transition-colors" size={16} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Buat sandi kuat"
                  className="w-full bg-surface-subtle border border-border rounded-xl py-3 pl-11 pr-11 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-500 focus:bg-surface-base focus:shadow-focus transition-all duration-300 font-medium text-sm"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-border-dark hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-700 hover:bg-primary-800 text-text-inverse py-4 rounded-xl font-black flex items-center justify-center gap-3 group transition-all duration-350 ease-out-expo active:scale-[0.98] shadow-glow-primary mt-4 disabled:opacity-70"
            >
              {isLoading ? "Sedang Mendaftar..." : "Daftar Sekarang"}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 pt-5 border-t border-border-light">
            <p className="text-text-muted text-xs font-medium">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary-600 font-black hover:text-primary-700 transition-colors">Masuk ke Akun</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
