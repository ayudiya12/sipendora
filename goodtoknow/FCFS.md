# 📈 Dokumentasi Analisis Algoritma FCFS Sipendora
> Penjelasan mekanisme antrean First-Come-First-Served dan cara kerja simulasi data.

Dokumen ini menjelaskan bagaimana algoritma **FCFS** diimplementasikan di Sipendora dan bagaimana skrip `seeder.js` mensimulasikan antrean nyata untuk kebutuhan analisis pimpinan.

---

## 🏗️ Mekanisme Simulasi (Node.js Seeder)

Sistem menggunakan skrip otomatis **`server/database/seeder.js`** untuk mengisi database dengan ratusan data booking yang realistis.

### 1. Skenario Distribusi Era
Seeder membagi data menjadi dua era utama untuk mensimulasikan siklus hidup FCFS:
*   **Era Lama (> 3 hari lalu)**: Mensimulasikan booking yang sudah selesai. Hanya ada status `CONFIRMED` (berhasil bayar) atau `CANCELED` (gagal bayar/auto-cancel).
*   **Era Baru (Kemarin s/d Lusa)**: Mensimulasikan kondisi *live*. Semua status (`PENDING`, `APPROVED`, `WAITING_VERIFICATION`) muncul untuk menunjukkan antrean yang sedang berjalan.

### 2. Slot & Unit Tracker
Algoritma seeder memastikan tidak ada unit yang tumpang tindih:
1.  Setiap fasilitas memiliki jumlah unit fisik (misal: Badminton memiliki 2 lapangan).
2.  Sistem mencari slot kosong berdasarkan `tanggal` dan `sesi`.
3.  Jika semua unit penuh pada sesi tersebut, booking otomatis diubah menjadi `CANCELED` (mensimulasikan user yang kalah cepat dalam antrean).

---

## 📏 Penjelasan Metrik Matematis

Setiap data booking di Sipendora menyimpan hasil kalkulasi dari `fcfsHelper.js`:

| Metrik | Nama Lengkap | Penjelasan |
| :--- | :--- | :--- |
| **AT** | Arrival Time | Waktu saat user pertama kali memesan (Timestamp). |
| **BT** | Burst Time | Durasi penggunaan lapangan (dalam menit). |
| **ST** | Start Time | Jam mulai resmi sesi yang dipilih. |
| **CT** | Completion Time | Jam selesai resmi sesi (`ST + BT`). |
| **WT** | Waiting Time | Selisih `ST - AT`. Semakin lama jarak antara pesan dan main, WT semakin tinggi. |
| **TAT** | Turnaround Time | Total waktu dari pesan sampai selesai main (`CT - AT`). |

---

## 🛠️ Cara Menjalankan Simulasi

1.  Pastikan Anda berada di folder `server/`.
2.  Instal dependency jika belum: `npm install`.
3.  Jalankan perintah seeder:
    ```bash
    node database/seeder.js
    ```
4.  **Verifikasi di Aplikasi**: 
    *   Masuk sebagai **Pimpinan**.
    *   Buka menu **Laporan Analisis FCFS**.
    *   Lihat bagaimana sistem memvisualisasikan tingkat kepadatan antrean per fasilitas.

---
*Sipendora FCFS documentation — Updated for Seeder v3.0 (Node.js version).*
