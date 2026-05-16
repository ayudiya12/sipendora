const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { put } = require('@vercel/blob');

// Deteksi environment
const isLocal = !process.env.VERCEL_ENV && !process.env.RAILWAY_ENVIRONMENT_ID;

// Buat folder uploads jika tidak ada (untuk local)
const uploadsDir = path.join(__dirname, '..', 'uploads', 'qris');
console.log(' [SETTINGS] Upload Directory:', uploadsDir);
if (isLocal && !fs.existsSync(uploadsDir)) {
    console.log(' [SETTINGS] Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(' [SETTINGS] Upload directory created successfully');
}

// Konfigurasi Multer - disk untuk local, memory untuk production
const storage = isLocal
    ? multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => {
            const uniqueName = `qris-${Date.now()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    })
    : multer.memoryStorage();

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan!"));
        }
    }
});

/**
 * @route   GET /api/settings/rekening
 * @desc    Ambil daftar rekening yang aktif (Untuk Penyewa)
 * @access  Public / Token
 */
router.get('/rekening', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM tb_rekening WHERE is_active = TRUE ORDER BY id ASC"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/settings/admin/rekening
 * @desc    Ambil SEMUA daftar rekening (Untuk Admin)
 * @access  Private (Admin)
 */
router.get('/admin/rekening', [verifyToken, isAdmin], async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM tb_rekening ORDER BY id ASC"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/settings/admin/rekening
 * @desc    Tambah rekening baru
 * @access  Private (Admin)
 */
router.post('/admin/rekening', [verifyToken, isAdmin, upload.single('qris_image')], async (req, res) => {
    let { nama_bank, nomor_rekening, atas_nama, is_qris } = req.body;
    
    // Konversi is_qris dari string 'true'/'false' ke boolean (FormData mengirim string)
    const isQrisBool = is_qris === 'true' || is_qris === true;

    if (!nama_bank || !atas_nama) {
        return res.status(400).json({ error: "Nama bank dan atas nama wajib diisi" });
    }

    if (!isQrisBool && !nomor_rekening) {
        return res.status(400).json({ error: "Nomor rekening wajib diisi untuk selain QRIS" });
    }

    try {
        let qrisImagePath = null;
        if (req.file) {
            if (isLocal) {
                // Local: simpan path relatif ke file
                qrisImagePath = `/uploads/qris/${req.file.filename}`;
            } else {
                // Production: upload ke Vercel Blob
                const filename = `qris/qris-${Date.now()}${path.extname(req.file.originalname)}`;
                const blob = await put(filename, req.file.buffer, { access: 'public' });
                qrisImagePath = blob.url;
            }
        }

        const [result] = await db.query(
            "INSERT INTO tb_rekening (nama_bank, nomor_rekening, atas_nama, is_qris, qris_image_path, is_active) VALUES (?, ?, ?, ?, ?, TRUE)",
            [nama_bank, nomor_rekening || null, atas_nama, isQrisBool, qrisImagePath]
        );
        
        res.status(201).json({ message: "Rekening berhasil ditambahkan", id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PUT /api/settings/admin/rekening/:id
 * @desc    Ubah status aktif rekening atau data rekening
 * @access  Private (Admin)
 */
router.put('/admin/rekening/:id', [verifyToken, isAdmin, upload.single('qris_image')], async (req, res) => {
    const { id } = req.params;
    let { nama_bank, nomor_rekening, atas_nama, is_qris, is_active } = req.body;
    
    // Parse booleans dari string
    const isQrisBool = is_qris === 'true' || is_qris === true;
    const isActiveBool = is_active === 'true' || is_active === true;

    try {
        let qrisImagePath = null;
        if (req.file) {
            if (isLocal) {
                // Local: simpan path relatif ke file
                qrisImagePath = `/uploads/qris/${req.file.filename}`;
            } else {
                // Production: upload ke Vercel Blob
                const filename = `qris/qris-${Date.now()}${path.extname(req.file.originalname)}`;
                const blob = await put(filename, req.file.buffer, { access: 'public' });
                qrisImagePath = blob.url;
            }
            
            await db.query(
                "UPDATE tb_rekening SET nama_bank = ?, nomor_rekening = ?, atas_nama = ?, is_qris = ?, is_active = ?, qris_image_path = ? WHERE id = ?",
                [nama_bank, nomor_rekening || null, atas_nama, isQrisBool, isActiveBool, qrisImagePath, id]
            );
        } else {
            // Update tanpa mengubah gambar
            await db.query(
                "UPDATE tb_rekening SET nama_bank = ?, nomor_rekening = ?, atas_nama = ?, is_qris = ?, is_active = ? WHERE id = ?",
                [nama_bank, nomor_rekening || null, atas_nama, isQrisBool, isActiveBool, id]
            );
        }
        
        res.json({ message: "Rekening berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   DELETE /api/settings/admin/rekening/:id
 * @desc    Hapus rekening
 * @access  Private (Admin)
 */
router.delete('/admin/rekening/:id', [verifyToken, isAdmin], async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM tb_rekening WHERE id = ?", [id]);
        res.json({ message: "Rekening berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
