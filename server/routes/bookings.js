const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { calculateFCFSMetrics } = require('../utils/fcfsHelper');
const { sendNotif } = require('../utils/notifHelper');

/**
 * @route   POST /api/bookings
 * @desc    Proses reservasi dengan Algoritma FCFS
 * @access  Private (Penyewa)
 */
router.post('/', verifyToken, async (req, res) => {
    const { fasilitasId, tarifId, tanggal_booking, nomor_unit, existingBookingId } = req.body;
    const userId = req.user.id;
    const arrivalTime = new Date(); 

    if (!fasilitasId || !tarifId || !tanggal_booking) {
        return res.status(400).json({ error: "Data booking tidak lengkap" });
    }

    // Cek apakah update booking expired
    let isUpdate = false;
    if (existingBookingId) {
        const [[existingBooking]] = await db.query(
            'SELECT id, status_booking, updatedAt FROM tb_booking WHERE id = ? AND userId = ?',
            [existingBookingId, userId]
        );
        if (existingBooking && existingBooking.status_booking === 'APPROVED') {
            const expiryTime = new Date(existingBooking.updatedAt).getTime() + 10 * 60 * 1000;
            if (new Date().getTime() > expiryTime) {
                isUpdate = true;
            }
        }
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Ambil data fasilitas & tarif
        const [[facility]] = await conn.query(
            'SELECT id, nama_fasilitas, jumlah_unit FROM tb_fasilitas WHERE id = ? FOR UPDATE', 
            [fasilitasId]
        );

        const [[tariff]] = await conn.query(
            'SELECT id, tipe_tarif, nama_tarif, harga, jam_mulai, jam_selesai FROM tb_fasilitas_tarif WHERE id = ?', 
            [tarifId]
        );

        if (!facility || !tariff) {
            throw new Error("Fasilitas atau Sesi tidak ditemukan");
        }

        // --- LOGIKA EKSKLUSIVITAS EVENT ---
        // Jika tarif adalah EVENT, dia memakan seluruh unit dan seluruh waktu hari itu.
        // Jika sudah ada booking APAPUN di hari itu, EVENT tidak bisa masuk.
        // Jika sedang booking SESI, cek apakah sudah ada EVENT di hari itu.

        const [anyBookings] = await conn.query(
            `SELECT b.id, t.tipe_tarif 
             FROM tb_booking b
             JOIN tb_fasilitas_tarif t ON b.tarifId = t.id
             WHERE b.fasilitasId = ? AND b.tanggal_booking = ? 
             AND b.status_booking IN ('PENDING', 'APPROVED', 'WAITING_VERIFICATION', 'CONFIRMED')`,
            [fasilitasId, tanggal_booking]
        );

        const hasEvent = anyBookings.some(b => b.tipe_tarif === 'EVENT');
        const hasAny = anyBookings.length > 0;

        if (tariff.tipe_tarif === 'EVENT') {
            if (hasAny) {
                throw new Error("Gedung/Lapangan sudah dibooking pada tanggal ini. Event memerlukan hari kosong.");
            }
        } else {
            if (hasEvent) {
                throw new Error("Maaf, seluruh fasilitas telah dibooking untuk Event / Keperluan Lain pada tanggal ini.");
            }
        }

        // 2. Tentukan Batas Waktu Sesi (untuk validasi & metrik)
        // Jika EVENT, kita asumsikan 08:00 - 22:00 (14 jam)
        const stStr = tariff.jam_mulai || '08:00:00';
        const enStr = tariff.jam_selesai || '22:00:00';

        const sessionStart = new Date(`${tanggal_booking} ${stStr}`);
        const sessionEnd = new Date(`${tanggal_booking} ${enStr}`);
        
        // --- VALIDASI WAKTU (Minimal 2 Jam Sebelum Sesi Berakhir) ---
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        if (tanggal_booking === todayStr) {
            // Hitung sisa waktu dalam menit sampai sesi berakhir
            const diffMs = sessionEnd - now;
            const diffMins = Math.floor(diffMs / (1000 * 60));

            // Jika sisa waktu kurang dari 120 menit (2 jam), maka tutup
            if (diffMins < 120) {
                throw new Error("Maaf, sesi ini akan berakhir dalam kurang dari 2 jam. Silakan pilih sesi lain untuk pengalaman bermain yang lebih maksimal.");
            }
        }

        // 3. HITUNG DURASI SESI (DALAM MENIT)
        const [startH, startM] = stStr.split(':').map(Number);
        const [endH, endM] = enStr.split(':').map(Number);
        const sessionDurationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        const sessionDurationHours = sessionDurationMinutes / 60;

        // 4. CARI START TIME (Sesuai Batas Sesi)
        const nextST = sessionStart;

        // 5. HITUNG METRIK FCFS
        const metrics = calculateFCFSMetrics(arrivalTime, nextST, sessionDurationHours);

        // 6. Validasi Unit & Assign Nomor Unit
        // Khusus EVENT, dia memakan nomor_unit 1 saja (karena eksklusif)
        let assignedUnit = 1;
        const requestedUnit = nomor_unit ? parseInt(nomor_unit) : null;

        if (tariff.tipe_tarif !== 'EVENT') {
            const [existingBookings] = await conn.query(
                `SELECT id, nomor_unit FROM tb_booking 
                 WHERE fasilitasId = ? AND tarifId = ? AND tanggal_booking = ? 
                 AND status_booking IN ('PENDING', 'APPROVED', 'WAITING_VERIFICATION', 'CONFIRMED')`,
                [fasilitasId, tarifId, tanggal_booking]
            );

            const occupiedUnits = existingBookings.map(b => b.nomor_unit);

            if (requestedUnit) {
                if (requestedUnit < 1 || requestedUnit > facility.jumlah_unit) {
                    throw new Error(`Nomor lapangan tidak valid. Harus antara 1 dan ${facility.jumlah_unit}.`);
                }
                if (occupiedUnits.includes(requestedUnit)) {
                    throw new Error(`Lapangan ${requestedUnit} pada sesi ini sudah dibooking oleh penyewa lain.`);
                }
                assignedUnit = requestedUnit;
            } else {
                if (existingBookings.length >= facility.jumlah_unit) {
                    throw new Error("Sesi ini sudah penuh. Semua unit telah disewa.");
                }

                // Cari nomor unit yang tersedia
                for (let i = 1; i <= facility.jumlah_unit; i++) {
                    if (!occupiedUnits.includes(i)) {
                        assignedUnit = i;
                        break;
                    }
                }
            }
        }

        // 6. HARGA FLAT PER SESI
        const totalBiaya = tariff.harga;

        // 7. SIMPAN KE DATABASE (UPDATE atau INSERT)
        let bookingId;
        if (isUpdate) {
            // Update booking expired yang sudah ada
            await conn.query(
                `UPDATE tb_booking SET
                    fasilitasId = ?, tarifId = ?, nomor_unit = ?, 
                    snapshot_nama_sesi = ?, snapshot_jam_mulai = ?, snapshot_jam_selesai = ?,
                    tanggal_booking = ?, 
                    arrival_time = ?, start_time = ?, completion_time = ?,
                    burst_time = ?, turnaround_time = ?, waiting_time = ?, 
                    response_time = ?, total_biaya = ?, status_booking = 'PENDING',
                    updatedAt = NOW()
                WHERE id = ?`,
                [
                    fasilitasId, tarifId, assignedUnit, tariff.nama_tarif,
                    stStr, enStr, tanggal_booking,
                    arrivalTime, metrics.start_time, metrics.end_time,
                    metrics.burst_time, metrics.turnaround_time, metrics.waiting_time,
                    metrics.response_time, totalBiaya, existingBookingId
                ]
            );
            bookingId = existingBookingId;
        } else {
            // Insert booking baru
            const [result] = await conn.query(
                `INSERT INTO tb_booking (
                    userId, fasilitasId, tarifId, nomor_unit, snapshot_nama_sesi,
                    snapshot_jam_mulai, snapshot_jam_selesai,
                    tanggal_booking, 
                    arrival_time, start_time, completion_time,
                    burst_time, turnaround_time, waiting_time, 
                    response_time,
                    total_biaya, status_booking
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
                [
                    userId, fasilitasId, tarifId, assignedUnit, tariff.nama_tarif,
                    stStr, enStr,
                    tanggal_booking,
                    arrivalTime, metrics.start_time, metrics.end_time,
                    metrics.burst_time, metrics.turnaround_time, metrics.waiting_time,
                    metrics.response_time,
                    totalBiaya
                ]
            );
            bookingId = result.insertId;
        }
        await conn.commit();

        // Kirim Notifikasi ke Admin (Async)
        sendNotif(null, "Booking Baru", `${req.user.nama} telah memesan ${facility.nama_fasilitas} untuk tanggal ${tanggal_booking}`, "INFO");

        res.status(201).json({ 
            message: "Booking berhasil dibuat (FCFS Verified)", 
            bookingId,
            metrics 
        });

    } catch (error) {
        await conn.rollback();
        console.error("BOOKING_ERROR:", error); // Tambahkan log ini
        res.status(400).json({ error: error.message });
    } finally {
        conn.release();
    }
});

/**
 * @route   GET /api/bookings/my
 * @desc    Ambil daftar booking milik user login
 */
router.get('/my', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT b.*, f.nama_fasilitas, t.nama_tarif, t.tipe_tarif, p.id as paymentId, p.status_verifikasi, p.bukti_pembayaran
             FROM tb_booking b
             JOIN tb_fasilitas f ON b.fasilitasId = f.id
             JOIN tb_fasilitas_tarif t ON b.tarifId = t.id
             LEFT JOIN tb_pembayaran p ON b.id = p.bookingId
             WHERE b.userId = ? ORDER BY b.createdAt DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/bookings/my/:id
 * @desc    Ambil rincian satu booking milik user login
 */
router.get('/my/:id', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT b.*, f.nama_fasilitas, t.nama_tarif, t.tipe_tarif, 
                    p.id as paymentId, p.status_verifikasi, p.bukti_pembayaran, p.metode_pembayaran
             FROM tb_booking b
             JOIN tb_fasilitas f ON b.fasilitasId = f.id
             JOIN tb_fasilitas_tarif t ON b.tarifId = t.id
             LEFT JOIN tb_pembayaran p ON b.id = p.bookingId
             WHERE b.userId = ? AND b.id = ?`,
            [req.user.id, req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Pesanan tidak ditemukan" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/bookings/admin/all
 * @desc    Ambil SEMUA booking (Untuk Admin)
 * @access  Private (Admin)
 */
router.get('/admin/all', [verifyToken, isAdmin], async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                b.*, 
                u.nama as nama_user, u.email as email_user, u.no_telp as phone_user,
                f.nama_fasilitas, 
                t.nama_tarif,
                p.id as paymentId, p.status_verifikasi, p.bukti_pembayaran, p.metode_pembayaran
             FROM tb_booking b
             JOIN tb_user u ON b.userId = u.id
             JOIN tb_fasilitas f ON b.fasilitasId = f.id
             JOIN tb_fasilitas_tarif t ON b.tarifId = t.id
             LEFT JOIN tb_pembayaran p ON b.id = p.bookingId
             ORDER BY 
                CASE 
                    WHEN status_booking = 'PENDING' THEN 1
                    WHEN status_booking = 'WAITING_VERIFICATION' THEN 2
                    WHEN status_booking = 'APPROVED' THEN 3
                    WHEN status_booking = 'CONFIRMED' THEN 4
                    WHEN status_booking = 'CANCELED' THEN 5
                    ELSE 6
                END DESC,
                b.createdAt DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/bookings/admin/dashboard-stats
 * @desc    Ambil statistik ringkasan untuk Dashboard Admin
 */
router.get('/admin/dashboard-stats', verifyToken, isAdmin, async (req, res) => {
    try {
        // 1. Total Booking
        const [[{ totalBookings }]] = await db.query("SELECT COUNT(*) as totalBookings FROM tb_booking");
        
        // 2. Pengguna Aktif (Penyewa)
        const [[{ activeUsers }]] = await db.query("SELECT COUNT(*) as activeUsers FROM tb_user WHERE role = 'PENYEWA'");
        
        // 3. Pendapatan (Hanya yang sudah CONFIRMED)
        const [[{ revenue }]] = await db.query("SELECT IFNULL(SUM(total_biaya), 0) as revenue FROM tb_booking WHERE status_booking = 'CONFIRMED'");
        
        // 4. Perlu Verifikasi (Waiting Verification atau Pending Data)
        const [[{ pendingVerifications }]] = await db.query(
            "SELECT COUNT(*) as pendingVerifications FROM tb_booking WHERE status_booking IN ('PENDING', 'WAITING_VERIFICATION')"
        );

        // 5. Daftar Pending Payments Terbaru
        const [pendingPayments] = await db.query(`
            SELECT b.id, u.nama as user, f.nama_fasilitas as facility, b.tanggal_booking as date, b.status_booking as status
            FROM tb_booking b
            JOIN tb_user u ON b.userId = u.id
            JOIN tb_fasilitas f ON b.fasilitasId = f.id
            WHERE b.status_booking = 'WAITING_VERIFICATION'
            ORDER BY b.updatedAt DESC
            LIMIT 5
        `);

        // 6. Log Sistem Terbaru (Semua Notifikasi sebagai Log Aktivitas)
        const [logs] = await db.query(`
            SELECT n.*, u.nama as userName 
            FROM tb_notifikasi n
            LEFT JOIN tb_user u ON n.userId = u.id
            ORDER BY n.createdAt DESC 
            LIMIT 5
        `).catch(() => [[]]); // Fallback if table not ready or different structure

        res.json({
            stats: {
                totalBookings,
                activeUsers,
                revenue,
                pendingVerifications
            },
            pendingPayments,
            logs: logs.map(l => ({
                time: new Date(l.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                msg: l.userName ? `[${l.userName}] ${l.title}` : `[SISTEM] ${l.title}`
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/bookings/admin/fcfs-stats
 * @desc    Ambil statistik performa FCFS untuk Admin
 */
router.get('/admin/fcfs-stats', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                b.*, 
                u.nama as nama_user,
                f.nama_fasilitas, 
                t.nama_tarif
             FROM tb_booking b
             JOIN tb_user u ON b.userId = u.id
             JOIN tb_fasilitas f ON b.fasilitasId = f.id
             JOIN tb_fasilitas_tarif t ON b.tarifId = t.id
             ORDER BY b.tanggal_booking DESC, b.arrival_time ASC`
        );

        // Hitung Rata-rata (AWT & ATAT)
        const totalWT = rows.reduce((acc, curr) => acc + curr.waiting_time, 0);
        const totalTAT = rows.reduce((acc, curr) => acc + curr.turnaround_time, 0);
        
        const avgWT = rows.length > 0 ? (totalWT / rows.length).toFixed(2) : 0;
        const avgTAT = rows.length > 0 ? (totalTAT / rows.length).toFixed(2) : 0;

        res.json({
            summary: {
                total_bookings: rows.length,
                average_waiting_time: avgWT,
                average_turnaround_time: avgTAT
            },
            data: rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PATCH /api/bookings/admin/approve-data/:id
 * @desc    Admin menyetujui data penyewa (Tahap 1)
 * @access  Private (Admin)
 */
router.patch('/admin/approve-data/:id', [verifyToken, isAdmin], async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Ambil data booking yang sedang diproses
        const [[targetBooking]] = await db.query(
            "SELECT fasilitasId, tarifId, tanggal_booking, nomor_unit, arrival_time FROM tb_booking WHERE id = ?",
            [id]
        );

        if (!targetBooking) {
            return res.status(404).json({ error: "Data booking tidak ditemukan" });
        }

        // 2. STICT FCFS LOCK: Cek apakah ada booking yang lebih awal di UNIT yang sama yang masih PENDING
        const [[olderBooking]] = await db.query(
            `SELECT id FROM tb_booking 
             WHERE fasilitasId = ? AND tarifId = ? AND tanggal_booking = ? AND nomor_unit = ?
             AND arrival_time < ? 
             AND status_booking = 'PENDING'
             LIMIT 1`,
            [targetBooking.fasilitasId, targetBooking.tarifId, targetBooking.tanggal_booking, targetBooking.nomor_unit, targetBooking.arrival_time]
        );

        if (olderBooking) {
            return res.status(423).json({ 
                error: "FCFS LOCK: Anda harus memverifikasi data pesanan yang masuk lebih awal di unit ini terlebih dahulu." 
            });
        }

        const [result] = await db.query(
            "UPDATE tb_booking SET status_booking = 'APPROVED' WHERE id = ? AND status_booking IN ('PENDING', 'WAITING_VERIFICATION')",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "Gagal menyetujui data. Status mungkin sudah berubah." });
        }

        // Ambil ID user untuk notifikasi
        const [[booking]] = await db.query("SELECT userId FROM tb_booking WHERE id = ?", [id]);

        sendNotif(booking.userId, "Data Disetujui", "Data booking Anda telah disetujui. Silakan lakukan pembayaran agar jadwal Anda dikonfirmasi.", "SUCCESS");

        res.json({ message: "Data penyewa berhasil disetujui. Penyewa sekarang dapat melakukan pembayaran." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PATCH /api/bookings/admin/reject-data/:id
 * @desc    Admin menolak pesanan penyewa
 * @access  Private (Admin)
 */
router.patch('/admin/reject-data/:id', [verifyToken, isAdmin], async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query(
            "UPDATE tb_booking SET status_booking = 'CANCELED' WHERE id = ? AND status_booking = 'PENDING'",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Data booking tidak ditemukan atau sudah diproses" });
        }

        // Ambil ID user untuk notifikasi
        const [[booking]] = await db.query("SELECT userId FROM tb_booking WHERE id = ?", [id]);

        sendNotif(booking.userId, "Pesanan Ditolak", "Maaf, pesanan Anda ditolak oleh Admin. Silakan periksa kembali data Anda atau hubungi Admin.", "ERROR");

        res.json({ message: "Pesanan berhasil ditolak." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PATCH /api/bookings/cancel/:id
 * @desc    Penyewa membatalkan pesanan mereka sendiri
 * @access  Private (Penyewa)
 */
router.patch('/cancel/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Cek apakah booking milik user ini dan statusnya memungkinkan untuk dibatalkan
        const [rows] = await db.query(
            "SELECT status_booking FROM tb_booking WHERE id = ? AND userId = ?",
            [id, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Pesanan tidak ditemukan" });
        }

        const booking = rows[0];

        // Jangan izinkan pembatalan jika sudah sah (CONFIRMED)
        if (booking.status_booking === 'CONFIRMED') {
            return res.status(400).json({ error: "Pesanan yang sudah sah tidak dapat dibatalkan" });
        }
        
        if (booking.status_booking === 'CANCELED') {
            return res.status(400).json({ error: "Pesanan memang sudah dibatalkan" });
        }

        await db.query(
            "UPDATE tb_booking SET status_booking = 'CANCELED' WHERE id = ?",
            [id]
        );

        // Notifikasi ke Admin (Opsional, agar admin tahu ada slot yang kosong)
        sendNotif(1, "Pesanan Dibatalkan Penyewa", `Pesanan #${id} telah dibatalkan oleh penyewa.`, "INFO");

        res.json({ message: "Pesanan Anda berhasil dibatalkan." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
