# Bab 1 — Backend Dasar: Express.js, MySQL & Entry Point

> **Tujuan bab ini:** Memahami bagaimana server SIPENDORA dinyalakan, terhubung ke database, dan menerima request dari frontend.

---

## 1.1 Gambaran Besar Arsitektur Backend

```
Client (Browser)
      │
      │  HTTP Request (GET /api/bookings/my)
      ▼
┌─────────────────────────────────────────┐
│           server/index.js               │  ← Entry Point
│  ┌───────────────────────────────────┐  │
│  │  Express App                      │  │
│  │  ├─ Middleware (CORS, JSON)       │  │
│  │  ├─ /api/auth    → auth.js        │  │
│  │  ├─ /api/bookings → bookings.js   │  │
│  │  ├─ /api/payments → payments.js   │  │
│  │  └─ /api/fasilitas → facilities.js│  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
      │
      │  SQL Query (SELECT * FROM tb_booking ...)
      ▼
┌─────────────────┐
│ MySQL Database  │  ← db.js (Connection Pool)
│  (sipendora)    │
└─────────────────┘
```

**Kesimpulan alur:** Browser → Express Router → Route Handler → Database → Response kembali ke browser.

---

## 1.2 Koneksi Database: `server/db.js`

Ini adalah **pondasi** dari semua operasi data. Kita menggunakan `mysql2/promise` yang mendukung `async/await`.

```js
// server/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Deteksi environment: Railway (cloud) atau Lokal
const isRailway = process.env.RAILWAY_ENVIRONMENT_ID || process.env.MYSQLHOST;

const pool = mysql.createPool({
  host:     isRailway ? process.env.MYSQLHOST     : (process.env.DB_HOST || 'localhost'),
  user:     isRailway ? process.env.MYSQLUSER     : (process.env.DB_USER || 'root'),
  password: isRailway ? process.env.MYSQLPASSWORD : (process.env.DB_PASSWORD || 'roots'),
  database: isRailway ? process.env.MYSQLDATABASE : (process.env.DB_NAME || 'sipendora'),
  port:     isRailway ? process.env.MYSQLPORT     : (process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,   // Maksimal 10 koneksi sekaligus
  queueLimit: 0,
  ssl: isRailway ? { rejectUnauthorized: false } : false
});

module.exports = pool;
```

### 🔍 Kenapa `createPool`, bukan `createConnection`?

| | `createConnection` | `createPool` ✅ |
|---|---|---|
| **Koneksi** | Satu koneksi tunggal | Banyak koneksi dikelola otomatis |
| **Konkurensi** | Bottleneck jika banyak request | Aman untuk banyak request bersamaan |
| **Error** | Koneksi putus = aplikasi mati | Pool otomatis buat koneksi baru |

> **Penggunaan:** Di route manapun, cukup `const [rows] = await db.query('SELECT ...')` dan pool yang urus sisanya.

### 🔍 Kenapa pakai Environment Variable?

Nilai seperti `DB_PASSWORD` **tidak boleh di-hardcode** di kode. Bayangkan jika kode diupload ke GitHub — siapapun bisa akses database kamu. Solusinya: simpan di file `.env` (yang di-`.gitignore`).

```
# server/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=roots
DB_NAME=sipendora
JWT_SECRET=kunci_rahasia_jwt_kamu
```

---

## 1.3 Entry Point Server: `server/index.js`

Ini adalah file **pertama yang dijalankan** saat server dinyalakan (`npm run dev`).

```js
// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();    // ← Baca file .env
const db = require('./db');    // ← Import pool database

const app = express();
const PORT = process.env.PORT || 5000;
```

### Langkah 1: Import semua Route

```js
const authRoutes       = require('./routes/auth');
const fasilitasRoutes  = require('./routes/facilities');
const usersRoutes      = require('./routes/users');
const bookingRoutes    = require('./routes/bookings');
const paymentRoutes    = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes   = require('./routes/settings');
const pimpinanRoutes   = require('./routes/pimpinan');
```

Setiap file di folder `routes/` adalah **modul terpisah** yang mengatur endpoint untuk domain tertentu. Ini prinsip **Separation of Concerns** — satu file, satu tanggung jawab.

### Langkah 2: Konfigurasi CORS

CORS (Cross-Origin Resource Sharing) adalah mekanisme keamanan browser. Secara default, browser **melarang** request dari `localhost:5173` (frontend) ke `localhost:5000` (backend) karena beda port = beda origin.

```js
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://sipendora.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean); // Hapus nilai undefined/null

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (Postman, curl, mobile app)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost')) {
      callback(null, true);   // ✅ Diizinkan
    } else {
      callback(new Error('Not allowed by CORS')); // ❌ Diblokir
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Langkah 3: Middleware Global

```js
app.use(express.json());      // Agar bisa baca req.body dari JSON
app.set('trust proxy', 1);   // Agar IP asli client terbaca di balik Nginx/proxy

// Serve file statis (foto bukti pembayaran)
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));
```

`express.json()` wajib dipasang. Tanpa ini, `req.body` akan selalu `undefined` ketika frontend kirim data JSON.

### Langkah 4: Daftarkan Route

```js
app.use('/api/auth',          authRoutes);
app.use('/api/fasilitas',     fasilitasRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings',      settingsRoutes);
app.use('/api/pimpinan',      pimpinanRoutes);
```

Pola ini berarti: semua request yang URL-nya dimulai dengan `/api/bookings` akan **diteruskan** ke `bookingRoutes` untuk diproses lebih lanjut.

> **Contoh:** `GET /api/bookings/my` → masuk ke `bookingRoutes` → dicari handler untuk path `/my`.

### Langkah 5: Start Server & Test Koneksi DB

```js
app.listen(PORT, async () => {
  console.log(`🏛️  SIPENDORA SERVER STARTED — Port: ${PORT}`);

  // Test koneksi database saat server pertama nyala
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS connection_test');
    if (rows) console.log('✅ DATABASE CONNECTION: SUCCESS');
  } catch (error) {
    console.error('❌ DATABASE CONNECTION: FAILED', error.message);
  }
});
```

Melakukan test query `SELECT 1 + 1` adalah cara **paling ringan** untuk memverifikasi koneksi tanpa menyentuh data apapun.

---

## 1.4 Cara Menjalankan Server

```bash
# Di folder root sipendora/
npm run dev
# Ini menjalankan KEDUA server (backend + frontend) secara bersamaan
# via package "concurrently" yang dikonfigurasi di package.json root
```

```bash
# Atau manual, dari folder server/
cd server
node --watch index.js
# --watch = restart otomatis setiap kode berubah (Node.js 18+)
```

---

## 1.5 Ringkasan Bab 1

| Konsep | File | Peran |
|--------|------|-------|
| Koneksi DB | `db.js` | Buat connection pool ke MySQL |
| Entry Point | `index.js` | Nyalakan server, pasang middleware, daftarkan route |
| Environment | `.env` | Simpan kredensial secara aman |
| CORS | `index.js` | Izinkan frontend mengakses API |

---

➡️ **Lanjut ke [Bab 2 — Middleware & Autentikasi JWT](./02_MIDDLEWARE_AUTH.md)**
