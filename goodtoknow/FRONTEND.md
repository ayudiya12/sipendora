# 🎨 Panduan Frontend SIPENDORA

Frontend SIPENDORA dibangun menggunakan **ReactJS (Vite)** dengan desain modern, minimalis, dan interaktif.

---

## 🛠️ Stack Teknologi

### Core & Navigation
- **React (Vite):** Library UI utama yang cepat dan efisien.
- **React Router DOM:** Navigasi antar halaman (Login, Dashboard, Booking) tanpa reload.

### Styling & UI
- **Tailwind CSS:** Framework CSS berbasis *utility* untuk desain yang presisi.
- **Lucide React:** Set ikon minimalist yang bersih dan modern.
- **Framer Motion:** Library animasi untuk transisi halaman dan interaksi yang halus.
- **React Hot Toast:** Notifikasi popup yang cantik untuk feedback user.

### State & Data Management
- **Zustand:** State management global yang sangat ringan (untuk data User/Login).
- **TanStack Query (React Query):** Pengelola data dari API (Caching, Loading state, Auto-refetch).
- **TanStack Table:** Logika tabel tingkat lanjut (Search, Filter, Sort, Pagination).
- **Axios:** Client HTTP untuk berkomunikasi dengan Backend Express.

---

## 📡 Komunikasi API (Vite Proxy)
Kita menggunakan **Vite Proxy** agar kodingan tetap bersih. 
Cukup panggil:
```javascript
import axios from 'axios';
const response = await axios.get('/api/fasilitas');
```
Vite akan otomatis meneruskannya ke server Backend di port `5000`.

---

## 🏗️ Struktur Folder (Standard Industry)
- **`📁 src/components`**: Komponen reusable (Button, Input, Card, Table).
- **`📁 src/pages`**: Halaman utama aplikasi (Login.jsx, Dashboard.jsx).
- **`📁 src/store`**: Tempat state global **Zustand**.
- **`📁 src/hooks`**: Custom hooks untuk logika bisnis atau **React Query**.
- **`📁 src/utils`**: Fungsi pembantu (format mata uang, format tanggal).

---

## ✨ Prinsip Desain
1. **Whitespace:** Berikan ruang antar elemen agar user tidak merasa sesak.
2. **Visual Feedback:** Tombol harus berubah saat di-hover atau diklik (interaktif).
3. **Mobile First:** Prioritaskan tampilan HP karena Admin Dispora bekerja di lapangan.
4. **Consistency:** Gunakan warna Biru Profesional dan Hijau secara konsisten di seluruh aplikasi.
