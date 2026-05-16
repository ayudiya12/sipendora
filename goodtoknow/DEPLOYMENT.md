# 🚀 Panduan Deployment SIPENDORA

Dokumen ini mencatat langkah-langkah lengkap untuk men-deploy aplikasi SIPENDORA ke **Railway** (Backend & DB) dan **Vercel** (Frontend).

---

## 1. Persiapan Database (Railway MySQL)

1.  Buat project baru di Railway dan tambahkan layanan **MySQL**.
2.  Dapatkan kredensial database dari tab **Variables** di layanan MySQL (Host, Port, User, Password, Database).
3.  **Cara Import Database dari Lokal:**
    Karena menggunakan PowerShell, gunakan perintah berikut untuk memasukkan file `mydb.sql`:
    ```powershell
    # Cara 1 (PowerShell Native)
    Get-Content "server/database/mydb.sql" | mysql -h [HOST] -P [PORT] -u [USER] -p[PASSWORD] [DATABASE]

    # Cara 2 (Bungkus CMD)
    cmd /c 'mysql -h [HOST] -P [PORT] -u [USER] -p[PASSWORD] [DATABASE] < "server/database/mydb.sql"'
    ```
4.  **Verifikasi Tabel:**

    Gunakan script cepat ini untuk memastikan tabel sudah masuk:

    ```bash
    node -e "const mysql = require('mysql2/promise'); require('dotenv').config(); async function test() { try { const pool = mysql.createPool({ host: 'shuttle.proxy.rlwy.net', user: 'root', password: 'PASSWORD_ANDA', database: 'railway', port: PORT_ANDA }); const [rows] = await pool.query('SHOW TABLES'); console.log('✅ Tabel yang berhasil di-import:', rows.map(r => Object.values(r)[0]).join(', ')); process.exit(0); } catch (e) { console.error('❌ Error:', e.message); process.exit(1); } } test();"
    ```

---

## 🔄 **Refresh Database (Import Ulang Data Terbaru)**

Gunakan script ini jika ingin menghapus semua data lama dan import data terbaru dari local ke Railway:

```powershell
# === KONFIGURASI RAILWAY ===
$HOST = "shuttle.proxy.rlwy.net"
$PORT = "33168"
$USER = "root"
$PASSWORD = "UQzrcBtlYdxKYAWATDHrSjWLDeTKJTim"
$DATABASE = "railway"

# === STEP 1: HAPUS SEMUA TABEL LAMA ===
Write-Host "🗑️  Menghapus tabel lama..." -ForegroundColor Yellow
mysql -h $HOST -u $USER -p$PASSWORD --port $PORT --protocol=TCP $DATABASE -e "SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS tb_pembayaran, tb_notifikasi, tb_rekening, tb_user, tb_laporan, tb_fasilitas_gambar, tb_fasilitas_tarif, tb_fasilitas, tb_booking, tb_fasilitas_item; SET FOREIGN_KEY_CHECKS = 1;"

# === STEP 2: IMPORT DATA TERBARU ===
Write-Host "📥 Mengimport data terbaru..." -ForegroundColor Green
Get-Content "server/database/mydb.sql" | mysql -h $HOST -u $USER -p$PASSWORD --port $PORT --protocol=TCP $DATABASE

# === STEP 3: VERIFIKASI HASIL ===
Write-Host "✅ Verifikasi import..." -ForegroundColor Cyan
mysql -h $HOST -u $USER -p$PASSWORD --port $PORT --protocol=TCP $DATABASE -e "SHOW TABLES;"
mysql -h $HOST -u $USER -p$PASSWORD --port $PORT --protocol=TCP $DATABASE -e "SELECT COUNT(*) as total_notifikasi FROM tb_notifikasi;"

Write-Host "🎉 Database berhasil di-refresh!" -ForegroundColor Green
```

**Cara Pakai:**

1. Copy script di atas ke PowerShell
2. Pastikan file `server/database/mydb.sql` sudah ada dan up-to-date
3. Jalankan script - akan otomatis hapus lama dan import baru

**Quick Commands (jika hanya perlu satu step):**
```powershell
# Hapus tabel saja
mysql -h shuttle.proxy.rlwy.net -u root -pUQzrcBtlYdxKYAWATDHrSjWLDeTKJTim --port 33168 --protocol=TCP railway -e "SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS tb_pembayaran, tb_notifikasi, tb_rekening, tb_user, tb_laporan, tb_fasilitas_gambar, tb_fasilitas_tarif, tb_fasilitas, tb_booking, tb_fasilitas_item; SET FOREIGN_KEY_CHECKS = 1;"

# Import data saja  
Get-Content "server/database/mydb.sql" | mysql -h shuttle.proxy.rlwy.net -u root -pUQzrcBtlYdxKYAWATDHrSjWLDeTKJTim --port 33168 --protocol=TCP railway

# Cek tabel saja
mysql -h shuttle.proxy.rlwy.net -u root -pUQzrcBtlYdxKYAWATDHrSjWLDeTKJTim --port 33168 --protocol=TCP railway -e "SHOW TABLES;"
```

---

## 2. Deployment Backend (Railway Service)

1.  Buat layanan baru di Railway dari repository GitHub Anda.
2.  **Settings**:
    *   Set **Root Directory** ke `/server`.
3.  **Variables (WAJIB)**:
    Masukkan semua variabel ini di tab Variables layanan server:
    *   `JWT_SECRET`: Kata sandi rahasia untuk token login.
    *   `FRONTEND_URL`: URL Vercel Anda (Contoh: `https://sipendora.vercel.app`). **Jangan pakai tanda `/` di akhir.**
    *   `BLOB_READ_WRITE_TOKEN`: Token dari Vercel Blob (Lihat bagian Storage).
    *   `MIDTRANS_SERVER_KEY`: Key dari dashboard Midtrans.
    *   `MIDTRANS_CLIENT_KEY`: Key dari dashboard Midtrans.
    *   *(Railway akan otomatis menyambungkan `MYSQLHOST`, `MYSQLPORT`, dll jika layanan DB di-link).*

---

## 3. Deployment Frontend (Vercel)

1.  Import repository GitHub ke Vercel.
2.  **Project Settings**:
    *   **Root Directory**: Set ke `client`.
    *   **Build Command**: `npm run build`.
    *   **Install Command (PENTING untuk React 19)**: 
        Nyalakan **Override** dan isi dengan: `npm install --legacy-peer-deps`.
3.  **Environment Variables**:
    *   `VITE_API_URL`: URL Public dari Railway (Contoh: `https://sipendora-production.up.railway.app`). **Wajib pakai `https://`**.

---

## 4. Cloud Storage (Vercel Blob)

Aplikasi ini menggunakan Vercel Blob untuk menyimpan foto fasilitas dan bukti bayar secara permanen.
1.  Di Dashboard Vercel, buka tab **Storage** -> **Create Database** -> **Blob**.
2.  Setelah terbuat, copy **`BLOB_READ_WRITE_TOKEN`**.
3.  Pasang token tersebut di **Variables Railway** agar server bisa mengunggah file.

---

## 5. Troubleshooting Umum

*   **Error CORS**: Pastikan `FRONTEND_URL` di Railway sudah benar dan tidak ada typo.
*   **Error 500 saat Upload**: Pastikan `BLOB_READ_WRITE_TOKEN` sudah terpasang dan statusnya `public`.
*   **Gambar Tidak Muncul**: Login sebagai Admin, lalu upload ulang gambar fasilitas. Gambar lama yang berasal dari `localhost` tidak akan tampil di cloud.

---
*Dokumen ini dibuat otomatis oleh Antigravity AI Assistant.*
