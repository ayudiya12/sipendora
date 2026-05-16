const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/notifications
 * @desc    Ambil notifikasi milik user
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM tb_notifikasi WHERE userId = ? ORDER BY createdAt DESC LIMIT 50",
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Tandai satu notifikasi sudah dibaca
 */
router.patch('/:id/read', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            "UPDATE tb_notifikasi SET isRead = 1 WHERE id = ? AND userId = ?",
            [id, req.user.id]
        );
        res.json({ message: "Notifikasi ditandai telah dibaca" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Tandai semua notifikasi sudah dibaca
 */
router.patch('/read-all', verifyToken, async (req, res) => {
    try {
        await db.query(
            "UPDATE tb_notifikasi SET isRead = 1 WHERE userId = ?",
            [req.user.id]
        );
        res.json({ message: "Semua notifikasi ditandai telah dibaca" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   DELETE /api/notifications/read
 * @desc    Hapus semua notifikasi yang sudah dibaca
 */
router.delete('/read', verifyToken, async (req, res) => {
    try {
        await db.query(
            "DELETE FROM tb_notifikasi WHERE userId = ? AND isRead = 1",
            [req.user.id]
        );
        res.json({ message: "Notifikasi yang sudah dibaca dihapus" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Hapus satu notifikasi
 */
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            "DELETE FROM tb_notifikasi WHERE id = ? AND userId = ?",
            [id, req.user.id]
        );
        res.json({ message: "Notifikasi dihapus" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
