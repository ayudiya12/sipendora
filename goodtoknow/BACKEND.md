# ⚙️ Panduan Backend SIPENDORA

Backend SIPENDORA dibangun menggunakan **Node.js** dan **Express JS**

---

## 🛠️ Teknologi yang Digunakan
- **Express JS:** Framework web minimalis untuk Node.js.
- **mysql2/promise:** Driver database MySQL yang mendukung fitur *Async/Await* (Modern JavaScript).
- **CORS:** Izin agar Frontend (React) bisa mengambil data dari Backend.
- **Dotenv:** Pengelola variabel lingkungan (keamanan).

---

## 🚀 API Endpoints (Daftar Alamat)

| Method | Endpoint | Fungsi |
| :--- | :--- | :--- |
| `GET` | `/` | Cek status server (Health Check). |
| `GET` | `/api/fasilitas` | Mengambil seluruh daftar lapangan olahraga. |
| `POST` | `/api/auth/login` | (Coming Soon) Login user & admin. |
| `POST` | `/api/booking` | (Coming Soon) Proses pemesanan dengan logika FCFS. |

---

## 🧠 Logika Utama (FCFS Logic)
Logika **First Come First Served** dijalankan di sisi server untuk menjamin:
1. **Keakuratan Waktu:** Menggunakan jam server, bukan jam komputer user (yang bisa dimanipulasi).
2. **Database Locking:** Mencegah dua orang memesan di detik yang sama.

---

## 🧪 Cara Testing
Gunakan **Postman** atau browser:
1. Jalankan server: `npm run dev` di folder `server`.
2. Akses `http://localhost:5000/api/fasilitas`.
3. Pastikan status code adalah **200 OK**.
