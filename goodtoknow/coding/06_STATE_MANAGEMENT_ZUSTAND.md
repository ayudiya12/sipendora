# 06 — State Management Zustand
> Mengelola status aplikasi secara global tanpa prop-drilling yang rumit.

Sipendora menggunakan **Zustand** karena jauh lebih ringan dan sederhana dibandingkan Redux.

---

## 🔐 Store Autentikasi (`authStore.js`)
Digunakan untuk menyimpan data user yang sedang login dan status token di seluruh aplikasi.

```javascript
import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    
    login: (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        set({ user: userData, token: token });
    },
    
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
    }
}));

export default useAuthStore;
```

---

## 📅 Store Booking
Digunakan untuk memantau status pesanan user secara real-time.

```javascript
const useBookingStore = create((set) => ({
    myBookings: [],
    setBookings: (data) => set({ myBookings: data }),
    addBooking: (booking) => set((state) => ({ 
        myBookings: [...state.myBookings, booking] 
    }))
}));
```

---

## 🛡️ Melindungi Rute (Private Routes)
Gunakan status dari `useAuthStore` untuk membatasi akses halaman Dashboard.

```jsx
const PrivateRoute = ({ children }) => {
    const token = useAuthStore((state) => state.token);
    return token ? children : <Navigate to="/login" />;
};
```

---

## 💡 Tips Coding
- Gunakan fitur `persist` bawaan Zustand jika ingin data store tetap ada setelah browser di-refresh (sinkronisasi otomatis dengan LocalStorage).
- Pisahkan setiap Store ke file yang berbeda di folder `src/store/`.

---

**Selamat!**
Anda telah mempelajari seluruh alur pengembangan Sipendora, mulai dari Database, Algoritma FCFS, hingga State Management di Frontend.
[Kembali ke Index Tutorial](./CODING_INDEX.md)
