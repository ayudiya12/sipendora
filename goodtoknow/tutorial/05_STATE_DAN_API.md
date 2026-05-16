# Bab 5 — State Management & Komunikasi API

> **Tujuan bab ini:** Memahami bagaimana data login (user, token) disimpan secara global di seluruh aplikasi, dan bagaimana frontend berkomunikasi dengan backend secara efisien dan aman.

---

## 5.1 Masalah: Kenapa Butuh Global State?

Bayangkan flow berikut: user login di `Login.jsx`, lalu pindah ke `MyBookings.jsx`. Di halaman booking, kita butuh tahu:
- Siapa user yang login? (untuk tampilkan nama)
- Apa token JWT-nya? (untuk kirim ke API)
- Apa role-nya? (untuk atur menu di Sidebar)

Jika pakai `useState` biasa, data ini hanya ada di komponen tempat kita buat. Solusinya: **Global State** — satu tempat penyimpanan yang bisa diakses oleh komponen mana saja.

```
useState (lokal)          Global State (Zustand)
──────────────────        ──────────────────────
Login.jsx [user ✅]       Store [user, token, role]
     │                        │
     │ tidak bisa akses       ├── Login.jsx ← ambil user
     │                        ├── Sidebar.jsx ← ambil role
MyBookings.jsx [user ❌]     └── MyBookings.jsx ← ambil token
```

---

## 5.2 Zustand: `client/src/store/authStore.js`

Zustand adalah library global state yang sangat ringan dan mudah dipakai. Tidak perlu Provider seperti Redux.

```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // ── Initial State ──
      user: null,
      token: null,
      isLoggedIn: false,

      // ── Actions ──

      // Dipanggil setelah login berhasil
      login: (userData, token) => {
        set({ user: userData, token: token, isLoggedIn: true });
      },

      // Dipanggil saat user klik "Keluar"
      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
        localStorage.removeItem('auth-storage'); // Hapus dari localStorage juga
        sessionStorage.removeItem('notif_shown');
      },

      // Verifikasi ulang token ke server (dijalankan saat app pertama dibuka)
      checkAuth: async () => {
        const state = useAuthStore.getState();
        if (!state.token) return; // Tidak ada token = tidak perlu cek

        try {
          const axios = (await import('axios')).default;
          const res = await axios.get(`.../api/auth/me`, {
            headers: { Authorization: `Bearer ${state.token}` }
          });
          set({ user: res.data }); // Update data user terbaru dari server
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            state.logout(); // Token kadaluwarsa → logout otomatis
          }
        }
      },

      // Tentukan halaman tujuan setelah login berdasarkan role
      getRedirectPath: (userData) => {
        if (!userData) return '/';
        if (userData.status_akun === 0) return '/pending'; // Akun belum diaktifkan admin

        switch (userData.role?.toLowerCase()) {
          case 'admin':    return '/admin/dashboard';
          case 'pimpinan': return '/report/dashboard';
          case 'penyewa':  return '/dashboard';
          default:         return '/';
        }
      }
    }),
    {
      name: 'auth-storage', // Key di localStorage
      // Data akan otomatis disimpan ke localStorage dan dipulihkan saat browser dibuka ulang
    }
  )
);
```

### Middleware `persist`

Tanpa `persist`, semua state hilang saat halaman di-refresh. Dengan `persist`, Zustand otomatis:
- **Simpan** state ke `localStorage` setiap kali state berubah
- **Pulihkan** state dari `localStorage` saat aplikasi pertama dibuka

```
User refresh halaman
       │
       ▼
Zustand baca 'auth-storage' dari localStorage
       │
       ▼
Set state: { user: {...}, token: "eyJ...", isLoggedIn: true }
       │
       ▼
Sidebar sudah tahu siapa usernya, tanpa login ulang ✅
```

---

## 5.3 Cara Menggunakan authStore

Di komponen mana saja, cukup import dan gunakan seperti hook biasa:

```jsx
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
    // Destructure hanya yang dibutuhkan
    const { user, isLoggedIn, logout } = useAuthStore();

    console.log(user.nama);  // "Budi Santoso"
    console.log(user.role);  // "penyewa"

    return (
        <button onClick={logout}>Keluar</button>
    );
};
```

```jsx
// Di halaman Login.jsx, setelah API berhasil
const { login, getRedirectPath } = useAuthStore();

const handleLogin = async (e) => {
    const res = await axios.post('/api/auth/login', { email, password });
    login(res.data.user, res.data.token); // ← Simpan ke global state
    const path = getRedirectPath(res.data.user);
    navigate(path); // ← Redirect ke halaman yang sesuai role
};
```

Mengakses state di luar komponen React (misalnya di `api.js`):

```js
// useAuthStore.getState() — akses tanpa hook, untuk non-React context
const token = useAuthStore.getState().token;
```

---

## 5.4 Axios Instance: `client/src/utils/api.js`

Daripada menulis `axios.get('http://localhost:5000/api/...')` di setiap komponen, kita buat **satu instance terpusat** dengan konfigurasi default.

```js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  // Baca dari environment variable, fallback ke localhost
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api',
});

// ── Request Interceptor ──
// Fungsi ini dipanggil SEBELUM setiap request dikirim
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token; // Ambil token dari store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ← Sisipkan ke header
    }
    return config; // Kirim request dengan header yang sudah dimodifikasi
  },
  (error) => Promise.reject(error)
);

export default api;
```

### Keunggulan Pendekatan Ini

| Tanpa Axios Instance | Dengan Axios Instance ✅ |
|---|---|
| `axios.get('http://localhost:5000/api/bookings/my', { headers: { Authorization: 'Bearer ...' } })` | `api.get('/bookings/my')` |
| Token harus disertakan manual di setiap request | Token otomatis disisipkan via interceptor |
| URL base harus ditulis berulang | Base URL cukup satu kali di instance |

### Cara Pemakaian di Halaman

```jsx
import api from '../../utils/api';

// GET request
const res = await api.get('/bookings/my');
const bookings = res.data;

// POST request dengan body JSON
const res = await api.post('/bookings', {
    fasilitasId: 1,
    tarifId: 3,
    tanggal_booking: '2026-05-20'
});

// PATCH request
await api.patch(`/bookings/cancel/${bookingId}`);

// POST dengan file upload (FormData)
const formData = new FormData();
formData.append('image', file);
formData.append('bookingId', '42');
await api.post('/payments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 5.5 Environment Variables di Frontend

Vite menggunakan file `.env` di folder `client/`:

```
# client/.env (untuk lokal)
VITE_API_URL=http://localhost:5000
```

```
# client/.env.production (untuk deployment)
VITE_API_URL=https://api.sipendora.railway.app
```

> ⚠️ **Penting:** Variabel Vite **harus** diawali `VITE_` agar bisa diakses di kode frontend. Variabel tanpa prefix `VITE_` tidak akan tersedia di browser (demi keamanan).

Akses di kode:

```js
import.meta.env.VITE_API_URL  // "http://localhost:5000"
```

---

## 5.6 Pola Penanganan Error

```jsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [data, setData] = useState([]);

useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await api.get('/bookings/my');
            setData(res.data);
        } catch (err) {
            // Ambil pesan error dari response backend, atau pesan default
            const msg = err.response?.data?.error || 'Gagal memuat data.';
            setError(msg);
            toast.error(msg); // Tampilkan toast notification
        } finally {
            setLoading(false); // Selalu dijalankan
        }
    };
    fetchData();
}, []);

// Di JSX
if (loading) return <LoadingSpinner />;
if (error)   return <ErrorMessage message={error} />;
return <DataList items={data} />;
```

---

## 5.7 Ringkasan Bab 5

| Konsep | File | Fungsi |
|--------|------|--------|
| `useAuthStore` | `authStore.js` | Simpan user, token, isLoggedIn secara global |
| `persist` middleware | `authStore.js` | Persist state ke localStorage agar tidak hilang saat refresh |
| `login()` action | `authStore.js` | Simpan data login ke store setelah API berhasil |
| `logout()` action | `authStore.js` | Bersihkan state + localStorage |
| `getRedirectPath()` | `authStore.js` | Tentukan URL redirect berdasarkan role user |
| `api` instance | `api.js` | Axios dengan baseURL + JWT interceptor otomatis |
| `import.meta.env.VITE_*` | `.env` | Environment variable di Vite |

---

➡️ **Lanjut ke [Bab 6 — Layout, Sidebar & Halaman Per Role](./06_LAYOUT_DAN_HALAMAN.md)**
