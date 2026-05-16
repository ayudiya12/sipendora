# 05 — Frontend Vite React
> Membangun antarmuka modern yang cepat dan responsif.

Sisi client Sipendora dibangun menggunakan **React** dengan build tool **Vite**.

---

## 🏗️ Struktur Proyek Client
```text
client/
├── src/
│   ├── components/    # Navbar, Sidebar, Reusable UI
│   ├── pages/         # Login, Home, UserDashboard
│   ├── store/         # Zustand State Management
│   └── api/           # Axios instance & request helpers
└── index.html
```

---

## 📡 Integrasi API dengan Axios
Buat satu file `src/api/axios.js` agar konfigurasi URL API terpusat.

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Masukkan token JWT otomatis ke header setiap request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = token;
    return config;
});

export default api;
```

---

## ⚛️ Membuat Komponen Booking Form
Komponen ini bertugas mengirimkan data sewa ke backend.

```jsx
import api from '../api/axios';

const BookingForm = () => {
    const handleBooking = async (data) => {
        try {
            await api.post('/bookings/create', data);
            alert('Booking Berhasil! Silahkan Bayar.');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={...}>
            {/* Input fields */}
            <button type="submit" className="bg-primary text-white">Pesan Sekarang</button>
        </form>
    );
};
```

---

## 🎨 Styling dengan Tailwind CSS
Gunakan class utility untuk desain cepat:
- `flex items-center gap-4`: Layouting.
- `text-2xl font-bold`: Tipografi.
- `hover:scale-105 transition`: Micro-interaction.

---

**Langkah Selanjutnya:**
[06 — State Management Zustand](./06_STATE_MANAGEMENT_ZUSTAND.md)
