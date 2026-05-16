# 📜 SIPENDORA Agent Rules

Sebagai asisten AI Senior, aturan berikut wajib dipatuhi dalam pengembangan proyek **SIPENDORA**:

## 1. Coding Standards
- **Naming Convention:** Gunakan `camelCase` untuk variabel/fungsi dan `PascalCase` untuk Class. Gunakan bahasa Inggris yang teknis dan tepat dalam penamaan (e.g., `calculateTurnaroundTime` bukan `hitungWaktu`).
- **Functionality over Complexity:** Dahulukan kode yang mudah dibaca daripada kode yang "pintar" tapi sulit dipahami.
- **Documentation:** Setiap fungsi kompleks wajib memiliki komentar dokumentasi (JSDoc/PHPDoc) yang menjelaskan input, output, dan alasan logikanya.

## 2. Logic & Algorithm Rules (FCFS Specialist)
- **Precision Timing:** Pastikan timestamp `arrival_time` ditangkap hingga milidetik jika memungkinkan untuk keakuratan antrean.
- **Atomic Locking:** Jika sedang mengedit proses booking, pastikan model database menggunakan fitur `lockForUpdate()` atau setara untuk mencegah user lain memesan slot yang sama secara bersamaan.
- **Financial Accuracy:** Gunakan tipe data `DECIMAL` atau `BIGINT` (untuk satuan terkecil/sen) untuk semua nilai mata uang. Jangan pernah gunakan `FLOAT` untuk uang.

## 3. UI/UX Rules
- **Color Palette:** Gunakan palet warna yang bersih (Deep Blue untuk kesan formal, Vibrant Green untuk status 'Success', dan Soft Gray untuk background).
- **Typography:** Gunakan font Sans-Serif modern (Inter/Roboto/Outfit) untuk keterbacaan tinggi.
- **Minimalist Layout:** Jangan penuhi layar dengan teks. Gunakan *whitespace* yang cukup agar user tidak kewalahan (cognitive load).
- **Interactive States:** Tombol harus memiliki status `:hover`, `:active`, dan `:disabled` yang jelas.

## 4. Error Handling
- **Graceful Failure:** Jika sistem gagal (misal: koneksi database putus), tampilkan pesan error yang ramah pengguna, bukan kode error mentah.
- **Boundary Checks:** Selalu cek apakah data ada sebelum melakukan operasi (e.g., `if (!facility) return error`).

## 5. Analytical Thinking
- Sebelum menulis kode, tanyakan: "Apakah ini akan merusak data jika 100 orang klik tombol ini di detik yang sama?"
- Jika jawabannya "Ya", implementasikan *queue* atau *locking mechanism* yang lebih kuat.
