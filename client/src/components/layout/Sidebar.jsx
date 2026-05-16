import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  FileText,
  ChevronRight,
  ClipboardList,
  MapPin,
  Activity,
  X,
  Home,
  CreditCard,
  UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import logo from '../../logo.png';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const menuConfig = {
    penyewa: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Pesanan Saya', path: '/bookings', icon: ClipboardList },
      { name: 'Cari Lapangan', path: '/facilities', icon: MapPin },
      { name: 'Profil', path: '/profile', icon: UserIcon },
    ],
    admin: [
      { name: 'Dashboard Admin', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Verifikasi Booking', path: '/admin/bookings', icon: ClipboardList },
      { name: 'Antrean', path: '/admin/fcfs', icon: Activity },
      { name: 'Kelola Fasilitas', path: '/admin/facilities', icon: MapPin },
      { name: 'Data Pengguna', path: '/admin/users', icon: Users },
      { name: 'Data Rekening', path: '/admin/rekening', icon: CreditCard },
    ],
    pimpinan: [
      { name: 'Dashboard Pimpinan', path: '/report/dashboard', icon: LayoutDashboard },
      { name: 'Laporan Rekapitulasi', path: '/pimpinan/laporan', icon: FileText },
    ]
  };

  const menus = menuConfig[user?.role?.toLowerCase()] || [];

  return (
    <aside className="w-72 bg-text-primary h-screen sticky top-0 flex flex-col z-50 overflow-hidden shadow-2xl">
      {/* Header Sidebar - Branding */}
      <div className="p-8 mb-4 flex items-center justify-between">
        <div>
          <img src={logo} alt="SIPENDORA" className="h-10 brightness-0 invert" />
          <div className="mt-4 h-1 w-12 bg-primary-500 rounded-full" />
        </div>
        
        {/* Close Button (Mobile Only) */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Menu List */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-10">
        <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Navigasi Utama</p>
        {menus.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose} // Tutup sidebar saat menu diklik di mobile
              className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)]' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4 z-10">
                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-primary-400 transition-colors'} />
                <span className={`text-sm font-bold tracking-tight ${isActive ? 'translate-x-1' : ''} transition-transform duration-300`}>{item.name}</span>
              </div>
              
              {isActive && (
                <motion.div 
                   layoutId="activeTab"
                   className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 z-0" 
                />
              )}
              
              {isActive && <ChevronRight size={16} className="text-white/50 z-10" />}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className="p-4 mt-auto border-t border-white/5 space-y-4">
         <Link 
            to="/" 
            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-white/50 hover:bg-white/5 hover:text-white transition-all group border border-dashed border-white/10"
         >
            <Home size={20} className="group-hover:text-primary-400 transition-colors" />
            <span className="text-sm font-bold tracking-tight">Kembali ke Beranda</span>
         </Link>

         {/* Sidebar Status Info */}
         <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hidden lg:block">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Status Sistem</p>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
               <span className="text-xs font-bold text-white/80">Sistem Online</span>
            </div>
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;
