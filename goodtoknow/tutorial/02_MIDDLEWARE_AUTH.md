# Bab 2 — Middleware & Autentikasi JWT

> **Tujuan bab ini:** Memahami cara sistem memverifikasi siapa yang boleh mengakses endpoint mana — ini adalah "penjaga pintu" seluruh API.

---

## 2.1 Apa itu Middleware?

Dalam Express.js, **middleware** adalah fungsi yang berjalan **di antara** request masuk dan response keluar. Ibaratnya seperti pos pemeriksaan sebelum kamu bisa masuk ke gedung.

```
Request Masuk
      │
      ▼
[CORS Middleware]       ← Cek apakah origin diizinkan?
      │
      ▼
[express.json()]        ← Parse body JSON
      │
      ▼
[verifyToken]           ← Cek JWT Token (custom middleware kita)
      │
      ▼
[isAdmin]               ← Cek apakah role = ADMIN? (custom middleware kita)
      │
      ▼
[Route Handler]         ← Logika bisnis sebenarnya
      │
      ▼
Response Keluar
```

Middleware dipasang dengan signature `(req, res, next)`. Jika semua ok, panggil `next()` untuk lanjut ke middleware/handler berikutnya. Jika tidak, kirim response error langsung.

---

## 2.2 File: `server/middleware/authMiddleware.js`

```js
const jwt = require('jsonwebtoken');

// ─── MIDDLEWARE 1: verifyToken ─────────────────────────────
const verifyToken = (req, res, next) => {
    // Ambil token dari header "Authorization: Bearer <token>"
    const token = req.headers['authorization']?.split(' ')[1];

    // Jika tidak ada token, tolak
    if (!token) {
        return res.status(403).json({ message: "Akses ditolak. Token tidak ditemukan." });
    }

    try {
        // Verifikasi dan decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meongmeong');
        req.user = decoded; // ← Simpan data user di req agar bisa dipakai handler
        next();             // ← Lanjut ke handler berikutnya
    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid atau kadaluwarsa." });
    }
};

// ─── MIDDLEWARE 2: isAdmin ─────────────────────────────────
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role.toUpperCase() === 'ADMIN') {
        next(); // ← Role cocok, lanjut
    } else {
        return res.status(403).json({ message: "Akses terlarang. Hanya untuk Admin." });
    }
};

// ─── MIDDLEWARE 3: isPimpinan ──────────────────────────────
const isPimpinan = (req, res, next) => {
    if (req.user && req.user.role.toUpperCase() === 'PIMPINAN') {
        next();
    } else {
        return res.status(403).json({ message: "Akses terlarang. Hanya untuk Pimpinan." });
    }
};

module.exports = { verifyToken, isAdmin, isPimpinan };
```

---

## 2.3 Bagaimana JWT Bekerja?

JWT (JSON Web Token) adalah **string terenkripsi** yang berisi informasi user. Formatnya: `header.payload.signature`

### Alur Lengkap:

```
[LOGIN]
  1. User kirim { email, password }
  2. Backend cek password via bcrypt.compare()
  3. Jika cocok → buat JWT:
       jwt.sign({ id, role, nama }, SECRET_KEY, { expiresIn: '1d' })
  4. Kirim token ke frontend

[REQUEST BERIKUTNYA]
  1. Frontend menyimpan token di localStorage
  2. Setiap request, kirim token di header:
       Authorization: Bearer eyJhbGciOiJI...
  3. Backend dekode token di verifyToken:
       jwt.verify(token, SECRET_KEY) → { id: 5, role: 'penyewa', nama: 'Budi' }
  4. Data user tersedia di req.user
```

### Visualisasi JWT:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Header (algoritma)
.
eyJpZCI6NSwicm9sZSI6InBlbnlld2EifQ      ← Payload (data user, bisa didecode!)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQ ← Signature (tidak bisa dipalsukan)
```

> ⚠️ **Payload JWT tidak dienkripsi** — siapapun bisa decode dan baca isinya. Jangan simpan data sensitif (password, nomor kartu kredit) di dalam token. Yang membuatnya aman adalah **Signature** — hanya server yang tahu `JWT_SECRET` bisa membuatnya.

---

## 2.4 Login di `auth.js` — Tempat JWT Dibuat

```js
// server/routes/auth.js
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Cari user berdasarkan email
    const [rows] = await db.query('SELECT * FROM tb_user WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

    const user = rows[0];

    // 2. Verifikasi password
    // bcrypt.compare() membandingkan password plain dengan hash di DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password salah" });

    // 3. Buat JWT Token — berisi id, role, nama (bukan password!)
    const token = jwt.sign(
      { id: user.id, role: user.role, nama: user.nama },
      process.env.JWT_SECRET || 'meongmeong',
      { expiresIn: '1d' }   // Token berlaku 1 hari
    );

    // 4. Kirim token + info user ke frontend
    res.json({
      message: "Login berhasil",
      token,
      user: { id: user.id, nama: user.nama, role: user.role, status_akun: user.status_akun }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Kenapa pakai Query Parameterized `(?, [value])`?

```js
// ✅ BENAR — parameterized query (aman dari SQL Injection)
db.query('SELECT * FROM tb_user WHERE email = ?', [email]);

// ❌ SALAH — string concatenation (rentan SQL Injection)
db.query(`SELECT * FROM tb_user WHERE email = '${email}'`);
```

Jika `email` berisi `' OR '1'='1`, query yang salah akan mengembalikan semua user!

---

## 2.5 Cara Memakai Middleware di Route

### Proteksi 1 Layer (hanya harus login):

```js
// Siapapun yang sudah login bisa akses
router.get('/my', verifyToken, async (req, res) => {
    // req.user sudah tersedia di sini karena verifyToken sudah jalan
    const userId = req.user.id;
    // ...
});
```

### Proteksi 2 Layer (harus login + harus admin):

```js
// Hanya admin yang bisa akses
router.get('/admin/all', [verifyToken, isAdmin], async (req, res) => {
    // Jika sampai sini, sudah pasti user adalah admin yang valid
    // ...
});
```

Middleware bisa dirangkai sebagai **array** `[verifyToken, isAdmin]` — dieksekusi berurutan dari kiri ke kanan.

---

## 2.6 Registrasi & Password Hashing

```js
router.post('/register', async (req, res) => {
  const { fullName, email, phone, password, alamat } = req.body;
  try {
    // Hash password sebelum disimpan ke DB
    // "10" adalah salt rounds — semakin tinggi semakin aman tapi lebih lambat
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO tb_user (nama, email, no_telp, alamat, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, phone, alamat, hashedPassword, 'penyewa']
      //                                 ↑ Simpan hash, BUKAN plain text
    );

    res.status(201).json({ message: "Registrasi berhasil. Menunggu verifikasi Admin." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

> **Mengapa hash?** Jika database bocor, attacker hanya melihat hash seperti `$2b$10$X...` bukan password asli. `bcrypt.compare()` yang mencocokkan tanpa perlu decode.

---

## 2.7 Endpoint Auth Lainnya

| Method | Path | Guard | Fungsi |
|--------|------|-------|--------|
| `POST` | `/api/auth/register` | Public | Daftar akun baru |
| `POST` | `/api/auth/login` | Public | Login, dapat token JWT |
| `GET`  | `/api/auth/me` | `verifyToken` | Ambil data user dari token |
| `GET`  | `/api/auth/admin-contact` | Public | Ambil kontak admin |
| `PUT`  | `/api/auth/profile` | `verifyToken` | Update profil user |
| `PUT`  | `/api/auth/password` | `verifyToken` | Ganti password |

---

## 2.8 Ringkasan Bab 2

| Konsep | Fungsi |
|--------|--------|
| `verifyToken` | Dekode JWT dari header, simpan di `req.user` |
| `isAdmin` | Pastikan `req.user.role === 'ADMIN'` |
| `jwt.sign()` | Buat token saat login |
| `jwt.verify()` | Validasi token setiap request |
| `bcrypt.hash()` | Enkripsi password sebelum simpan ke DB |
| `bcrypt.compare()` | Cocokkan password plain dengan hash |

---

➡️ **Lanjut ke [Bab 3 — Routes & FCFS Engine](./03_ROUTES_API.md)**
