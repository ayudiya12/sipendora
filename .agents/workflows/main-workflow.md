---
description: Konsep Core, Logika Matematika FCFS, Struktur Role dan Menu, Metode Pengujian, dan Arsitektur Database
---

# 🏛️ SIPENDORA: Master Project Blueprint & Analysis

Dokumen ini merangkum seluruh hasil analisis mendalam terhadap **Laporan Tugas Akhir Ayu Diya Silfiani** untuk diimplementasikan ke dalam sistem **SIPENDORA**.

---

## 🔍 1. Ringkasan Proyek (Core Concept)
**SIPENDORA** (Sistem Informasi Pendapatan Dispora Palembang) adalah solusi digital berbasis web yang dirancang untuk mengotomatisasi seluruh proses manajemen penyewaan fasilitas olahraga dan pencatatan pendapatan di Dispora Kota Palembang.

### **Tujuan Utama (The Why)**
- **Eliminasi Konflik Jadwal:** Menghapus masalah *overlapping* pemesanan lapangan.
- **Transparansi Finansial:** Menjamin akurasi laporan pendapatan yang masuk ke kas daerah.
- **Efisiensi Birokrasi:** Memangkas proses manual yang memakan waktu (cek buku fisik, rekap manual).
- **Aksesibilitas Real-time:** Memberikan kepastian jadwal bagi masyarakat secara instan.

---

## 🛠️ 2. Solusi & Metodologi (The How)
Sistem ini diselesaikan dengan pendekatan teknis yang terukur:

### **Logika Utama: Algoritma FCFS (*First Come First Served*)**
Sistem menggunakan prinsip antrean adil: siapa yang memesan lebih dulu (berdasarkan *timestamp* sistem), dia yang mendapatkan hak sewa.

**Rumus Matematis Antrean:**
- **AT (*Arrival Time*):** Waktu presisi reservasi masuk.
- **BT (*Burst Time*):** Durasi pemakaian fasilitas (satuan jam).
- **ST (*Start Time*):** Waktu mulai penggunaan (**ST = CT** pemesan sebelumnya pada fasilitas yang sama).
- **CT (*Completion Time*):** Waktu selesai penggunaan (**ST + BT**).
- **TAT (*Turnaround Time*):** Waktu total dari proses pesan sampai selesai (**CT - AT**).
- **WT (*Waiting Time*):** Waktu tunggu sebelum bisa mulai (**TAT - BT**).
- **AWT (*Average Waiting Time*):** Rata-rata waktu tunggu seluruh penyewa.

### **Metode Pengembangan & Pengujian**
- **Metode RUP (*Rational Unified Process*):** Pendekatan iteratif melalui fase *Inception, Elaboration, Construction,* dan *Transition*.
- **Pemodelan UML:** *Use Case, Activity,* dan *Class Diagram* sebagai cetak biru sistem.
- **Pengujian SUS (*System Usability Scale*):** Validasi kepuasan user dengan skor target > 68.
    - **Rumus Skor SUS:** `((Σ Skor Ganjil - 1) + (5 - Σ Skor Genap)) × 2,5`
- **Teknologi:** PHP, MySQL, Apache (Standard XAMPP Stack).

---

## 👥 3. Struktur Role & Akses (RBAC)
Sistem menggunakan **Role-Based Access Control** untuk memisahkan kewenangan:

### **A. Penyewa (Masyarakat Umum)**
- **Fungsi:** Cek jadwal, registrasi, reservasi, upload bukti bayar.
- **Menu Utama:** Kalender Ketersediaan (Warna Hijau/Merah), Form Booking FCFS, Riwayat Transaksi, Cetak Tiket Digital.

### **B. Admin Dispora (Staf Administrasi)**
- **Fungsi:** Verifikasi transaksi, manajemen data lapangan, monitor antrean.
- **Menu Utama:** Dashboard Monitoring, Verifikasi Bukti Bayar, Manajemen Fasilitas (Tarif & Status), Laporan Harian/Bulanan.

### **C. Pimpinan (Kepala Dinas)**
- **Fungsi:** Pengawasan dan pengambilan kebijakan strategis.
- **Menu Utama:** Dashboard Analitik, Rekapitulasi Pendapatan Periodik, Grafik Tren Penggunaan Fasilitas Terpopuler.

---

## 💎 4. Detail Teknis Strategis (Premium Features)

### **Mekanisme Non-Preemptive Locking**
Fitur keamanan tingkat tinggi di mana slot jadwal akan **terkunci otomatis** saat seorang penyewa sedang dalam proses pembayaran. Orang lain tidak bisa memesan slot yang sama sampai transaksi tersebut selesai atau dinyatakan batal oleh admin/sistem (timeout).

### **Kalkulasi Pendapatan Otomatis**
Menghilangkan potensi manipulasi data dengan rumus:
`Total_Pendapatan = Σ(Tarif_Fasilitas × Burst_Time)`
Semua data keuangan diakumulasikan secara *real-time* ke tabel `tb_laporan`.

### **Arsitektur Database**
Struktur tabel inti yang saling berelasi:
- `tb_user`: Data login & role.
- `tb_fasilitas`: Master data lapangan & tarif.
- `tb_booking`: Tabel transaksi utama (pusat logika FCFS).
- `tb_pembayaran`: Penyimpanan bukti transaksi & status verifikasi.
- `tb_laporan`: Rekapitulasi periodik untuk pimpinan.

---

## 📈 5. Ekspektasi Hasil (Outcome)
Dengan implementasi SIPENDORA, diharapkan Dispora Kota Palembang memiliki sistem yang **Akurat, Transparan, dan Adil**, yang dibuktikan dengan hilangnya komplain jadwal bentrok dan meningkatnya akuntabilitas keuangan daerah.
