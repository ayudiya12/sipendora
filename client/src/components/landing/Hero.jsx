import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck, Play, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <section id="beranda" className="relative min-h-[calc(100vh-72px)] flex items-center pt-24 lg:pt-32 pb-16 lg:pb-22 px-6 overflow-hidden bg-surface-subtle">

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[5%] -left-[10%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-primary-50/50 rounded-full blur-2xl lg:blur-xl animate-pulse-soft" />
        <div className="absolute bottom-[5%] -right-[10%] w-[250px] lg:w-[500px] h-[250px] lg:h-[500px] bg-secondary-50/40 rounded-full blur-2xl lg:blur-xl animate-pulse-soft" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 w-full">

        {/* Text Content */}
        <motion.div className="animate-fade-up text-center lg:text-left order-2 lg:order-1">
          <motion.div
            className="inline-flex items-center gap-2.5 text-primary-600 font-bold text-[10px] lg:text-2xs uppercase tracking-[0.2em] mb-6 lg:mb-7 bg-primary-50 px-4 py-2 rounded-full border border-primary-100 shadow-elevation-1"
          >
            <span className="hidden lg:block w-8 h-[1.5px] bg-primary-500" />
            Portal Resmi Dispora Palembang
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tightest mb-6 lg:mb-7 text-text-primary">
            Olahraga Lebih
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              Mudah & Teratur
            </span>
          </h1>

          <p className="text-base lg:text-lg text-text-secondary mb-10 lg:mb-12 max-w-[480px] mx-auto lg:mx-0 leading-relaxed font-medium">
            Satu pintu pemesanan fasilitas olahraga resmi Kota Palembang. Jadwal real-time, konfirmasi instan, tanpa bentrok.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12 lg:mb-15">
            <Link 
              to="/register"
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-text-inverse px-10 lg:px-13 py-4 lg:py-4.5 rounded-2xl lg:rounded-xl font-bold flex items-center justify-center gap-2 group transition-all duration-350 ease-out-expo active:scale-95 shadow-glow-primary hover:-translate-y-0.5"
            >
              Booking Sekarang
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => document.getElementById('fasilitas')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-white hover:bg-surface-muted text-text-primary border border-border px-10 lg:px-13 py-4 lg:py-4.5 rounded-2xl lg:rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-card-sm"
            >
              <Play size={16} className="fill-primary-500 text-primary-500" />
              Lihat Fasilitas
            </button>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-8 lg:gap-15">
            {[["4", "Fasilitas"], ["50+", "Booking"], ["16/7", "Layanan"]].map(([n, l]) => (
              <div key={l} className="group cursor-default">
                <p className="font-heading text-2xl lg:text-4xl font-extrabold text-text-primary tracking-tightest leading-none group-hover:text-primary-600 transition-colors">
                  {n.includes("+") ? <>{n.replace("+", "")}<span className="text-primary-500">+</span></> : n}
                </p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-2">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Visual Content */}
        <motion.div className="relative animate-fade-in transition-all duration-700 delay-300 order-1 lg:order-2">
          <div className="relative rounded-3xl lg:rounded-4xl overflow-hidden aspect-[4/3] shadow-card-xl border-2 lg:border-4 border-surface-base">
            <img
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"
              alt="Stadion Palembang"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-invert/40 via-transparent to-transparent" />
          </div>

          {/* Floating Card 1 - Mobile Optimized */}
          <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-surface-base/95 backdrop-blur-md border border-border rounded-2xl lg:rounded-3xl px-4 lg:px-6 py-3 lg:py-5 flex items-center gap-3 lg:gap-4 shadow-card-xl animate-float z-20">
            <div className="w-10 h-10 lg:w-13 lg:h-13 bg-primary-600 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 shadow-glow-primary">
              <CalendarCheck size={18} className="lg:size-22 text-text-inverse" />
            </div>
            <div>
              <p className="text-xs lg:text-sm font-bold text-text-primary leading-tight">Konfirmasi Instan</p>
              <p className="text-[10px] lg:text-xs text-text-muted font-medium">Otomatis tercatat</p>
            </div>
          </div>

          {/* Floating Card 2 - Hidden on very small screens to avoid clutter */}
          <div className="hidden sm:block absolute top-4 -right-4 lg:top-8 lg:-right-8 bg-surface-base/95 backdrop-blur-md border border-border rounded-2xl lg:rounded-3xl px-4 lg:px-5 py-3 lg:py-4 shadow-card-lg animate-pulse-soft z-20">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-[9px] lg:text-xs font-black text-success-600 tracking-wider uppercase">LIVE</span>
            </div>
            <p className="text-[10px] lg:text-xs text-text-secondary font-bold tracking-tight italic">4 Lapangan Aktif</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;