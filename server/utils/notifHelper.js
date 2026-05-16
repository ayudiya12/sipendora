const db = require('../db');

/**
 * Kirim notifikasi ke user tertentu atau semua admin
 * @param {number|null} userId - ID User penerima (null jika untuk semua admin)
 * @param {string} title - Judul notifikasi
 * @param {string} message - Isi pesan
 * @param {string} type - INFO, SUCCESS, WARNING, DANGER
 */
const sendNotif = async (userId, title, message, type = 'INFO') => {
    try {
        if (userId === null) {
            // Jika userId null, kirim ke semua admin
            const [admins] = await db.query("SELECT id FROM tb_user WHERE role = 'ADMIN'");
            
            const values = admins.map(admin => [admin.id, title, message, type]);
            if (values.length > 0) {
                await db.query(
                    "INSERT INTO tb_notifikasi (userId, title, message, type) VALUES ?",
                    [values]
                );
            }
        } else {
            // Kirim ke user spesifik
            await db.query(
                "INSERT INTO tb_notifikasi (userId, title, message, type) VALUES (?, ?, ?, ?)",
                [userId, title, message, type]
            );
        }
        return true;
    } catch (error) {
        console.error("FAILED_TO_SEND_NOTIFICATION:", error);
        return false;
    }
};

module.exports = { sendNotif };
