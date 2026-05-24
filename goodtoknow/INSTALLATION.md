# 🚀 Panduan Lengkap Instalasi SIPENDORA

Dokumen ini berisi langkah-langkah dari nol (titik 0) untuk menyiapkan lingkungan pengembangan hingga menjalankan aplikasi.

---

## 🛠️ Langkah 1: Persiapan Software (Environment)
Sebelum menyentuh kodingan, pastikan laptop Anda sudah memiliki:

1. **Node.js:** Jantung untuk menjalankan JavaScript di komputer.
   - **Download:** [nodejs.org](https://nodejs.org/) (Pilih versi **LTS**).
   - **Cek:** Buka terminal, ketik `node -v` dan `npm -v`.
2. **Laragon:** Untuk server MySQL lokal.
   - **Download:** [laragon.org](https://laragon.org/download/).
   - **Alternatif:** XAMPP.
3. **VS Code:** Aplikasi untuk ngetik kode (Code Editor).
   - **Download:** [code.visualstudio.com](https://code.visualstudio.com/).
4. **Postman:** Untuk ngetes API Backend.
   - **Download:** [postman.com](https://www.postman.com/downloads/).

---

## 🏗️ Langkah 2: Cara Saya Membangun Project Ini (Scratch)
Jika Anda ingin tahu apa yang saya lakukan tadi untuk membuat folder ini dari nol:

1. **Membuat Folder Utama:** `mkdir sipendora`
2. **Setup Frontend (React):**
   ```bash
   cd client
   npm create vite@latest . -- --template react
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
3. **Setup Backend (Express):**
   ```bash
   cd server
   npm init -y
   npm install express mysql2 cors dotenv concurrently
   ```

---

## 📥 Langkah 3: Instalasi Project (Setelah Download)
Jika Anda baru saja meng-copy folder ini, lakukan ini:

1. **Instal Library:**
   Buka terminal di folder utama `sipendora`, ketik:
   ```bash
   npm run install-all
   ```
2. **Siapkan Database:**
   - Jalankan Laragon, pastikan MySQL **Start**.
   - Buka Adminer/HeidiSQL, buat database bernama `sipendora`.
   - Jalankan script di file `server/database.sql`.
3. **Konfigurasi `.env`:**
   - Masuk ke folder `server`, buka file `.env`.
   - Sesuaikan `DB_PASSWORD` sesuai password MySQL Anda (contoh: `roots`).

---

## 🏃 Langkah 4: Menjalankan Aplikasi
Cukup buka satu terminal di folder root (`sipendora`), ketik:
```bash
npm run dev
```

---

## 💻 Cara Pindah Device (Migrasi)
1. **Export Database:** Simpan database `sipendora` menjadi file `.sql`.
2. **Copy Folder:** Copy seluruh folder `sipendora` (Kecuali folder `node_modules` agar ringan).
3. **Di Laptop Baru:** 
   - Instal Node.js & Laragon.
   - Jalankan `npm run install-all`.
   - Import database `.sql`.
   - Jalankan `npm run dev`.

---

## ⚠️ Troubleshooting & Resolusi Konflik Dependency

Project ini menggunakan **React 19** di sisi frontend, sedangkan beberapa library pihak ketiga (seperti `lucide-react` versi awal) secara bawaan memiliki *peer dependency* yang hanya menargetkan React 16/17/18.

### 🛡️ Solusi Permanen (Sudah Diterapkan):
Anda **tidak perlu** menggunakan flag `--legacy-peer-deps` secara manual lagi. Kami telah mengimplementasikan solusi permanen berikut ke dalam konfigurasi project:
1. **Pembersihan Root:** Menghapus semua dependency React duplikat dari root `package.json` agar `node_modules` root tetap steril.
2. **NPM Overrides:** Menambahkan konfigurasi `"overrides"` di [client/package.json](file:///d:/job-besak/sipendora/client/package.json) untuk secara otomatis menyelaraskan *peer dependency* React ke versi `^19.0.0` yang terinstal di client.

Dengan ini, Anda cukup menjalankan:
```bash
npm run install-all
```
Instalasi akan berjalan dengan lancar, bersih, dan sukses 100%!
