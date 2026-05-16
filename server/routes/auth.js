const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// --- REGISTER ---
router.post('/register', async (req, res) => {
  const { fullName, email, phone, password, alamat } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default status_akun di database adalah 0 (Pending/False)
    await db.query(
      'INSERT INTO tb_user (nama, email, no_telp, alamat, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, phone, alamat, hashedPassword, 'penyewa']
    );

    res.status(201).json({ 
      message: "Registrasi berhasil. Akun Anda sedang menunggu verifikasi dari Admin." 
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
        status_akun: user.status_akun // Kirim status akun ke frontend
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GET CURRENT USER (ME) ---
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nama, email, no_telp, alamat, role, status_akun FROM tb_user WHERE id = ?', [req.user.id]);
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
router.put('/profile', verifyToken, async (req, res) => {
  const { nama, email, no_telp, alamat } = req.body;
  const userId = req.user.id;

  try {
    // Cek email duplikat (kecuali email sendiri)
    const [existing] = await db.query("SELECT id FROM tb_user WHERE email = ? AND id != ?", [email, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email sudah digunakan user lain' });
    }

    await db.query(
      "UPDATE tb_user SET nama = ?, email = ?, no_telp = ?, alamat = ? WHERE id = ?",
      [nama, email, no_telp, alamat, userId]
    );

    // Ambil data user yang sudah diupdate
    const [updated] = await db.query(
      "SELECT id, nama, email, no_telp, alamat, role, status_akun FROM tb_user WHERE id = ?",
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