import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import logo from '../../logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, user, logout, getRedirectPath } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Beranda', href: '#beranda' },
    { name: 'Fasilitas', href: '#fasilitas' },
    { name: 'Cara Pesan', href: '#cara-pesan' },
    { name: 'Kontak', href: '#kontak' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-600/95 backdrop-blur-lg border-b border-white/10 shadow-card-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-5 h-18 lg:h-22 flex items-center justify-between">
        
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center shrink-0"
        >
          <Link to="/" className="transition-transform duration-300 hover:scale-105 active:scale-95">
            <img src={logo} alt="SIPENDORA Logo" className="h-10 lg:h-14 w-auto" />
          </Link>
        </motion.div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 lg:space-x-10 text-white/80 font-bold text-[11px] uppercase tracking-widest">
          {navLinks.map((link, idx) => (
            <motion.a 
              key={link.name} 
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="relative py-2 hover:text-white transition-colors group cursor-pointer"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center" />
            </motion.a>
          ))}
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
               <Link
                to={getRedirectPath(user)}
                className="bg-white text-primary-600 hover:bg-surface-subtle px-6 py-2.5 rounded-xl font-black text-2xs uppercase tracking-widest transition-all duration-300 shadow-elevation-2 flex items-center gap-2 group"
              >
                <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-danger-500/10 text-white hover:bg-danger-500 transition-all border border-white/10"
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="text-white hover:text-white/80 px-4 py-2.5 rounded-xl font-black text-2xs uppercase tracking-widest transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                Daftar
              </Link>
              <Link
                to="/login"
                className="bg-white text-primary-600 hover:bg-surface-subtle px-6 py-2.5 rounded-xl font-black text-2xs uppercase tracking-widest transition-all duration-350 shadow-elevation-3 active:scale-95"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary-700 border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white/80 font-bold text-sm uppercase tracking-[0.2em] hover:text-white"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-white/10" />
              {isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <Link
                    to={getRedirectPath(user)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-white text-primary-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-danger-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-white/10 text-white border border-white/20 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center"
                  >
                    Daftar Akun
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-white text-primary-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg"
                  >
                    Masuk Akun
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
