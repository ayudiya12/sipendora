import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import logo from '../../logo.png';

const UPLOAD_IMAGE = 'https://images.unsplash.com/photo-1613918431703-aa50889e3be9?auto=format&fit=crop&w=1200&q=80';

const Login = () => {
  const navigate = useNavigate();
  const { login, getRedirectPath } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        email,
        password
      });

      login(res.data.user, res.data.token);

      const toastKey = `login-toast-${res.data.user.id}`;
      if (!sessionStorage.getItem(toastKey)) {
        toast.success(`Selamat Datang, ${res.data.user.nama}!`, { id: 'login-success' });
        sessionStorage.setItem(toastKey, 'shown');
      }

      const redirectPath = getRedirectPath(res.data.user);
      navigate(redirectPath);

    } catch (error) {
      const message = error.response?.data?.message || "Terjadi kesalahan sistem";
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
        {/* Gradient overlay — bottom on mobile, right on desktop */}
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-primary-950/80 via-primary-950/50 to-primary-950/20" />

        {/* Brand text */}
        <div className="relative z-10 h-full flex flex-col justify-end lg:justify-center px-8 py-10 lg:px-16 lg:py-16 text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-6 lg:mb-10 group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Beranda
          </Link>
          <h1 className="text-3xl lg:text-5xl xl:text-6xl font-heading font-black tracking-tightest leading-tight mb-4">
            Selamat Datang<br />di SIPENDORA
          </h1>
          <p className="text-white/60 text-sm lg:text-base leading-relaxed max-w-md">
            Sistem Informasi Pemesanan Dispora Palembang — pesan fasilitas olahraga dengan mudah dan cepat.
          </p>

          {/* Decorative line */}
          <div className="hidden lg:block w-16 h-1 bg-white/20 rounded-full mt-8" />
        </div>
      </div>

      {/* ───────── RIGHT: Form Panel (40%) ───────── */}
      <div className="w-full lg:w-2/5 flex items-center justify-center bg-white px-6 py-12 lg:px-14 lg:py-16">
        <div className="w-full max-w-[400px] animate-fade-up">

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="SIPENDORA"
              className="h-11 mx-auto mb-5 brightness-0 transition-transform duration-700 hover:scale-110"
            />
            <h2 className="text-2xl font-black text-text-primary tracking-tightest mb-2">Masuk</h2>
            <p className="text-text-muted text-xs font-medium">Masuk ke akun SIPENDORA Anda</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Resmi</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-border-dark group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-surface-subtle border border-border rounded-xl py-3.5 pl-11 pr-4 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-500 focus:bg-surface-base focus:shadow-focus transition-all duration-300 font-medium text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-border-dark group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-subtle border border-border rounded-xl py-3.5 pl-11 pr-11 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-500 focus:bg-surface-base focus:shadow-focus transition-all duration-300 font-medium text-sm"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-border-dark hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-text-inverse py-4 rounded-xl font-black flex items-center justify-center gap-3 group transition-all duration-350 ease-out-expo active:scale-[0.98] shadow-glow-primary mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sedang Masuk..." : "Masuk Sekarang"}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-border-light">
            <p className="text-text-muted text-xs font-medium">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary-600 font-black hover:text-primary-700 transition-colors">Daftar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
