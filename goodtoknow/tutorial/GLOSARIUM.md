# 📖 Kamus Istilah Teknis (Glossary)
> Penjelasan sederhana untuk berbagai istilah teknis yang sering muncul dalam pengembangan aplikasi SIPENDORA.

---

## 🏛️ Arsitektur & Konsep Dasar

### **1. Frontend (Client-Side)**
Bagian dari aplikasi yang berinteraksi langsung dengan pengguna (apa yang kamu lihat di browser). Di SIPENDORA, Frontend dibangun menggunakan **React** dan **Vite**, mengurus UI (User Interface) seperti tombol, form, tabel, dan halaman.

### **2. Backend (Server-Side)**
Otak di balik layar yang memproses logika bisnis, berinteraksi dengan database, dan mengamankan data. Di SIPENDORA, Backend dibangun dengan **Node.js** dan **Express.js**. Pengguna tidak pernah melihat kode backend secara langsung.

### **3. Fullstack**
Sebutan untuk aplikasi (atau developer) yang mencakup pengembangan baik di sisi **Frontend** maupun **Backend**. SIPENDORA adalah aplikasi Fullstack.

### **4. API (Application Programming Interface)**
Jembatan komunikasi antara Frontend dan Backend. Ibarat pelayan restoran: Frontend (pelanggan) memesan data melalui API (pelayan) ke Backend (dapur), lalu API membawa kembali data (makanan) ke Frontend.

### **5. REST API**
Sebuah standar/arsitektur untuk membangun API menggunakan protokol HTTP. Dalam REST API, kita menggunakan URL (seperti `/api/bookings`) dan HTTP Methods untuk memanipulasi data.

### **6. JSON (JavaScript Object Notation)**
Format teks standar untuk mengirim dan menerima data di web. Ringan dan mudah dibaca baik oleh manusia maupun mesin. Hampir semua komunikasi API di SIPENDORA menggunakan format JSON.

```json
{
  "id": 1,
  "nama": "Budi Santoso",
  "role": "penyewa"
}
```

---

## 🌐 Teknologi & Framework

### **7. Node.js**
Lingkungan runtime yang memungkinkan kita menjalankan JavaScript di sisi server (bukan di browser).

### **8. Express.js**
Framework minimalis untuk Node.js yang memudahkan kita membangun server dan routing API dengan cepat.

### **9. React**
Library JavaScript populer dari Facebook (Meta) untuk membangun antarmuka pengguna (UI) berbasis komponen yang interaktif.

### **10. Vite**
Build tool modern yang sangat cepat untuk proyek frontend (seperti React). Menggantikan tools lama seperti Create React App atau Webpack.

### **11. Tailwind CSS**
Framework CSS berbasis "utility-first". Daripada menulis file CSS terpisah, kita menggunakan class kecil langsung di HTML/JSX (seperti `bg-blue-500 text-white p-4`).

### **12. MySQL / RDBMS**
MySQL adalah sistem manajemen database relasional (RDBMS). Data disimpan dalam bentuk tabel yang saling berelasi (memiliki hubungan).

---

## ⚙️ Istilah Pemrograman Web

### **13. SPA (Single Page Application)**
Aplikasi web yang hanya memuat **satu halaman HTML** tunggal. Saat pengguna berpindah halaman, browser tidak melakukan *reload* halaman secara penuh, melainkan JavaScript (React) yang mengganti konten di layar secara dinamis.

### **14. HTTP Methods**
Kata kerja yang memberi tahu server aksi apa yang ingin kita lakukan:
- **GET**: Meminta/mengambil data (contoh: lihat daftar fasilitas).
- **POST**: Mengirim data baru (contoh: daftar akun, buat booking baru).
- **PUT / PATCH**: Memperbarui data yang sudah ada.
- **DELETE**: Menghapus data.

### **15. Middleware**
Fungsi "penjaga pintu" di backend yang berjalan di antara request masuk dan response keluar. Sering digunakan untuk mengecek apakah user sudah login atau punya hak akses.

### **16. JWT (JSON Web Token)**
Teknologi untuk keamanan (autentikasi). Setelah login, backend memberikan JWT (berupa string panjang) ke frontend. Frontend kemudian menyelipkan JWT ini di setiap request selanjutnya sebagai "kartu identitas" bukti bahwa ia sudah login.

### **17. State / Global State**
**State** adalah data yang menentukan bagaimana sebuah komponen UI ditampilkan pada satu waktu.
**Global State** (di SIPENDORA dikelola oleh *Zustand*) adalah data yang bisa dibagikan dan diakses oleh banyak halaman sekaligus tanpa harus saling mengoper, contoh: data user yang sedang login.

### **18. Routing / Router**
Sistem navigasi di aplikasi. Menentukan URL mana (`/dashboard`, `/login`) yang akan menampilkan halaman atau menjalankan fungsi yang mana.

### **19. Raw Query vs ORM**
- **Raw Query**: Menulis perintah SQL mentah secara manual di kode (contoh: `SELECT * FROM tb_user`). SIPENDORA menggunakan ini.
- **ORM (Object Relational Mapping)**: Menggunakan library untuk berinteraksi dengan database menggunakan kode JavaScript/objek tanpa menulis SQL (contoh: Sequelize, Prisma).

---

## ⏱️ Istilah Khusus SIPENDORA

### **20. FCFS (First Come First Served)**
Algoritma penjadwalan. Intinya: **"Siapa cepat, dia dapat"**. Permintaan diproses secara berurutan murni berdasarkan *timestamp* waktu pemesanan (Arrival Time).

### **21. RBAC (Role-Based Access Control)**
Sistem pembatasan akses berdasarkan peran (Role). Di SIPENDORA ada 3 role: **Penyewa**, **Admin**, dan **Pimpinan**, masing-masing memiliki tampilan dan hak akses menu yang berbeda.

### **22. Non-Preemptive Locking**
Konsep di mana sebuah sumber daya (slot jadwal lapangan) yang sedang diproses oleh seseorang, tidak bisa diganggu gugat, dipotong, atau dipesan oleh orang lain sampai proses tersebut selesai (atau dibatalkan).

### **23. Endpoint**
Alamat URL spesifik dari sebuah API yang menjalankan tugas tertentu. Contoh: `http://localhost:5000/api/auth/login`.
