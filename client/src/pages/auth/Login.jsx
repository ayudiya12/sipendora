import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import logo from '../../logo.png';

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
      // 1. Tembak API Backend
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, { 
        email, 
        password 
      });

      login(res.data.user, res.data.token);

      // Cek flag untuk mencegah toast double (React Strict Mode)
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
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-128 h-128 bg-primary-100/40 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[-10%] w-128 h-128 bg-secondary-100/30 rounded-full blur-[100px] animate-pulse-soft" />
      </div>

      {/* Main Card */}
      <div
        className="w-full max-w-[440px] bg-card-bg border border-card-border rounded-3xl p-8 lg:p-12 shadow-card-xl relative z-10 animate-fade-up"
      >
        {/* Back Button */}
        <Link to="/" className="absolute top-8 left-8 text-text-muted hover:text-primary-600 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Beranda
        </Link>

        {/* Logo & Header */}
        <div className="text-center mb-8 mt-6">
          <img 
            src={logo} 
            alt="SIPENDORA" 
            className="h-14 mx-auto mb-6 brightness-0 transition-transform duration-700 hover:scale-110" 
          />
          <h2 className="text-2xl font-black text-text-primary tracking-tightest mb-2">Selamat Datang</h2>
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
            Belum punya akun? <br />
            <Link to="/register" className="text-text-primary font-black hover:text-primary-600 transition-colors underline underline-offset-4 decoration-border hover:decoration-primary-200">Daftar Akun Baru</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
