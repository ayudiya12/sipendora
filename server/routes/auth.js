const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');
const { sendNotif } = require('../utils/notifHelper');
const { put } = require('@vercel/blob');

// Deteksi environment
const isLocal = !process.env.VERCEL_ENV && !process.env.RAILWAY_ENVIRONMENT_ID;

// Buat folder uploads jika tidak ada
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (isLocal && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurasi Multer
const storage = isLocal 
    ? multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => {
            const uniqueName = `profile-${Date.now()}${path.extname(file.originalname)}`;
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

// --- REGISTER ---
router.post('/register', upload.single('profilePhoto'), async (req, res) => {
  const { fullName, email, phone, password, alamat, nik } = req.body;
  let foto_profil = null;

  try {
    // Handle file upload
    if (req.file) {
      if (isLocal) {
        foto_profil = `/uploads/profiles/${req.file.filename}`;
      } else {
        const filename = `profiles/profile-${Date.now()}${path.extname(req.file.originalname)}`;
        const blob = await put(filename, req.file.buffer, { access: 'public' });
        foto_profil = blob.url;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default status_akun di database adalah 0 (Pending/False)
    const [result] = await db.query(
      'INSERT INTO tb_user (nama, email, no_telp, alamat, password, role, nik, foto_profil) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [fullName, email, phone, alamat, hashedPassword, 'penyewa', nik, foto_profil]
    );

    await sendNotif(
      null,
      "Pendaftaran User Baru",
      `${fullName} telah mendaftar sebagai penyewa. Silakan verifikasi akun.`,
      "INFO"
    );

    // Auto-login setelah register
    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, role: 'penyewa', nama: fullName },
      process.env.JWT_SECRET || 'meongmeong',
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      message: "Registrasi berhasil. Akun Anda sedang menunggu verifikasi dari Admin.",
      token,
      user: {
        id: userId,
        nama: fullName,
        email,
        role: 'penyewa',
        status_akun: 0,
        foto_profil
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM tb_user WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password salah" });

    const token = jwt.sign(
      { id: user.id, role: user.role, nama: user.nama },
      process.env.JWT_SECRET || 'meongmeong',
      { expiresIn: '1d' }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: { 
        id: user.id, 
        nama: user.nama, 
        role: user.role,
        status_akun: user.status_akun,
        foto_profil: user.foto_profil
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GET CURRENT USER (ME) ---
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nama, email, no_telp, alamat, role, status_akun, nik, foto_profil FROM tb_user WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GET ADMIN CONTACT (PUBLIC) ---
router.get('/admin-contact', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT nama, no_telp FROM tb_user WHERE role = 'ADMIN' LIMIT 1");
    if (rows.length === 0) return res.json({ nama: "Admin Dispora", no_telp: "-" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- UPDATE PROFILE ---
router.put('/profile', verifyToken, upload.single('profilePhoto'), async (req, res) => {
  const { nama, email, no_telp, alamat, nik, foto_profil } = req.body;
  const userId = req.user.id;
  let newFotoProfil = foto_profil;

  try {
    if (req.file) {
      if (isLocal) {
        newFotoProfil = `/uploads/profiles/${req.file.filename}`;
      } else {
        const filename = `profiles/profile-${Date.now()}${path.extname(req.file.originalname)}`;
        const blob = await put(filename, req.file.buffer, { access: 'public' });
        newFotoProfil = blob.url;
      }
    }

    const [existing] = await db.query("SELECT id FROM tb_user WHERE email = ? AND id != ?", [email, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email sudah digunakan user lain' });
    }

    await db.query(
      "UPDATE tb_user SET nama = ?, email = ?, no_telp = ?, alamat = ?, nik = ?, foto_profil = ? WHERE id = ?",
      [nama, email, no_telp, alamat, nik, newFotoProfil, userId]
    );

    const [updated] = await db.query(
      "SELECT id, nama, email, no_telp, alamat, role, status_akun, nik, foto_profil FROM tb_user WHERE id = ?",
      [userId]
    );

    res.json({ message: "Profil berhasil diperbarui", user: updated[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
});

// --- CHANGE PASSWORD ---
router.put('/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Ambil password lama dari database
    const [rows] = await db.query("SELECT password FROM tb_user WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Verifikasi password lama
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password saat ini salah' });
    }

    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query("UPDATE tb_user SET password = ? WHERE id = ?", [hashedPassword, userId]);

    res.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Gagal mengubah password' });
  }
});

module.exports = router;