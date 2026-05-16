# 04 — Backend API Routes
> Membangun endpoint untuk komunikasi data antara Client dan Database.

Sipendora menggunakan **Express.js** untuk mengelola routing. Setiap modul besar dipisahkan ke dalam file route yang berbeda.

---

## 🛣️ Struktur Routing (`server/routes/`)
- `auth.js`: Penanganan Login & Register.
- `bookings.js`: Pengelolaan antrean FCFS dan sewa.
- `payments.js`: Verifikasi bukti bayar.
- `fasilitas.js`: Master data lapangan olahraga.

---

## 🎮 Implementasi Booking Route
Saat user memesan, kita harus menggabungkan data input dengan Engine FCFS.

```javascript
router.post('/create', verifyToken, async (req, res) => {
    const { fasilitasId, date, duration } = req.body;
    
    // 1. Ambil jadwal terakhir yang tersedia (FCFS Pre-check)
    const [lastBooking] = await db.query(
        'SELECT end_time FROM bookings WHERE fasilitas_id = ? AND status = "Lunas" ORDER BY end_time DESC LIMIT 1', 
        [fasilitasId]
    );

    const nextAvailableST = lastBooking[0] ? lastBooking[0].end_time : new Date(date);

    // 2. Hitung Metrics FCFS
    const metrics = fcfsHelper.calculateFCFSMetrics(new Date(), nextAvailableST, duration);

    // 3. Simpan ke Database
    await db.query(
        'INSERT INTO bookings (user_id, facilities_id, start_time, end_time, status) VALUES (?, ?, ?, ?, "Pending")',
        [req.userId, fasilitasId, metrics.start_time, metrics.end_time]
    );

    res.status(201).json({ message: 'Booking created' });
});
```

---

## 📂 File Entry Point (`index.js`)
Jangan lupa mendaftarkan route Anda di file utama server.

```javascript
const bookingRoutes = require('./routes/bookings');
// ... imports lainnya

app.use('/api/bookings', bookingRoutes);
```

---

## 💡 Tips Coding
- Gunakan `res.status(500).json(...)` untuk menangkap error database agar aplikasi tidak crash.
- Manfaatkan **Express Router** agar file `index.js` tetap ramping.

---

**Langkah Selanjutnya:**
[05 — Frontend Vite React](./05_FRONTEND_VITE_REACT.md)
