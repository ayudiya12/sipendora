import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, LogOut, MessageCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import logo from "../../logo.png";

const AccountPending = () => {
  const navigate = useNavigate();
  const { user, logout, checkAuth } = useAuthStore();
  const [adminContact, setAdminContact] = useState({
    nama: "Admin Dispora",
    no_telp: "-",
  });

  useEffect(() => {
    // 0. Cek status terbaru ke server segera saat masuk halaman
    checkAuth();

    // 1. Jika user sudah aktif, langsung ke dashboard
    if (user && user.status_akun === 1) {
      navigate("/dashboard");
      return;
    }

    // 2. Ambil kontak admin (sekali saja)
    const fetchContact = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/admin-contact`,
        );
        setAdminContact(res.data);
      } catch (error) {
        console.error("Gagal mengambil kontak admin");
      }
    };
    fetchContact();

    // 3. Polling Status: Cek status akun setiap 10 detik secara otomatis
    const interval = setInterval(() => {
      checkAuth(); // Ini akan memperbarui state 'user' di store
    }, 10000);

    return () => clearInterval(interval); // Bersihkan interval saat pindah halaman
  }, [user, navigate, checkAuth]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleWhatsApp = () => {
    const phone = adminContact.no_telp.replace(/\D/g, "");
    let cleanPhone = phone;
    if (phone.startsWith("0")) cleanPhone = "62" + phone.substring(1);

    const message = `Halo ${adminContact.nama}, saya ${user.nama}. Saya baru saja mendaftar di SIPENDORA dan ingin melakukan verifikasi akun. Mohon bantuannya. Terima kasih.`;
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-10 shadow-2xl shadow-slate-200/50 relative z-10 text-center mx-4"
      >
        <img
          src={logo}
          alt="SIPENDORA"
          className="h-10 lg:h-12 mx-auto mb-6 lg:mb-8 brightness-0"
        />

        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-100 relative">
          <Clock size={40} className="animate-pulse" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
            <ShieldAlert size={16} className="text-amber-500" />
          </div>
        </div>

        <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight mb-3">
          Akun Sedang Diverifikasi
        </h1>
        <p className="text-[13px] lg:text-sm text-slate-400 font-medium leading-relaxed mb-6 lg:mb-8">
          Halo <span className="text-slate-900 font-bold">{user?.nama}</span>,
          akun Anda saat ini sedang dalam antrean verifikasi oleh Admin Dispora.
          Mohon tunggu maksimal 1x24 jam.
        </p>

        <div className="space-y-4">
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Kontak Verifikasi
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900">
                  {adminContact.nama}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  {adminContact.no_telp}
                </p>
              </div>
              <button
                onClick={handleWhatsApp}
                className="w-10 h-10 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg shadow-green-100"
              >
                <MessageCircle size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200"
          >
            <LogOut size={16} /> Keluar Akun
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
            Sistem Informasi Peminjaman Gedung & Olahraga
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountPending;
