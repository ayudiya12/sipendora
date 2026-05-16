# Bab 3 — Routes & FCFS Engine

> **Tujuan bab ini:** Memahami cara route handler bekerja, bagaimana algoritma FCFS diimplementasikan dalam kode nyata, dan bagaimana upload file dikelola.

---

## 3.1 Anatomi Sebuah Route File

Setiap file di folder `routes/` mengikuti pola yang sama:

```js
const express = require('express');
const router = express.Router();   // ← Buat mini-router, bukan app utama
const db = require('../db');       // ← Import koneksi database
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Definisi endpoint ...
router.get('/path', [middleware1, middleware2], async (req, res) => {
    // logika handler
});

module.exports = router; // ← Ekspor agar bisa di-import di index.js
```

`express.Router()` menciptakan router modular yang kemudian "di-mount" ke `app` utama di `index.js` dengan prefix tertentu.

---

## 3.2 Pola Query Database

Di SIPENDORA, semua query database menggunakan **raw SQL** dengan `mysql2/promise` — tidak pakai ORM seperti Sequelize atau Prisma.

### Query Biasa (Satu Koneksi dari Pool)

```js
// Destructuring: [rows] mengambil elemen pertama dari array hasil query
const [rows] = await db.query('SELECT * FROM tb_user WHERE id = ?', [userId]);
// rows = array of objects, contoh: [{ id: 1, nama: 'Budi', ... }]

// Jika hanya butuh 1 baris, pakai double destructuring
const [[user]] = await db.query('SELECT * FROM tb_user WHERE id = ?', [userId]);
// user = { id: 1, nama: 'Budi', ... } (langsung objeknya, bukan array)
```

### Query dengan Transaction (Operasi Kritis)

Transaction digunakan saat **beberapa query harus berhasil semua atau gagal semua**. Jika satu gagal, semua dibatalkan (`rollback`).

```js
const conn = await db.getConnection(); // Ambil koneksi khusus dari pool
try {
    await conn.beginTransaction();  // Mulai transaction

    await conn.query('INSERT INTO tb_booking ...');
    await conn.query('UPDATE tb_fasilitas ...');

    await conn.commit();   // Semua berhasil → simpan permanen
} catch (error) {
    await conn.rollback(); // Ada yang gagal → batalkan semua
    res.status(400).json({ error: error.message });
} finally {
    conn.release(); // ← WAJIB! Kembalikan koneksi ke pool
}
```

> ⚠️ `conn.release()` di `finally` sangat penting. Jika tidak, koneksi tidak dikembalikan ke pool dan akhirnya pool habis → server hang.

---

## 3.3 Algoritma FCFS: `server/utils/fcfsHelper.js`

Ini adalah **inti matematis** dari SIPENDORA. Fungsi kecil ini menghitung semua metrik antrian.

```js
/**
 * @param {Date}   arrivalTime     - Waktu klik pesan (AT)
 * @param {Date}   nextAvailableST - Waktu mulai sesi yang dipilih (ST)
 * @param {number} durationHours   - Durasi sesi dalam jam (BT)
 */
const calculateFCFSMetrics = (arrivalTime, nextAvailableST, durationHours) => {
    const at = new Date(arrivalTime);
    const st = new Date(nextAvailableST);
    const bt = durationHours * 60; // Jam → Menit (Burst Time)

    // Completion Time = Start Time + Burst Time
    const ct = new Date(st.getTime() + bt * 60000); // menit → milidetik

    // Turnaround Time = CT - AT (dalam menit)
    const tat = Math.max(bt, (ct - at) / (1000 * 60));

    // Waiting Time = TAT - BT = ST - AT (waktu menunggu sebelum mulai)
    const wt = Math.max(0, (st - at) / (1000 * 60));

    return {
        arrival_time:    at,
        start_time:      st,
        end_time:        ct,
        burst_time:      Math.round(bt),
        turnaround_time: Math.round(tat),
        waiting_time:    Math.round(wt),
        response_time:   Math.round(wt) // Sama dengan WT pada FCFS non-preemptive
    };
};
```

### Simulasi Nyata:

```
Penyewa A pesan Lapangan Sepak Bola, Sesi Pagi (08:00-12:00) pada jam 09:30

AT = 09:30 (waktu klik)
ST = 08:00 (waktu mulai sesi)  ← sesi sudah dimulai, tapi tidak ada yang pakai
BT = 4 jam = 240 menit
CT = 08:00 + 240 menit = 12:00

TAT = CT - AT = 12:00 - 09:30 = 150 menit
WT  = ST - AT = 08:00 - 09:30 = -90 menit → Math.max(0, -90) = 0

Artinya: Penyewa A tidak perlu menunggu (WT=0) karena datang di sesi yang masih tersedia.
```

---

## 3.4 Flow Booking Lengkap: `server/routes/bookings.js`

Ini adalah route paling kompleks di SIPENDORA. Mari kita bedah langkah per langkah.

### `POST /api/bookings` — Buat Booking Baru

```js
router.post('/', verifyToken, async (req, res) => {
    const { fasilitasId, tarifId, tanggal_booking } = req.body;
    const userId = req.user.id;
    const arrivalTime = new Date(); // ← Timestamp FCFS diambil SEKARANG
    // ...
```

**Langkah 1 — Validasi Input**

```js
if (!fasilitasId || !tarifId || !tanggal_booking) {
    return res.status(400).json({ error: "Data booking tidak lengkap" });
}
```

**Langkah 2 — Buka Transaction & Ambil Data**

```js
const conn = await db.getConnection();
await conn.beginTransaction();

// SELECT ... FOR UPDATE = Database Lock!
// Baris yang di-SELECT tidak bisa diubah proses lain sampai transaction selesai
const [[facility]] = await conn.query(
    'SELECT id, nama_fasilitas, jumlah_unit FROM tb_fasilitas WHERE id = ? FOR UPDATE',
    [fasilitasId]
);
```

**Langkah 3 — Logika Eksklusivitas Event**

```js
// Cek apakah sudah ada booking aktif di hari & fasilitas yang sama
const [anyBookings] = await conn.query(
    `SELECT b.id, t.tipe_tarif FROM tb_booking b
     JOIN tb_fasilitas_tarif t ON b.tarifId = t.id
     WHERE b.fasilitasId = ? AND b.tanggal_booking = ?
     AND b.status_booking IN ('PENDING', 'APPROVED', 'WAITING_VERIFICATION', 'CONFIRMED')`,
    [fasilitasId, tanggal_booking]
);

const hasEvent = anyBookings.some(b => b.tipe_tarif === 'EVENT');

if (tariff.tipe_tarif === 'EVENT' && anyBookings.length > 0) {
    throw new Error("Event memerlukan hari kosong sepenuhnya.");
}
if (tariff.tipe_tarif !== 'EVENT' && hasEvent) {
    throw new Error("Fasilitas sudah dibooking untuk Event hari ini.");
}
```

**Langkah 4 — Validasi Waktu (min. 2 jam sebelum sesi selesai)**

```js
const todayStr = new Date().toISOString().split('T')[0];
if (tanggal_booking === todayStr) {
    const sessionEnd = new Date(`${tanggal_booking} ${tariff.jam_selesai}`);
    const diffMins = Math.floor((sessionEnd - new Date()) / 60000);
    if (diffMins < 120) {
        throw new Error("Sesi akan berakhir dalam < 2 jam. Pilih sesi lain.");
    }
}
```

**Langkah 5 — Cek Ketersediaan Unit & Assign Nomor Unit**

```js
const [existingBookings] = await conn.query(
    `SELECT nomor_unit FROM tb_booking
     WHERE fasilitasId = ? AND tarifId = ? AND tanggal_booking = ?
     AND status_booking IN ('PENDING', 'APPROVED', 'WAITING_VERIFICATION', 'CONFIRMED')`,
    [fasilitasId, tarifId, tanggal_booking]
);

// Jika semua unit sudah terisi
if (existingBookings.length >= facility.jumlah_unit) {
    throw new Error("Sesi ini sudah penuh.");
}

// Cari unit yang belum dipakai
const occupiedUnits = existingBookings.map(b => b.nomor_unit);
let assignedUnit = 1;
for (let i = 1; i <= facility.jumlah_unit; i++) {
    if (!occupiedUnits.includes(i)) {
        assignedUnit = i;
        break;
    }
}
```

**Langkah 6 — Hitung Metrik FCFS & Simpan**

```js
const sessionStart = new Date(`${tanggal_booking} ${tariff.jam_mulai}`);
const durationHours = sessionDurationMinutes / 60;
const metrics = calculateFCFSMetrics(arrivalTime, sessionStart, durationHours);

const [result] = await conn.query(
    `INSERT INTO tb_booking (
        userId, fasilitasId, tarifId, nomor_unit, tanggal_booking,
        arrival_time, start_time, completion_time,
        burst_time, turnaround_time, waiting_time, response_time,
        total_biaya, status_booking
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
    [ userId, fasilitasId, tarifId, assignedUnit, tanggal_booking,
      arrivalTime, metrics.start_time, metrics.end_time,
      metrics.burst_time, metrics.turnaround_time, metrics.waiting_time,
      metrics.response_time, tariff.harga ]
);

await conn.commit();
```

---

## 3.5 FCFS Lock saat Admin Approve

SIPENDORA memastikan admin tidak bisa melanggar urutan FCFS:

```js
// PATCH /api/bookings/admin/approve-data/:id
router.patch('/admin/approve-data/:id', [verifyToken, isAdmin], async (req, res) => {
    const [[targetBooking]] = await db.query(
        "SELECT fasilitasId, tarifId, tanggal_booking, nomor_unit, arrival_time FROM tb_booking WHERE id = ?",
        [id]
    );

    // Cek: ada tidak booking yang arrival_time-nya LEBIH AWAL di unit yang sama?
    const [[olderBooking]] = await db.query(
        `SELECT id FROM tb_booking
         WHERE fasilitasId = ? AND tarifId = ? AND tanggal_booking = ? AND nomor_unit = ?
         AND arrival_time < ?          ← Lebih awal dari yang mau di-approve
         AND status_booking = 'PENDING'
         LIMIT 1`,
        [targetBooking.fasilitasId, targetBooking.tarifId,
         targetBooking.tanggal_booking, targetBooking.nomor_unit,
         targetBooking.arrival_time]
    );

    if (olderBooking) {
        return res.status(423).json({   // 423 = Locked
            error: "FCFS LOCK: Verifikasi pesanan yang masuk lebih awal dulu!"
        });
    }
    // Lanjut approve...
});
```

> **Status 423 Locked** — HTTP status code yang tepat untuk kondisi "resource sedang dikunci". Ini adalah implementasi Non-Preemptive Locking FCFS.

---

## 3.6 Upload Bukti Pembayaran: `server/routes/payments.js`

File ini menangani upload gambar dengan logika yang adaptif antara lokal dan production.

### Deteksi Environment

```js
// Apakah berjalan di cloud (Railway/Vercel)?
const isLocal = !process.env.VERCEL_ENV && !process.env.RAILWAY_ENVIRONMENT_ID;
```

### Konfigurasi Multer

```js
const storage = isLocal
    // LOKAL: Simpan file ke disk
    ? multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => {
            const uniqueName = `proof-${Date.now()}${path.extname(file.originalname)}`;
            cb(null, uniqueName); // Contoh: proof-1715759400000.jpg
        }
    })
    // PRODUCTION: Simpan ke memory buffer, lalu upload ke Vercel Blob
    : multer.memoryStorage();

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const valid = allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype);
        valid ? cb(null, true) : cb(new Error('Hanya format gambar yang diizinkan'));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
```

### Handler Upload

```js
router.post('/upload', [verifyToken, upload.single('image'), handleMulterError], async (req, res) => {
    const { bookingId, metode_pembayaran } = req.body;

    let imageUrl = null;
    if (req.file) {
        if (isLocal) {
            // Path relatif yang bisa diakses via /uploads/payments/namafile.jpg
            imageUrl = `/uploads/payments/${req.file.filename}`;
        } else {
            // Upload ke Vercel Blob Storage (cloud)
            const blob = await put(`payments/proof-${Date.now()}.jpg`, req.file.buffer, { access: 'public' });
            imageUrl = blob.url;
        }
    }

    // Simpan ke database dengan UPSERT (Insert atau Update jika sudah ada)
    await db.query(
        `INSERT INTO tb_pembayaran (bookingId, metode_pembayaran, bukti_pembayaran, status_verifikasi)
         VALUES (?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
            bukti_pembayaran = VALUES(bukti_pembayaran),
            status_verifikasi = 0`,   // Reset ke "belum diverifikasi"
        [bookingId, metode_pembayaran, imageUrl]
    );

    // Update status booking
    await db.query("UPDATE tb_booking SET status_booking = 'WAITING_VERIFICATION' WHERE id = ?", [bookingId]);

    res.json({ message: 'Bukti diunggah, menunggu verifikasi admin.', url: imageUrl });
});
```

---

## 3.7 Sistem Notifikasi: `server/utils/notifHelper.js`

Helper ini digunakan di seluruh route untuk mengirim notifikasi ke user.

```js
const sendNotif = async (userId, title, message, type = 'INFO') => {
    if (userId === null) {
        // Kirim ke SEMUA admin (broadcast)
        const [admins] = await db.query("SELECT id FROM tb_user WHERE role = 'ADMIN'");
        const values = admins.map(admin => [admin.id, title, message, type]);
        if (values.length > 0) {
            await db.query("INSERT INTO tb_notifikasi (userId, title, message, type) VALUES ?", [values]);
        }
    } else {
        // Kirim ke user spesifik
        await db.query(
            "INSERT INTO tb_notifikasi (userId, title, message, type) VALUES (?, ?, ?, ?)",
            [userId, title, message, type]
        );
    }
};
```

**Cara pemakaian:**

```js
// Kirim ke semua admin (userId = null)
sendNotif(null, "Booking Baru", `${req.user.nama} memesan lapangan`, "INFO");

// Kirim ke penyewa tertentu
sendNotif(booking.userId, "Pembayaran Terverifikasi", "Booking Anda dikonfirmasi!", "SUCCESS");
```

Type notifikasi: `INFO`, `SUCCESS`, `WARNING`, `DANGER`.

---

## 3.8 Status Flow Booking

```
[PENDING]
  Booking baru dibuat oleh penyewa
  ↓ Admin approve data
[APPROVED]
  Data disetujui, penyewa bisa upload bukti bayar
  ↓ Penyewa upload bukti
[WAITING_VERIFICATION]
  Menunggu admin verifikasi pembayaran
  ↓ Admin verifikasi pembayaran
[CONFIRMED]
  Booking sah & dikonfirmasi ✅

Kapanpun bisa → [CANCELED]
  Penyewa batalkan (jika belum CONFIRMED)
  Admin tolak (dari PENDING)
```

---

## 3.9 Ringkasan Bab 3

| Konsep | Detail |
|--------|--------|
| `router.get/post/patch` | Definisi endpoint dengan path + middleware + handler |
| Transaction DB | `beginTransaction → commit/rollback → release` |
| `FOR UPDATE` | Database lock agar tidak ada race condition |
| `calculateFCFSMetrics()` | Hitung AT, BT, ST, CT, TAT, WT dari timestamp |
| FCFS Lock Admin | Cegah approve jika ada booking lebih awal yang belum diproses |
| Multer | Middleware untuk handle upload file (gambar bukti bayar) |
| `sendNotif()` | Kirim notifikasi ke user atau broadcast ke semua admin |

---

➡️ **Lanjut ke [Bab 4 — Frontend Dasar: Vite, React & Routing](./04_FRONTEND_DASAR.md)**
