# 01 — Database dan Koneksi
> Langkah pertama: Menghubungkan Node.js dengan database MySQL.

Sipendora menggunakan **MySQL** sebagai penyimpanan data utama. Kita menggunakan library `mysql2` karena performanya yang cepat dan mendukung `Promise`.

---

## 1. Persiapan Database
Buat database bernama `sipendora` dan jalankan SQL schema yang tersedia di folder `server/database/schema.sql`.

---

## 2. Konfigurasi Environment (`.env`)
Simpan informasi sensitif di file `.env` pada folder `server/`:
```text
DB_HOST=localhost
DB_USER=root
DB_PASS=password_kamu
DB_NAME=sipendora
JWT_SECRET=rahasia_super_aman
```

---

## 3. Membuat Koneksi Pool (`db.js`)
Buat file `server/db.js` untuk mengelola koneksi database secara efisien menggunakan pool.

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
```

---

## 4. Cara Penggunaan di Server
Anda bisa melakukan query dengan cara mengimpor pool tersebut:
```javascript
const db = require('./db');

const [rows] = await db.query('SELECT * FROM fasilitas');
```

---

## 💡 Tips Coding
- Selalu gunakan `mysql2/promise` agar Anda bisa menggunakan sintaks `async/await` yang lebih rapi daripada callback.
- Gunakan `connectionLimit` yang sesuai dengan kapasitas server Anda untuk mencegah kebocoran koneksi.

---

**Langkah Selanjutnya:**
[02 — Authentication JWT](./02_AUTHENTICATION_JWT.md)
