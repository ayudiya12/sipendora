import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import FacilityList from '../components/landing/FacilityList';

const steps = [
  { n: "01", title: "Pilih Fasilitas", desc: "Telusuri fasilitas olahraga resmi Dispora Palembang.", active: false },
  { n: "02", title: "Tentukan Jadwal", desc: "Pilih tanggal & jam yang tersedia secara real-time.", active: true },
  { n: "03", title: "Konfirmasi", desc: "Verifikasi data pemesanan sebelum dikirim.", active: false },
  { n: "04", title: "Selesai!", desc: "Bukti pemesanan dikirim via email atau WhatsApp.", active: false },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface-subtle text-text-secondary selection:bg-primary-100 selection:text-primary-700">
      <Navbar />
      <main>
        <Hero />
        <FacilityList />

        {/* HOW IT WORKS */}
        <section id="cara-pesan" className="py-20 lg:py-30 bg-surface-subtle border-t border-border-light">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 lg:mb-22 animate-fade-up">
              <span className="inline-flex items-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-widest bg-primary-50 border border-primary-100 px-6 py-3 rounded-full mb-6 lg:mb-8 shadow-elevation-1">
                Panduan Pemesanan
              </span>
              <h2 className="text-3xl lg:text-6xl font-black text-text-primary tracking-tightest leading-tight">
                Mudah dalam 4 Langkah
              </h2>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-15 relative">
              <div className="absolute hidden md:block top-10 left-[15%] right-[15%] h-[2px] bg-border-light z-0" />
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="text-center relative z-10 animate-fade-up"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className={`w-16 h-16 lg:w-18 lg:h-18 rounded-3xl flex items-center justify-center mx-auto mb-6 lg:mb-8 font-heading font-black text-xl lg:text-2xl shadow-card transition-all duration-350 ease-spring ${s.active ? 'bg-primary-600 text-text-inverse scale-110 shadow-glow-primary' : 'bg-surface-base text-text-primary border border-border-light'}`}>
                    {s.n}
                  </div>
                  <h3 className="text-lg lg:text-xl font-black text-text-primary mb-2 lg:mb-3">{s.title}</h3>
                  <p className="text-xs lg:text-sm text-text-muted leading-relaxed font-medium px-4">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="kontak" className="py-20 lg:py-32 px-6">
          <div className="max-w-5xl mx-auto bg-surface-invert rounded-3xl lg:rounded-4xl p-10 md:p-15 lg:p-26 text-center relative overflow-hidden shadow-elevation-5 animate-fade-up">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 lg:w-128 h-64 lg:h-128 bg-primary-500/10 rounded-full blur-[80px] lg:blur-[120px] -mr-32 -mt-32 lg:-mr-64 lg:-mt-64 animate-pulse-soft" />
            <div className="absolute bottom-0 left-0 w-64 lg:w-128 h-64 lg:h-128 bg-secondary-500/10 rounded-full blur-[80px] lg:blur-[120px] -ml-32 -mb-32 lg:-ml-64 lg:-mb-64 animate-pulse-soft" />

            <div className="relative z-10">
                <span className="inline-flex items-center gap-2 text-primary-400 font-black text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 px-6 py-3 rounded-full mb-8 lg:mb-10 shadow-elevation-1">
                  Mulai Sekarang
                </span>
                <h2 className="text-3xl lg:text-7xl font-black text-text-inverse tracking-tightest leading-tight mb-8 lg:mb-10">
                  Siap Reservasi <br /> Lapangan Anda?
                </h2>
                <p className="text-text-inverse/50 mb-10 lg:mb-15 max-w-xl mx-auto leading-relaxed text-sm lg:text-lg font-medium">
                  Bergabunglah dengan ratusan penyewa yang telah merasakan kemudahan layanan digital Dispora Kota Palembang.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => document.getElementById('fasilitas')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-text-inverse px-10 lg:px-13 py-4 lg:py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all duration-350 ease-out-expo active:scale-95 shadow-glow-primary hover:-translate-y-1"
                    >
                        Pesan Sekarang
                        <ArrowRight size={22} />
                    </button>
                    <button 
                        onClick={() => window.open('https://wa.me/628123456789', '_blank')}
                        className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-text-inverse border border-white/10 px-10 lg:px-13 py-4 lg:py-5 rounded-2xl font-black transition-all duration-300 active:scale-95"
                    >
                        Hubungi Bantuan
                    </button>
                </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 lg:py-15 bg-surface-base border-t border-border-light text-center">
        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest px-6 leading-loose">
          © 2026 <span className="text-text-primary">SIPENDORA</span> — Dinas Pemuda dan Olahraga <br className="sm:hidden" /> Kota Palembang.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;