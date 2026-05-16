# Bab 4 — Frontend Dasar: Vite, React & Client-Side Routing

> **Tujuan bab ini:** Memahami bagaimana aplikasi React dibangun dengan Vite, bagaimana routing SPA bekerja, dan bagaimana struktur halaman diorganisir.

---

## 4.1 Mengapa Vite, Bukan Create React App?

| | Create React App | **Vite** ✅ |
|---|---|---|
| **Startup** | ~30 detik | < 1 detik |
| **HMR (Hot Reload)** | Lambat | Instan |
| **Build** | Webpack (lama) | Rollup (cepat) |
| **Konfigurasi** | Tersembunyi | Transparan |

Vite memanfaatkan native ES Modules browser sehingga tidak perlu bundle semua file di awal — ia hanya transformasi file yang diminta saja.

---

## 4.2 Struktur Folder Frontend

```
client/
├── index.html             ← Entry HTML (satu file untuk seluruh SPA)
├── vite.config.js         ← Konfigurasi Vite & proxy
├── tailwind.config.js     ← Design system tokens
└── src/
    ├── main.jsx           ← Mount React ke DOM
    ├── App.jsx            ← Router utama (semua route didefinisikan di sini)
    ├── index.css          ← Global CSS (Tailwind directives)
    │
    ├── store/
    │   └── authStore.js   ← Zustand: global state (user, token)
    │
    ├── utils/
    │   └── api.js         ← Axios instance dengan JWT interceptor
    │
    ├── components/
    │   ├── layout/
    │   │   ├── MainLayout.jsx     ← Wrapper authenticated pages
    │   │   ├── Sidebar.jsx        ← Navigasi sidebar per role
    │   │   └── NotificationBell.jsx
    │   └── ui/
    │       └── DataTable.jsx      ← Komponen tabel reusable
    │
    └── pages/
        ├── LandingPage.jsx        ← Halaman publik (/)
        ├── auth/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── AccountPending.jsx
        ├── dashboard/
        │   └── MainDashboard.jsx  ← Shell dashboard (render AdminDashboard atau PimpinanDashboard)
        ├── penyewa/               ← Halaman khusus penyewa
        │   ├── Dashboard.jsx
        │   ├── BrowseFacilities.jsx
        │   ├── FacilityBooking.jsx
        │   ├── MyBookings.jsx
        │   └── BookingDetail.jsx
        ├── admin/                 ← Halaman khusus admin
        │   ├── AdminDashboard.jsx
        │   ├── Facilities.jsx
        │   ├── ManageBookings.jsx
        │   ├── FCFSAnalysis.jsx
        │   ├── ManageRekening.jsx
        │   └── Users.jsx
        └── pimpinan/              ← Halaman khusus pimpinan
            └── LaporanPimpinan.jsx
```

---

## 4.3 Entry Point HTML: `client/index.html`

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SIPENDORA</title>
  </head>
  <body>
    <!-- Div kosong ini adalah "kanvas" tempat React me-render seluruh UI -->
    <div id="root"></div>

    <!-- Script utama React — Vite otomatis handle bundling ini -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Ada hanya **satu file HTML** untuk seluruh aplikasi — itulah inti SPA (Single Page Application). React yang mengganti konten `<div id="root">` tanpa reload halaman.

---

## 4.4 Mount Point: `client/src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';   // ← Tailwind CSS di-inject di sini

// Ambil elemen <div id="root"> dari HTML
// Lalu "mount" seluruh aplikasi React ke dalamnya
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`React.StrictMode` hanya aktif saat development — membantu mendeteksi masalah dengan menjalankan beberapa lifecycle dua kali.

---

## 4.5 Router Utama: `client/src/App.jsx`

Ini adalah **peta navigasi** seluruh aplikasi. React Router DOM menangani perubahan URL tanpa reload.

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import semua halaman
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AccountPending from './pages/auth/AccountPending';

import PenyewaDashboard from './pages/penyewa/Dashboard';
import BrowseFacilities from './pages/penyewa/BrowseFacilities';
import FacilityBooking from './pages/penyewa/FacilityBooking';
import MyBookings from './pages/penyewa/MyBookings';
import BookingDetail from './pages/penyewa/BookingDetail';

import MainDashboard from './pages/dashboard/MainDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
// ... dll

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Toast notification global */}
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '14px' } }} />

      <Routes>
        {/* ── Halaman Publik (tidak perlu login) ── */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending"  element={<AccountPending />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />

        {/* ── Halaman Dashboard (shell adaptif berdasarkan role) ── */}
        <Route path="/admin/dashboard"  element={<MainDashboard />} />
        <Route path="/report/dashboard" element={<MainDashboard />} />

        {/* ── Halaman Penyewa ── */}
        <Route path="/dashboard"              element={<PenyewaDashboard />} />
        <Route path="/facilities"             element={<BrowseFacilities />} />
        <Route path="/dashboard/facility/:id" element={<FacilityBooking />} />
        <Route path="/bookings"               element={<MyBookings />} />
        <Route path="/bookings/:id"           element={<BookingDetail />} />

        {/* ── Halaman Admin ── */}
        <Route path="/admin/facilities" element={<Facilities />} />
        <Route path="/admin/users"      element={<Users />} />
        <Route path="/admin/bookings"   element={<ManageBookings />} />
        <Route path="/admin/fcfs"       element={<FCFSAnalysis />} />
        <Route path="/admin/rekening"   element={<ManageRekening />} />

        {/* ── Halaman Pimpinan ── */}
        <Route path="/pimpinan/laporan" element={<LaporanPimpinan />} />

        {/* ── Halaman Bersama ── */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile"       element={<Profile />} />
      </Routes>
    </Router>
  );
}
```

### Bagaimana Routing SPA Bekerja?

```
User klik link "/bookings"
       │
       ▼
React Router intersep ← Tidak ada request ke server!
       │
       ▼
Render komponen <MyBookings> menggantikan konten sebelumnya
       │
       ▼
URL bar berubah menjadi /bookings (tanpa reload)
```

Ini berbeda dengan website tradisional di mana setiap URL = request baru ke server = reload halaman penuh.

### Route dengan Parameter Dinamis

```jsx
<Route path="/bookings/:id" element={<BookingDetail />} />
```

Di dalam `BookingDetail.jsx`, ambil nilai `:id` dengan hook:

```jsx
import { useParams } from 'react-router-dom';

const BookingDetail = () => {
    const { id } = useParams();
    // Jika URL = /bookings/42, maka id = "42"
    // ...
};
```

---

## 4.6 Navigasi Programatik

Untuk redirect setelah login atau logout, gunakan `useNavigate`:

```jsx
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = async () => {
        // ... proses login ...
        navigate('/dashboard'); // ← Redirect ke dashboard setelah login berhasil
    };
};
```

Untuk link biasa (seperti tag `<a>` tapi tanpa reload):

```jsx
import { Link } from 'react-router-dom';

// Gunakan <Link> bukan <a href="..."> agar tidak reload
<Link to="/facilities">Lihat Semua Fasilitas</Link>
```

---

## 4.7 Tailwind CSS & Design System

SIPENDORA menggunakan `tailwind.config.js` yang mendefinisikan custom design tokens:

```js
// tailwind.config.js (ringkasan)
theme: {
  extend: {
    colors: {
      primary: { 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
      success: { 500: '#22C55E', 600: '#16A34A' },
      danger:  { 500: '#EF4444', 600: '#DC2626' },
      'surface-base':   '#FFFFFF',
      'surface-subtle': '#F8FAFC',
      'text-primary':   '#0F172A',
    }
  }
}
```

**Cara pakai di JSX:**

```jsx
// Bukan warna standar Tailwind, tapi token kustom kita
<div className="bg-surface-subtle text-text-primary">
  <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl">
    Pesan Sekarang
  </button>
</div>
```

---

## 4.8 Pola Komponen React

Setiap halaman di SIPENDORA mengikuti pola yang konsisten:

```jsx
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../utils/api';

const ContohHalaman = () => {
    // 1. State lokal untuk data dan UI
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Fetch data saat komponen pertama kali muncul
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/endpoint/data');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false); // ← Selalu set false, baik sukses maupun gagal
            }
        };
        fetchData();
    }, []); // ← [] = hanya jalan sekali saat mount

    // 3. Render JSX
    return (
        <MainLayout title="Judul Halaman">
            {loading ? (
                <p>Memuat...</p>
            ) : (
                <ul>
                    {data.map(item => <li key={item.id}>{item.nama}</li>)}
                </ul>
            )}
        </MainLayout>
    );
};

export default ContohHalaman;
```

---

## 4.9 Ringkasan Bab 4

| Konsep | Penjelasan |
|--------|-----------|
| SPA | Satu HTML, React yang ganti konten sesuai URL |
| `<Router>` | Provider routing dari React Router DOM |
| `<Routes>` + `<Route>` | Mendefinisikan URL → Komponen |
| `useParams()` | Ambil nilai parameter dinamis dari URL |
| `useNavigate()` | Redirect programatik |
| `<Link>` | Navigasi tanpa reload halaman |
| Tailwind Config | Design token kustom (warna, spacing) |
| `useEffect(fn, [])` | Jalankan side effect setelah render pertama |

---

➡️ **Lanjut ke [Bab 5 — State Management & Komunikasi API](./05_STATE_DAN_API.md)**
