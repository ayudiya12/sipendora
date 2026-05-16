# 📚 SIPENDORA — Tutorial Book
> Panduan lengkap memahami cara membangun aplikasi web fullstack modern dari nol.

Dokumen ini adalah **indeks utama** dari tutorial book SIPENDORA. Setiap bab dipisah ke file tersendiri agar mudah dipelajari secara bertahap.

---

## 🗺️ Peta Belajar (Learning Path)

```
BACKEND (Server)                    FRONTEND (Client)
────────────────                    ─────────────────
01_BACKEND_DASAR.md                 04_FRONTEND_DASAR.md
  └─ db.js (Koneksi MySQL)            └─ Vite + React Setup
  └─ index.js (Entry Point)           └─ App.jsx (Routing)
  └─ Express Server Setup

02_MIDDLEWARE_AUTH.md               05_STATE_DAN_API.md
  └─ JWT (Autentikasi)                └─ Zustand (Global State)
  └─ verifyToken (Guard)              └─ api.js (Axios Instance)
  └─ isAdmin (Role Guard)             └─ Interceptor JWT

03_ROUTES_API.md                    06_LAYOUT_DAN_HALAMAN.md
  └─ auth.js                          └─ MainLayout.jsx
  └─ bookings.js (FCFS Engine)        └─ Sidebar.jsx (Role Menu)
  └─ payments.js                      └─ Halaman per Role
  └─ fcfsHelper.js (Algoritma)        └─ AdminDashboard.jsx
```

---

## 📖 Daftar Bab

| # | File | Topik | Estimasi Waktu |
|---|------|-------|----------------|
| 1 | [01_BACKEND_DASAR.md](./01_BACKEND_DASAR.md) | Express, MySQL, Entry Point | 30 menit |
| 2 | [02_MIDDLEWARE_AUTH.md](./02_MIDDLEWARE_AUTH.md) | JWT, Middleware, Guard | 20 menit |
| 3 | [03_ROUTES_API.md](./03_ROUTES_API.md) | REST API, FCFS Engine, Upload | 45 menit |
| 4 | [04_FRONTEND_DASAR.md](./04_FRONTEND_DASAR.md) | Vite, React, Routing SPA | 25 menit |
| 5 | [05_STATE_DAN_API.md](./05_STATE_DAN_API.md) | Zustand, Axios, Auth Flow | 20 menit |
| 6 | [06_LAYOUT_DAN_HALAMAN.md](./06_LAYOUT_DAN_HALAMAN.md) | Layout, Sidebar, Halaman Role | 35 menit |
| 7 | [KAMUS_ISTILAH.md](./KAMUS_ISTILAH.md) | Penjelasan istilah Frontend, Backend, dll | 10 menit |

**Total estimasi: ±3 jam belajar aktif.**

---

## 🧠 Prasyarat

Sebelum memulai, pastikan kamu sudah punya pengetahuan dasar:
- JavaScript (ES6+): arrow function, async/await, destructuring
- Konsep HTTP: method GET/POST/PUT/PATCH, status code, header
- Konsep Database: tabel, relasi, query SELECT/INSERT/UPDATE

---

## 💡 Cara Membaca Tutorial Ini

> Baca dari atas ke bawah. Setiap bab **membangun di atas bab sebelumnya**.
> Jangan skip — terutama Bab 2 (Middleware) karena dipakai di semua route.

_SIPENDORA Tutorial Book — dibuat berdasarkan kode asli proyek ini._

---
**Ingin praktik langsung?**
Pelajari urutan pengkodeannya di [Coding Tutorial](../coding/CODING_INDEX.md).
