# 03 — Algoritma FCFS Engine
> Implementasi logika First Come First Served untuk antrean jadwal sewa yang adil.

Jantung dari Sipendora adalah algoritma **FCFS**. Algoritma ini memastikan bahwa siapa yang melakukan pembayaran lebih dulu, akan mendapatkan prioritas jadwal tanpa tumpang tindih.

---

## 📂 Lokasi Kode
Logika utama terletak di `server/utils/fcfsHelper.js`. Fungsi ini menghitung parameter waktu berdasarkan antrean yang ada.

---

## 🧠 Parameter FCFS yang Digunakan

| Istilah | Nama Teknis | Deskripsi |
| :--- | :--- | :--- |
| **Arrival Time (AT)** | Waktu Datang | Waktu saat user menekan tombol bayar. |
| **Burst Time (BT)** | Waktu Eksekusi | Durasi sewa lapangan (misal: 2 jam). |
| **Start Time (ST)** | Waktu Mulai | Waktu tercepat yang tersedia setelah booking sebelumnya selesai. |
| **Completion Time (CT)** | Waktu Selesai | ST + BT. |
| **Waiting Time (WT)** | Waktu Tunggu | Selisih antara ST dan AT. |

---

## ⚙️ Implementasi Kode (`fcfsHelper.js`)

```javascript
const calculateFCFSMetrics = (arrivalTime, nextAvailableST, durationHours) => {
    const at = new Date(arrivalTime);
    const st = new Date(nextAvailableST);
    const bt = durationHours * 60; // Konversi jam ke menit
    
    // 1. Completion Time = Start Time + Burst Time
    const ct = new Date(st.getTime() + bt * 60000); 

    // 2. Waiting Time = Start Time - Arrival Time
    const wt = Math.max(0, (st - at) / (1000 * 60)); 

    return {
        arrival_time: at,
        start_time: st,
        end_time: ct,
        burst_time: bt,
        waiting_time: Math.round(wt)
    };
};
```

---

## 🔄 Alur Kerja Sistem
1. Sistem mengambil seluruh booking yang sudah **Lunas** pada tanggal tertentu.
2. Mengurutkan booking berdasarkan **Arrival Time** terkecil.
3. Mencari slot kosong (gap) atau waktu selesai terakhir sebagai **Start Time** untuk booking baru.
4. Menjalankan fungsi `calculateFCFSMetrics` untuk mendapatkan jadwal final yang tidak tumpang tindih.

---

## 💡 Tips Coding
- Gunakan objek `Date` JavaScript untuk perhitungan waktu yang akurat.
- Pastikan zona waktu (timezone) di server dan database sudah sinkron agar perhitungan AT tidak meleset.

---

**Langkah Selanjutnya:**
[04 — Backend API Routes](./04_BACKEND_API_ROUTES.md)
