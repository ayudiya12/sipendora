# 📂 Struktur Proyek SIPENDORA (Raw MySQL Mode)

Proyek ini menggunakan arsitektur **Decoupled Full-stack** yang bersih dan mudah dipelajari tanpa ketergantungan pada ORM berat seperti Prisma.

---

## 🏗️ Folder Utama

### `📁 client/` (Frontend - React)
Tempat semua tampilan aplikasi berada.
- **`src/`**: Folder kerja utama UI.
  - `App.jsx`: Komponen pusat aplikasi.
  - `main.jsx`: Entry point React.
  - `index.css`: Desain Tailwind CSS.
- **`tailwind.config.js`**: Konfigurasi desain (warna, font).
- **`package.json`**: Library frontend.

### `📁 server/` (Backend - Node.js & Express)
Tempat logika "otak" aplikasi dan koneksi database.
- **`db.js`**: File penghubung utama ke MySQL menggunakan `mysql2/promise`.
- **`database.sql`**: File skema database (Cetak Biru). Gunakan ini untuk membuat tabel di MySQL.
- **`.env`**: Konfigurasi rahasia (DB User, Password, Port).
- **`index.js`**: Server utama yang menjalankan API.
- **`package.json`**: Library backend.

---

## 📄 File Kunci (The Big Players)

### 🛢️ `server/database.sql`
Ini adalah jantung database Anda. Berisi perintah SQL murni untuk membuat tabel `tb_user`, `tb_fasilitas`, `tb_booking`, dan lainnya, lengkap dengan index untuk performa.

### 🔌 `server/db.js`
File ini membuat "Pool Connection". Artinya, aplikasi tidak akan gampang putus koneksi ke database meskipun banyak yang akses.

### ⚙️ `server/.env`
Berisi alamat database. Contoh: `DB_HOST=localhost`, `DB_USER=root`, dll.

---

## 🔄 Alur Komunikasi
1. **User** klik tombol di **React (Client)**.
2. **React** kirim request ke **Express (Server)** via URL (contoh: `/api/fasilitas`).
3. **Express** minta data ke **MySQL** lewat perintah SQL di **db.js**.
4. **MySQL** kasih data balik ke **Express**.
5. **Express** kirim data dalam format **JSON** ke **React**.
6. **React** tampilkan data dengan cantik di layar user.
