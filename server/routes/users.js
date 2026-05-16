const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Terapkan proteksi Admin ke semua rute di file ini
router.use(verifyToken, isAdmin);

// 1. GET ALL USERS
router.get('/', async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, nama, email, no_telp, alamat, role, status_akun, createdAt FROM tb_user ORDER BY createdAt DESC"
        );
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Gagal mengambil data pengguna' });
    }
});

// 2. CREATE NEW USER (ADMIN ACTION)
router.post('/', async (req, res) => {
    const { nama, email, password, no_telp, alamat, role } = req.body;
    try {
        // Cek email duplikat
        const [existing] = await db.query("SELECT id FROM tb_user WHERE email = ?", [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email sudah terdaftar' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = "INSERT INTO tb_user (nama, email, password, no_telp, alamat, role) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await db.query(query, [nama, email, hashedPassword, no_telp, alamat, role || 'PENYEWA']);
        
        res.status(201).json({ message: "Pengguna berhasil ditambahkan", id: result.insertId });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Gagal menambahkan pengguna' });
    }
});

// 3. UPDATE USER INFO
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nama, email, no_telp, alamat, role } = req.body;
    try {
        const query = "UPDATE tb_user SET nama = ?, email = ?, no_telp = ?, alamat = ?, role = ? WHERE id = ?";
        await db.query(query, [nama, email, no_telp, alamat, role, id]);
        res.json({ message: "Data pengguna berhasil diperbarui" });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Gagal memperbarui data pengguna' });
    }
});

// 4. TOGGLE STATUS AKUN
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status_akun } = req.body;
    try {
        await db.query("UPDATE tb_user SET status_akun = ? WHERE id = ?", [status_akun, id]);
        res.json({ message: "Status akun berhasil diperbarui" });
    } catch (err) {
        console.error('Error toggling status:', err);
        res.status(500).json({ error: 'Gagal memperbarui status akun' });
    }
});

// 5. DELETE USER
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Cek apakah user memiliki data booking (mencegah error foreign key)
        const [bookings] = await db.query("SELECT id FROM tb_booking WHERE userId = ?", [id]);
        if (bookings.length > 0) {
            return res.status(400).json({ error: 'Tidak dapat menghapus user yang sudah memiliki riwayat booking. Nonaktifkan saja akunnya.' });
        }

        await db.query("DELETE FROM tb_user WHERE id = ?", [id]);
        res.json({ message: "Pengguna berhasil dihapus" });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Gagal menghapus pengguna' });
    }
});

module.exports = router;
