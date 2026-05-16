const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { sendNotif } = require('../utils/notifHelper');

const { put } = require('@vercel/blob');

// Deteksi environment
const isLocal = !process.env.VERCEL_ENV && !process.env.RAILWAY_ENVIRONMENT_ID;
console.log('🔧 [PAYMENTS] Environment Detection:', {
    isLocal,
    VERCEL_ENV: process.env.VERCEL_ENV,
    RAILWAY_ENVIRONMENT_ID: process.env.RAILWAY_ENVIRONMENT_ID,
    NODE_ENV: process.env.NODE_ENV
});

// Buat folder uploads jika tidak ada (untuk local)
const uploadsDir = path.join(__dirname, '..', 'uploads', 'payments');
console.log('🔧 [PAYMENTS] Upload Directory:', uploadsDir);
if (isLocal && !fs.existsSync(uploadsDir)) {
    console.log('🔧 [PAYMENTS] Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('🔧 [PAYMENTS] Upload directory created successfully');
}

// Konfigurasi Multer - disk untuk local, memory untuk production
const storage = isLocal 
    ? multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => {
            const uniqueName = `proof-${Date.now()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    })
    : multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Hanya diperbolehkan format gambar (.jpg, .png, .webp)'));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Multer error handler
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('🔧 [PAYMENTS] Multer Error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Ukuran file terlalu besar (maksimal 5MB)' });
        }
        return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
        console.error('🔧 [PAYMENTS] Upload Error:', err);
        return res.status(400).json({ error: err.message });
    }
    next();
};

/**
 * @route   POST /api/payments/upload
 * @desc    Unggah bukti pembayaran untuk sebuah booking
 * @access  Private (Penyewa)
 */
router.post('/upload', [verifyToken, upload.single('image'), handleMulterError], async (req, res) => {
    const { bookingId, metode_pembayaran } = req.body;
    const userId = req.user.id;

    console.log('🔧 [PAYMENTS] Upload request received:', { bookingId, metode_pembayaran, userId });
    console.log('🔧 [PAYMENTS] File info:', req.file);
    console.log('🔧 [PAYMENTS] Body:', req.body);

    try {
        // 1. Pastikan booking ada dan milik user tersebut
        const [[booking]] = await db.query(
            'SELECT id FROM tb_booking WHERE id = ? AND userId = ?', 
            [bookingId, userId]
        );

        if (!booking) {
            return res.status(404).json({ error: 'Data booking tidak ditemukan atau bukan milik Anda' });
        }

        let imageUrl = null;
        if (req.file) {
            console.log('🔧 [PAYMENTS] File received:', req.file);
            console.log('🔧 [PAYMENTS] File path:', req.file.path);
            if (isLocal) {
                // Local: simpan path relatif ke file
                imageUrl = `/uploads/payments/${req.file.filename}`;
                console.log('🔧 [PAYMENTS] Local storage path:', imageUrl);
                console.log('🔧 [PAYMENTS] Full file path:', req.file.path);
                // Cek apakah file benar-benar ada
                if (fs.existsSync(req.file.path)) {
                    console.log('🔧 [PAYMENTS] File exists on disk ✅');
                } else {
                    console.log('🔧 [PAYMENTS] File NOT found on disk ❌');
                }
            } else {
                // Production: upload ke Vercel Blob
                const filename = `payments/proof-${Date.now()}${path.extname(req.file.originalname)}`;
                console.log('🔧 [PAYMENTS] Uploading to Vercel Blob:', filename);
                const blob = await put(filename, req.file.buffer, { access: 'public' });
                imageUrl = blob.url;
                console.log('🔧 [PAYMENTS] Vercel Blob URL:', imageUrl);
            }
        } else {
            console.log('🔧 [PAYMENTS] No file received in req.file ❌');
        }

        // 2. Simpan atau Update data pembayaran
        await db.query(
            `INSERT INTO tb_pembayaran (bookingId, metode_pembayaran, bukti_pembayaran, status_verifikasi, updatedAt)
             VALUES (?, ?, ?, 0, NOW())
             ON DUPLICATE KEY UPDATE 
                metode_pembayaran = VALUES(metode_pembayaran),
                bukti_pembayaran = VALUES(bukti_pembayaran),
                status_verifikasi = 0,
                updatedAt = NOW()`,
            [bookingId, metode_pembayaran || 'TRANSFER', imageUrl]
        );

        // 3. Update status booking menjadi WAITING_VERIFICATION
        await db.query(
            "UPDATE tb_booking SET status_booking = 'WAITING_VERIFICATION' WHERE id = ?",
            [bookingId]
        );

        // Kirim Notifikasi ke Admin
        sendNotif(null, "Bukti Pembayaran Baru", `${req.user.nama} telah mengunggah bukti pembayaran untuk Booking #${bookingId}`, "WARNING");

        res.json({ 
            message: 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.',
            url: imageUrl 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PATCH /api/payments/verify/:bookingId
 * @desc    Verifikasi pembayaran oleh Admin
 * @access  Private (Admin)
 */
router.patch('/verify/:bookingId', [verifyToken, isAdmin], async (req, res) => {
    const { bookingId } = req.params;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Dapatkan info booking & user
        const [[target]] = await conn.query(
            "SELECT fasilitasId, tarifId, tanggal_booking, nomor_unit, arrival_time, userId FROM tb_booking WHERE id = ?",
            [bookingId]
        );

        if (!target) throw new Error('Data booking tidak ditemukan');

        // 2. STRICT FCFS LOCK: Cek apakah ada booking yang lebih awal yang belum SELESAI/BATAL
        const [[older]] = await conn.query(
            `SELECT id FROM tb_booking 
             WHERE fasilitasId = ? AND tarifId = ? AND tanggal_booking = ? AND nomor_unit = ?
             AND arrival_time < ? 
             AND status_booking NOT IN ('CONFIRMED', 'CANCELED')
             LIMIT 1`,
            [target.fasilitasId, target.tarifId, target.tanggal_booking, target.nomor_unit, target.arrival_time]
        );

        if (older) {
            throw new Error(`FCFS LOCK: Anda harus mengonfirmasi pesanan yang masuk lebih awal di unit ini terlebih dahulu (ID #${older.id}).`);
        }

        const userId = target.userId;

        // 2. Update status verifikasi di tb_pembayaran
        const [payResult] = await conn.query(
            'UPDATE tb_pembayaran SET status_verifikasi = 1, updatedAt = NOW() WHERE bookingId = ?',
            [bookingId]
        );

        if (payResult.affectedRows === 0) {
            throw new Error('Data pembayaran tidak ditemukan');
        }

        // 3. Update status_booking di tb_booking
        await conn.query(
            "UPDATE tb_booking SET status_booking = 'CONFIRMED', updatedAt = NOW() WHERE id = ?",
            [bookingId]
        );

        await conn.commit();

        // Kirim Notifikasi ke Penyewa (User)
        sendNotif(userId, "Pembayaran Terverifikasi", `Booking #${bookingId} Anda telah dikonfirmasi oleh Admin. Silakan cek detail unit Anda.`, "SUCCESS");

        res.json({ message: 'Pembayaran berhasil diverifikasi & Booking dikonfirmasi' });

    } catch (error) {
        await conn.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
});

/**
 * @route   PATCH /api/payments/reject/:bookingId
 * @desc    Tolak pembayaran oleh Admin
 * @access  Private (Admin)
 */
router.patch('/reject/:bookingId', [verifyToken, isAdmin], async (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body; // Alasan penolakan
    
    try {
        // 1. Dapatkan userId untuk notifikasi
        const [[booking]] = await db.query("SELECT userId FROM tb_booking WHERE id = ?", [bookingId]);
        if (!booking) return res.status(404).json({ error: 'Data booking tidak ditemukan' });

        // 2. Update status_verifikasi menjadi 2 (Rejected)
        await db.query(
            "UPDATE tb_pembayaran SET status_verifikasi = 2, updatedAt = NOW() WHERE bookingId = ?",
            [bookingId]
        );

        // Kirim Notifikasi ke Penyewa (User)
        const msg = reason 
            ? `Bukti pembayaran Booking #${bookingId} ditolak. Alasan: ${reason}. Silakan unggah ulang.`
            : `Bukti pembayaran Booking #${bookingId} ditolak. Silakan periksa kembali dan unggah ulang bukti yang valid.`;
        
        sendNotif(booking.userId, "Pembayaran Ditolak", msg, "DANGER");

        res.json({ message: 'Pembayaran ditolak. Notifikasi telah dikirim ke penyewa.' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
