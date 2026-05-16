# SIPENDORA

## Sistem Informasi Pengelolaan Pendapatan Sewa Fasilitas Olahraga

### Dinas Pemuda dan Olahraga (Dispora) Kota Palembang

---

## 📋 Deskripsi Aplikasi

**SIPENDORA** _(Sistem Informasi Pendapatan Dispora Palembang)_ adalah aplikasi berbasis web yang dirancang untuk mendigitalisasi seluruh proses administrasi penyewaan dan pencatatan pendapatan fasilitas olahraga milik Dinas Pemuda dan Olahraga (Dispora) Kota Palembang.

Sistem ini mengimplementasikan algoritma **First Come First Served (FCFS)** sebagai mekanisme pengelolaan antrean jadwal secara otomatis, dilengkapi dengan **Role-Based Access Control (RBAC)** untuk tiga peran pengguna, serta modul pelaporan pendapatan retribusi yang terintegrasi dan akuntabel.

> **Konteks Akademik:** Proyek ini merupakan implementasi dari Tugas Akhir berjudul _"Implementasi Algoritma First Come First Served (FCFS) Pada Aplikasi Pengelolaan Pendapatan Sewa Fasilitas Olahraga Di Dinas Pemuda dan Olahraga (Dispora) Kota Palembang"_ oleh **Ayu Diya Silfiani** (NIM. 062240833065), Program Studi D-IV Manajemen Informatika, Politeknik Negeri Sriwijaya, 2026.

---

## 🚨 Latar Belakang Masalah

Dinas Pemuda dan Olahraga (Dispora) Kota Palembang adalah instansi pemerintah yang bertanggung jawab mengelola berbagai fasilitas olahraga milik pemerintah kota, seperti lapangan sepak bola, lapangan bulu tangkis, dan lapangan tenis, yang digunakan secara intensif oleh masyarakat umum maupun organisasi.

Namun, berdasarkan hasil observasi dan wawancara langsung dengan **Bapak Astan Budianto, S.E.** selaku Kepala Bidang Peningkatan Prestasi Olahraga (PPO) Dispora Kota Palembang, sistem yang berjalan saat ini masih dilakukan secara **manual** dan menghadapi tiga permasalahan utama:

| #   | Permasalahan                                                                                                       | Dampak                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 1   | **Tumpang tindih jadwal (overlapping)** — pemesanan dicatat di buku/kertas tanpa mekanisme penguncian otomatis     | Konflik penggunaan fasilitas pada jam dan tanggal yang sama                    |
| 2   | **Ketidakakuratan pencatatan pendapatan** — rekapitulasi harian dan bulanan dilakukan secara manual                | Potensi human error, manipulasi data, dan laporan yang tidak akurat            |
| 3   | **Ketiadaan mekanisme pemantauan real-time** — penyewa harus datang langsung ke kantor untuk mengecek ketersediaan | Inefisiensi waktu dan menurunnya kepercayaan publik terhadap layanan birokrasi |

---

## 🎯 Tujuan Penelitian

Membangun sebuah aplikasi berbasis web yang mampu:

1. **Mengelola administrasi penyewaan** fasilitas lapangan olahraga di Dispora Kota Palembang secara digital dan terintegrasi.
2. **Mencegah konflik jadwal (overlapping)** melalui implementasi algoritma FCFS sebagai mekanisme antrean yang adil dan otomatis berdasarkan _timestamp_ pemesanan.
3. **Memastikan akurasi data keuangan** dengan pencatatan pendapatan sewa yang tersinkronisasi secara real-time.
4. **Menyediakan laporan pendapatan otomatis** yang akuntabel sebagai pendukung pengambilan keputusan strategis pimpinan Dispora.
5. **Meningkatkan aksesibilitas layanan publik** sehingga masyarakat dapat melakukan pemesanan fasilitas kapan saja dan dari mana saja tanpa harus hadir secara fisik ke kantor.

---

## 🏗️ Tech Stack

### Frontend

| Teknologi            | Kegunaan                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| **Vite**             | Build tool & development server (fast HMR)                                 |
| **React**            | Library UI berbasis komponen                                               |
| **Tailwind CSS**     | Utility-first CSS framework untuk styling responsif                        |
| **Headless UI**      | Komponen UI accessible tanpa opinionated styling (modal, dropdown, dialog) |
| **React Router DOM** | Client-side routing & navigasi antar halaman                               |
| **Axios**            | HTTP client untuk komunikasi dengan REST API backend                       |
| **Zustand**          | Lightweight global state management (auth state, user role, booking data)  |
| **Framer Motion**    | Animasi dan transisi antarmuka yang halus                                  |
| **Lucide React**     | Icon library modern dan konsisten                                          |

### Backend

| Teknologi                | Kegunaan                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| **Node.js**              | Runtime JavaScript sisi server                                        |
| **Express.js**           | Web framework minimalis untuk membangun REST API                      |
| **MySQL**                | Relational database management system                                 |
| **JWT (JSON Web Token)** | Autentikasi stateless & otorisasi berbasis token                      |
| **bcrypt**               | Hashing password secara aman sebelum disimpan ke database             |
| **dotenv**               | Manajemen environment variables (kredensial DB, secret key JWT, dll.) |

---

## 👥 Role Pengguna (RBAC)

Sistem mengimplementasikan **Role-Based Access Control (RBAC)** dengan tiga peran pengguna yang memiliki hak akses berbeda-beda.

---

### 🧑‍💼 1. Penyewa (Masyarakat Umum)

Pengguna eksternal yang ingin menyewa fasilitas olahraga.

**Hak Akses & Fitur:**

- Mendaftar akun baru (registrasi)
- Login ke aplikasi web
- Melihat daftar fasilitas olahraga beserta tarif sewa per sesi
- Melihat ketersediaan jadwal secara **real-time** (slot hijau = tersedia, slot merah = terisi)
- Melakukan pemesanan fasilitas — diproses otomatis oleh algoritma **FCFS** berdasarkan _timestamp_ klik pemesanan
- Mengunggah bukti pembayaran
- Menerima notifikasi konfirmasi pemesanan (berhasil/ditolak)
- Melihat riwayat pemesanan pribadi

---

### 🛠️ 2. Admin Dispora (Staf Administrasi)

Staf internal Dispora yang mengelola operasional sistem sehari-hari.

**Hak Akses & Fitur:**

- Login ke panel administrasi
- Mengelola data fasilitas olahraga (tambah, edit, hapus, atur tarif sewa)
- Memverifikasi bukti pembayaran yang dikirimkan penyewa
- Menyetujui atau menolak pemesanan
- Mengelola data pengguna (manajemen akun penyewa)
- Memantau antrean pemesanan yang dikelola oleh algoritma FCFS secara real-time
- Mengunci slot jadwal secara otomatis via mekanisme _database lock_ FCFS
- Mengelola dan memvalidasi data rekapitulasi pendapatan sebelum diteruskan ke pimpinan

---

### 👔 3. Pimpinan (Kepala Dinas)

Pimpinan Dispora yang memerlukan akses strategis dan read-only terhadap laporan keuangan.

**Hak Akses & Fitur:**

- Login ke dashboard pimpinan
- Melihat laporan pendapatan sewa secara periodik (harian, mingguan, bulanan, tahunan) yang dihasilkan **otomatis** oleh sistem
- Melihat rekap pendapatan dalam format tabel dan grafik batang per jenis fasilitas
- Menganalisis tren penggunaan fasilitas olahraga untuk mendukung pengambilan keputusan strategis dan optimalisasi sarana
- Mereview dan menyetujui laporan pendapatan final

---

## 🔄 Workflow Lama (Sistem Manual yang Berjalan)

Proses pengelolaan sewa fasilitas olahraga sebelum SIPENDORA berjalan sepenuhnya secara manual dan hanya bisa diinisiasi ketika penyewa **hadir secara fisik** ke kantor Dispora.

```
[PENYEWA]
    │
    ▼
Datang langsung ke kantor Dispora (tatap muka, wajib hadir fisik)
    │
    ▼
Menyampaikan permintaan sewa fasilitas kepada staf admin
    │
    ▼
[STAF ADMIN DISPORA]
    │
    ▼
Memeriksa ketersediaan jadwal secara manual di buku/kertas catatan
    │
    ├──[Jadwal TIDAK TERSEDIA]──►  Sampaikan info penolakan ke penyewa
    │                                       │
    │                               Penyewa menerima info, proses SELESAI
    │                               (tanpa transaksi)
    │
    └──[Jadwal TERSEDIA]
            │
            ▼
    Mencatat pemesanan secara manual di buku
            │
            ▼
    Memberitahu tarif sewa kepada penyewa
            │
            ▼
    [PENYEWA] Melakukan pembayaran (tunai/transfer)
            │
            ▼
    [STAF ADMIN] Menerima pembayaran & membuat kwitansi manual
            │
            ▼
    Menyerahkan kwitansi ke penyewa → Proses dari sisi penyewa SELESAI
            │
            ▼
    Mencatat pendapatan harian secara manual ke catatan harian
            │
            ▼
    Merekapitulasi catatan harian menjadi laporan pendapatan bulanan
            │
            ▼
    Menyerahkan laporan bulanan ke pimpinan
            │
            ▼
[PIMPINAN]
    │
    ▼
Memeriksa kesesuaian dan akurasi data laporan
    │
    ├──[TIDAK SESUAI]──► Kembalikan ke staf admin untuk diperbaiki
    │                           (siklus berulang sampai sesuai)
    │
    └──[SESUAI]
            │
            ▼
    Menyetujui laporan pendapatan → Proses SELESAI
```

**Kelemahan Sistem Lama:**

- Penyewa wajib hadir fisik ke kantor — tidak ada pemesanan jarak jauh/online
- Tidak ada mekanisme penguncian jadwal → rentan tumpang tindih (overlapping)
- Pencatatan di kertas rentan kerusakan fisik dan manipulasi data
- Tidak ada visibilitas real-time ketersediaan fasilitas
- Rekapitulasi laporan membutuhkan waktu lama dan rawan human error
- Proses verifikasi laporan bisa berulang karena ketidakakuratan data

---

## ✅ Workflow yang Diusulkan (Sistem SIPENDORA)

Sistem yang diusulkan mendigitalisasi seluruh alur menggunakan aplikasi web dengan algoritma FCFS, RBAC, dan pelaporan otomatis.

```
[PENYEWA]
    │
    ▼
Mendaftar akun / Login ke aplikasi web SIPENDORA (dari mana saja, kapan saja)
    │
    ▼
Memilih fasilitas olahraga & jadwal sewa yang diinginkan
    │
    ▼
[SISTEM — Algoritma FCFS]
    │
    ▼
Cek ketersediaan slot berdasarkan timestamp pemesanan & status database lock
    │
    ├──[Fasilitas TIDAK TERSEDIA — slot sudah dikunci penyewa lain]
    │       │
    │       ▼
    │   Kirim notifikasi "Fasilitas tidak tersedia pada jadwal ini"
    │       │
    │       ▼
    │   Penyewa dapat memilih jadwal/fasilitas lain
    │
    └──[Fasilitas TERSEDIA]
            │
            ▼
    Tampilkan detail pemesanan + estimasi biaya otomatis + instruksi pembayaran
            │
            ▼
    [PENYEWA] Melakukan pembayaran (tunai/transfer) & mengunggah bukti pembayaran
            │
            ▼
    [SISTEM] Menerima & menyimpan bukti pembayaran, kirim notifikasi ke Admin
            │
            ▼
    [STAF ADMIN DISPORA]
            │
            ▼
    Memeriksa kelengkapan berkas pemesanan
            │
            ▼
    Verifikasi validitas bukti pembayaran
            │
            ├──[Pembayaran TIDAK VALID]
            │       │
            │       ▼
            │   Sistem kirim notifikasi penolakan ke penyewa
            │
            └──[Pembayaran VALID]
                    │
                    ▼
            [SISTEM] Setujui pemesanan
                    │
                    ▼
            Kunci slot jadwal otomatis via database lock FCFS
            (mencegah double booking / konflik jadwal)
                    │
                    ▼
            Kirim konfirmasi sewa + tiket digital ke penyewa
                    │
                    ▼
            [PENYEWA] Menerima notifikasi sewa berhasil + bukti/tiket pemesanan
                    │
                    ▼
            [SISTEM] Rekap laporan pendapatan otomatis
            (Total_Pendapatan = Σ(Tarif_Sesi))
                    │
                    ▼
            [STAF ADMIN] Kelola & validasi data rekapitulasi
                    │
                    ▼
            [SISTEM] Kirim laporan ke dashboard pimpinan
                    │
                    ▼
            [PIMPINAN] Menerima & mereview laporan pendapatan
                    │
                    ▼
            Proses SELESAI ✓
```

**Keunggulan Sistem Baru:**

- Pemesanan dapat dilakukan online kapan saja, dari mana saja
- Algoritma FCFS menjamin keadilan — siapa cepat, dia dapat
- Database lock otomatis mencegah double booking dan overlapping
- Laporan pendapatan dihasilkan secara otomatis dan real-time
- RBAC memastikan setiap pengguna hanya mengakses fitur sesuai perannya
- Kalkulasi pendapatan otomatis menghilangkan potensi human error

---

## ⚙️ Algoritma FCFS — Cara Kerja

Setiap permintaan reservasi diperlakukan sebagai proses dalam antrean dengan variabel matematis berikut:

| Variabel        | Singkatan | Deskripsi                                                    |
| --------------- | --------- | ------------------------------------------------------------ |
| Arrival Time    | AT        | Timestamp saat penyewa menekan tombol konfirmasi reservasi   |
| Burst Time      | BT        | Durasi sesi penuh yang ditentukan sistem (Sesi I=4 jam, dsb) |
| Start Time      | ST        | Waktu fasilitas mulai digunakan secara resmi                 |
| Completion Time | CT        | Waktu sesi penggunaan berakhir: `CT = ST + BT`               |
| Turnaround Time | TAT       | Total waktu dari masuk hingga selesai: `TAT = CT - AT`       |
| Waiting Time    | WT        | Waktu tunggu sebelum dilayani: `WT = TAT - BT`               |

**Rumus Kalkulasi Pendapatan:**

```
Total_Pendapatan = Σ(Tarif_Sesi)
```

**Simulasi Contoh (5 Penyewa):**

| No  | Nama Penyewa   | Fasilitas               | AT    | BT           | ST    | CT    | TAT     | WT      |
| --- | -------------- | ----------------------- | ----- | ------------ | ----- | ----- | ------- | ------- |
| 1   | Aditya Pratama | Lapangan Sepak Bola A   | 08.00 | Sesi I (4j)  | 08.00 | 12.00 | 240 mnt | 0       |
| 2   | Bella Kusuma   | Lapangan Bulu Tangkis 1 | 08.15 | Sesi I (6j)  | 08.15 | 14.15 | 360 mnt | 0       |
| 3   | Chandra Wijaya | Lapangan Tenis          | 08.30 | Sesi I (6j)  | 08.30 | 14.30 | 360 mnt | 0       |
| 4   | Dinda Rahayu   | Lapangan Sepak Bola A   | 09.00 | Sesi II (6j) | 12.00 | 18.00 | 540 mnt | 180 mnt |
| 5   | Eko Santoso    | Lapangan Bulu Tangkis 2 | 09.15 | Sesi II (6j) | 12.00 | 18.00 | 525 mnt | 165 mnt |

- **Average Turnaround Time (ATAT)** = (120+60+180+180+60) / 5 = **120 menit**
- **Average Waiting Time (AWT)** = (0+0+0+60+0) / 5 = **12 menit**

> **Catatan:** WT pada Penyewa 4 (60 menit) adalah konsekuensi wajar karena Lapangan Sepak Bola A sedang dipakai Penyewa 1 yang lebih dahulu memesan — bukan konflik/overlapping. Sistem otomatis mengunci slot hingga Penyewa 1 selesai.

---

## 🗄️ Skema Database

```
tb_user
├── id (PK)
├── nama
├── email
├── password (bcrypt hash)
├── no_telp
├── role (PENYEWA | ADMIN | PIMPINAN)
├── status_akun (Boolean)
└── createdAt / updatedAt

tb_fasilitas
├── id (PK)
├── nama_fasilitas
├── jenis_fasilitas
├── kapasitas
├── tarif_per_jam
├── status_fasilitas (Boolean)
└── createdAt / updatedAt

tb_booking  ← inti eksekusi logika FCFS
├── id (PK)
├── userId (FK → tb_user)
├── fasilitasId (FK → tb_fasilitas)
├── tanggal_booking
├── arrival_time (AT)
├── start_time (ST)
├── burst_time (BT) - Durasi penuh sesi (menit)
├── snapshot_nama_sesi - Nama sesi saat dibooking
├── snapshot_jam_mulai - Jam mulai sesi (historis)
├── snapshot_jam_selesai - Jam selesai sesi (historis)
├── completion_time (CT)
├── turnaround_time (TAT)
├── waiting_time (WT)
├── total_biaya
├── status_booking (PENDING | CONFIRMED | CANCELLED | COMPLETED)
└── createdAt / updatedAt

tb_pembayaran
├── id (PK)
├── bookingId (FK → tb_booking)
├── metode_pembayaran
├── bukti_pembayaran (path file)
├── status_verifikasi
└── createdAt / updatedAt

tb_laporan
├── id (PK)
├── periode
├── total_pendapatan
├── total_transaksi
└── tanggal_generate
```

---

## 📐 Metode Pengembangan Sistem

### Rational Unified Process (RUP)

Pengembangan SIPENDORA menggunakan metodologi **Rational Unified Process (RUP)** — kerangka kerja iteratif, adaptif, dan berorientasi arsitektur yang dipilih karena kemampuannya mengakomodasi perubahan kebutuhan secara fleksibel, sangat relevan untuk pengembangan aplikasi instansi pemerintah.

```
FASE 1: INCEPTION (Inisiasi)
─────────────────────────────
• Analisis permasalahan sistem yang berjalan di Dispora
• Identifikasi 3 permasalahan utama (overlapping, ketidakakuratan, no real-time)
• Penetapan ruang lingkup & tujuan sistem
• Identifikasi 3 aktor utama (penyewa, admin, pimpinan)
• Penilaian kelayakan pengembangan aplikasi web
• Output: Dokumen visi proyek & identifikasi use case utama

FASE 2: ELABORATION (Elaborasi)
─────────────────────────────────
• Analisis kebutuhan mendalam
• Pemodelan sistem dengan UML:
  - Use Case Diagram (interaksi aktor dengan sistem)
  - Activity Diagram (alur proses bisnis)
  - Class Diagram (struktur basis data)
• Perancangan skema database relasional
  (tb_user, tb_fasilitas, tb_booking, tb_pembayaran, tb_laporan)
• Penetapan tech stack (Vite, React, Node.js, Express, MySQL, dll.)
• Output: Arsitektur baseline terdokumentasi

FASE 3: CONSTRUCTION (Konstruksi)
────────────────────────────────────
• Implementasi penuh aplikasi web
• Coding mesin algoritma FCFS ke dalam business logic layer
• Implementasi database lock untuk slot jadwal yang sudah dipesan
• Implementasi modul RBAC (3 role pengguna)
• Implementasi modul pelaporan pendapatan otomatis
• Iterasi build → uji → evaluasi secara inkremental
• Output: Aplikasi web fungsional yang dapat diuji

FASE 4: TRANSITION (Transisi)
──────────────────────────────
• Deployment aplikasi ke server
• User Acceptance Testing (UAT) — validasi seluruh fitur
• Pengujian usabilitas menggunakan System Usability Scale (SUS)
• Pendampingan teknis operator Dispora
• Output: Sistem siap digunakan di lingkungan operasional nyata
```

---

## 📊 Metode Pengujian — System Usability Scale (SUS)

Pengujian usabilitas antarmuka SIPENDORA menggunakan instrumen **System Usability Scale (SUS)** yang dikembangkan oleh John Brooke (1996).

**Cara Perhitungan:**

- 10 pernyataan dengan skala Likert 1–5
- Pernyataan ganjil (1,3,5,7,9) bernada positif: `X = R - 1`
- Pernyataan genap (2,4,6,8,10) bernada negatif: `Y = 5 - R`
- `SUS Score = (ΣX + ΣY) × 2,5`

**Kategorisasi Hasil (Bangor et al., 2008):**
| Skor SUS | Kategori |
|---|---|
| > 80,3 | **Excellent** — dapat diterima tanpa friksi |
| 68 – 80,3 | **Good / Acceptable** — dapat diterima dengan baik |
| < 68 | Perlu perbaikan antarmuka |

---

## 📁 Struktur Folder Proyek (Rekomendasi)

```
sipendora/
├── client/                     # React + Vite (Frontend)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Gambar & Logo
│   │   ├── components/
│   │   │   ├── landing/        # Hero, Features, CTA, Navbar
│   │   │   ├── layout/         # Layout.jsx, Sidebar.jsx
│   │   │   ├── dashboard/      # (Empty or for specific dashboard widgets)
│   │   │   └── ui/             # Button, Card, Input (Reusable)
│   │   ├── pages/
│   │   │   ├── admin/          # Facilities.jsx, Users.jsx
│   │   │   ├── auth/           # Login, Register
│   │   │   └── dashboard/      # MainDashboard (Adaptive Role)
│   │   ├── store/              # Zustand (authStore.js)
│   │   ├── App.jsx             # Routing & Global Config
│   │   ├── main.jsx            # Entry Point
│   │   └── index.css           # Global Styles & Fonts
│   ├── tailwind.config.js      # Design System 2.0 Config
│   └── vite.config.js
│
├── server/                     # Node.js + Express (Backend)
│   ├── routes/
│   │   └── auth.js             # Logic Login & Register
│   ├── db.js                   # MySQL Connection (Pool)
│   ├── index.js                # Server Entry Point
│   ├── database.sql            # Schema Database
│   ├── .env                    # Environment Variables
│   └── package.json
│
└── README.md
```

---

## 🔌 API Documentation (Current Status)

| Method    | Endpoint                    | Access  | Description                  | Status     |
| --------- | --------------------------- | ------- | ---------------------------- | ---------- |
| **POST**  | `/api/auth/register`        | Public  | Registrasi Penyewa Baru      | ✅ Done    |
| **POST**  | `/api/auth/login`           | Public  | Login User & Get Token       | ✅ Done    |
| **GET**   | `/api/auth/me`              | User    | Get Current User Data        | ⏳ Planned |
| **GET**   | `/api/fasilitas`            | Public  | List Semua Fasilitas         | ⏳ Planned |
| **POST**  | `/api/booking`              | Penyewa | Buat Pesanan Baru (FCFS)     | ⏳ Planned |
| **POST**  | `/api/payment/charge`       | Penyewa | Get Payment Token (Midtrans) | ⏳ Planned |
| **POST**  | `/api/payment/notification` | Public  | Webhook Handler Status Bayar | ⏳ Planned |
| **PATCH** | `/api/booking/:id`          | Admin   | Verifikasi/Update Pesanan    | ⏳ Planned |

---

## 💳 Payment Gateway Integration (Midtrans Plan)

Untuk mengotomatisasi pencatatan pendapatan, sistem direncanakan terintegrasi dengan **Midtrans** menggunakan mekanisme **Snap Redirect**.

**Alur Pembayaran Otomatis:**

1. **Request:** Penyewa klik "Bayar Sekarang", Frontend kirim request ke `/api/payment/charge`.
2. **Token:** Backend meminta `Snap Token` ke Midtrans dan mengirimkannya ke Frontend.
3. **Payment:** Frontend membuka popup/halaman pembayaran Midtrans (E-Wallet, Virtual Account, Qris).
4. **Notification:** Setelah bayar, Midtrans mengirim **Webhook** ke `/api/payment/notification`.
5. **Update:** Backend menerima webhook, memverifikasi tanda tangan (Signature Key), dan otomatis mengubah status booking menjadi `CONFIRMED`.

---

## 🎨 Design System Tokens (UI Standard)

Aplikasi ini menggunakan **Design System 2.0** yang didefinisikan di Tailwind Config. Gunakan class berikut agar UI tetap konsisten:

| Token       | CSS Class           | Color Code | Usage                      |
| ----------- | ------------------- | ---------- | -------------------------- |
| **Primary** | `bg-primary-600`    | `#2563EB`  | Tombol utama, Brand color  |
| **Surface** | `bg-surface-base`   | `#FFFFFF`  | Background Card, Navbar    |
| **Subtle**  | `bg-surface-subtle` | `#F8FAFC`  | Background Halaman         |
| **Dark**    | `bg-text-primary`   | `#0F172A`  | Sidebar, Text utama        |
| **Success** | `text-success-600`  | `#16A34A`  | Status Berhasil/Tersedia   |
| **Danger**  | `text-danger-600`   | `#DC2626`  | Tombol Hapus, Status Batal |

---

## 🚀 Status Pengembangan (Roadmap)

- [x] **Phase 1:** Setup Project & Design System
- [x] **Phase 2:** Database Schema & Auth System (JWT)
- [x] **Phase 3:** Dashboard Layout (Responsive)
- [ ] **Phase 4:** Facility Management & Booking Logic (FCFS Engine)
- [ ] **Phase 5:** Payment System (Manual Upload / Midtrans Gateway)
- [ ] **Phase 6:** Reporting Module & Leadership Dashboard
- [ ] **Phase 7:** Final Testing (SUS) & Deployment
- [ ] **Phase 8:** Optional: Advanced Analytics & PDF Export

---

## 🔐 Keamanan Sistem

| Aspek Keamanan       | Implementasi                                                                            |
| -------------------- | --------------------------------------------------------------------------------------- |
| **Autentikasi**      | JWT (JSON Web Token) — stateless, expire-based                                          |
| **Otorisasi**        | Middleware role-check sebelum setiap route yang dilindungi                              |
| **Password**         | Hashing dengan bcrypt (salt rounds ≥ 10)                                                |
| **Environment**      | Kredensial sensitif disimpan di `.env`, tidak di-commit ke repo                         |
| **RBAC**             | Setiap endpoint backend diproteksi sesuai role (penyewa/admin/pimpinan)                 |
| **Database Lock**    | Slot jadwal yang sedang diproses dikunci (non-preemptive) untuk mencegah race condition |
| **Payment Security** | Verifikasi _Signature Key_ pada Webhook Payment Gateway untuk mencegah transaksi fiktif |

---

## 🎯 Hasil yang Diharapkan

Setelah SIPENDORA berhasil diimplementasikan, diharapkan:

1. **Zero overlapping** — konflik jadwal penggunaan fasilitas olahraga berhasil dieliminasi sepenuhnya melalui mekanisme FCFS + database lock.
2. **Laporan pendapatan akurat & real-time** — pimpinan dapat memantau tren pendapatan kapan saja tanpa menunggu rekapitulasi manual bulanan.
3. **Efisiensi layanan publik** — masyarakat dapat memesan fasilitas secara online tanpa harus datang ke kantor, meningkatkan aksesibilitas layanan.
4. **Akuntabilitas finansial daerah** — pencatatan pendapatan sewa terintegrasi mendukung proses audit keuangan dan pemantauan realisasi target anggaran PAD.
5. **Usabilitas tinggi** — skor SUS ≥ 68 (_Acceptable_) atau ideally ≥ 80,3 (_Excellent_) sebagai bukti bahwa sistem dapat digunakan dengan nyaman oleh semua kalangan pengguna.
6. **Transparansi & keadilan** — algoritma FCFS memastikan setiap penyewa dilayani berdasarkan urutan waktu pemesanan tanpa diskriminasi.

---

## 📚 Referensi Utama

- Hajjar, O., et al. (2024). _Performance Assessment of CPU Scheduling Algorithms: A Scenario-Based Approach with FCFS, RR, and SJF._ Journal of Computer Science, 20(9), 972–985. [Scopus]
- González-Rodríguez, M., et al. (2024). _Study and Evaluation of CPU Scheduling Algorithms._ Heliyon (Elsevier), 10(9), e29959. [Scopus Q1]
- Nor Sajidah, A. G., et al. (2023). _Web Design Structure with WordPress Content Management for Sports Centre Booking System._ IJEECS, 19(3). [Scopus]
- Fitrianingrum, S. N., et al. (2024). _System Usability Scale (SUS) As An Analysis Method For Official Website._ Telematika, 21(2), 173–180.

---

## 👩‍💻 Pengembang

| Info                      | Detail                                             |
| ------------------------- | -------------------------------------------------- |
| **Peneliti / Penulis TA** | Ayu Diya Silfiani                                  |
| **NIM**                   | 062240833065                                       |
| **Program Studi**         | D-IV Manajemen Informatika                         |
| **Institusi**             | Politeknik Negeri Sriwijaya, Palembang             |
| **Pembimbing I**          | Muhammad Aris Ganiardi, S.Si., M.T                 |
| **Pembimbing II**         | Mardiana, S.Kom., M.Kom                            |
| **Lokasi Penelitian**     | Dinas Pemuda dan Olahraga (Dispora) Kota Palembang |
| **Periode Penelitian**    | Februari – Mei 2026                                |

---

_SIPENDORA — Digitalisasi layanan publik yang adil, transparan, dan akuntabel._
