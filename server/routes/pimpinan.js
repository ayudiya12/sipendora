const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isPimpinan } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/pimpinan/dashboard-stats
 * @desc    Ambil statistik ringkasan untuk Dashboard Pimpinan (Pendapatan, Reservasi, Fasilitas Teratas)
 */
router.get('/dashboard-stats', verifyToken, isPimpinan, async (req, res) => {
    try {
        const { period } = req.query; // 'month' or 'year'
        
        let dateFilter = "MONTH(b.tanggal_booking) = MONTH(CURRENT_DATE()) AND YEAR(b.tanggal_booking) = YEAR(CURRENT_DATE())";
        if (period === 'year') {
            dateFilter = "YEAR(b.tanggal_booking) = YEAR(CURRENT_DATE())";
        }

        // 1. Total Revenue (Hanya yang CONFIRMED) untuk periode terpilih
        const [[{ revenue }]] = await db.query(`
            SELECT IFNULL(SUM(total_biaya), 0) as revenue 
            FROM tb_booking b
            WHERE status_booking = 'CONFIRMED' AND ${dateFilter}
        `);

        // 2. Total Bookings (CONFIRMED) untuk periode terpilih
        const [[{ totalBookings }]] = await db.query(`
            SELECT COUNT(*) as totalBookings 
            FROM tb_booking b
            WHERE status_booking = 'CONFIRMED' AND ${dateFilter}
        `);

        // 3. Top Facility (Paling banyak disewa di periode terpilih)
        const [topFacilities] = await db.query(`
            SELECT f.nama_fasilitas, COUNT(b.id) as total_sewa
            FROM tb_booking b
            JOIN tb_fasilitas f ON b.fasilitasId = f.id
            WHERE b.status_booking = 'CONFIRMED' AND ${dateFilter}
            GROUP BY f.id
            ORDER BY total_sewa DESC
            LIMIT 1
        `);
        const topFacility = topFacilities.length > 0 ? topFacilities[0].nama_fasilitas : 'Belum Ada Data';

        // 4. Data untuk Grafik Donut (Proporsi Booking per Fasilitas)
        const [facilityDistribution] = await db.query(`
            SELECT f.nama_fasilitas as name, COUNT(b.id) as value
            FROM tb_booking b
            JOIN tb_fasilitas f ON b.fasilitasId = f.id
            WHERE b.status_booking = 'CONFIRMED' AND ${dateFilter}
            GROUP BY f.id
        `);

        res.json({
            revenue: parseInt(revenue),
            totalBookings,
            topFacility,
            facilityDistribution
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/pimpinan/chart-data
 * @desc    Ambil data chart pendapatan bulanan dalam 1 tahun berjalan
 */
router.get('/chart-data', verifyToken, isPimpinan, async (req, res) => {
    try {
        const { year } = req.query; // Default to current year if not provided
        const selectedYear = year || new Date().getFullYear();

        const [monthlyData] = await db.query(`
            SELECT MONTH(tanggal_booking) as month, SUM(total_biaya) as revenue
            FROM tb_booking
            WHERE status_booking = 'CONFIRMED' AND YEAR(tanggal_booking) = ?
            GROUP BY MONTH(tanggal_booking)
            ORDER BY month ASC
        `, [selectedYear]);

        // Format to array of 12 months (Jan-Dec)
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        const formattedData = months.map((m, index) => {
            const found = monthlyData.find(d => d.month === index + 1);
            return {
                name: m,
                revenue: found ? parseInt(found.revenue) : 0
            };
        });

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/pimpinan/laporan
 * @desc    Ambil rekap detail pendapatan untuk halaman ekspor/laporan
 */
router.get('/laporan', verifyToken, isPimpinan, async (req, res) => {
    try {
        const { period, startMonth, endMonth } = req.query; // 'month', 'year', 'all', or custom month range
        
        let dateFilter = "1=1"; // default all
        const queryParams = [];

        if (period === 'month') {
            dateFilter = "MONTH(b.tanggal_booking) = MONTH(CURRENT_DATE()) AND YEAR(b.tanggal_booking) = YEAR(CURRENT_DATE())";
        } else if (period === 'year') {
            dateFilter = "YEAR(b.tanggal_booking) = YEAR(CURRENT_DATE())";
        } else if (startMonth && endMonth) {
            const startDate = `${startMonth}-01`;
            const endDateObj = new Date(`${endMonth}-01`);
            endDateObj.setMonth(endDateObj.getMonth() + 1);
            endDateObj.setDate(endDateObj.getDate() - 1);
            const endDate = endDateObj.toISOString().split('T')[0];

            dateFilter = "b.tanggal_booking BETWEEN ? AND ?";
            queryParams.push(startDate, endDate);
        }

        const [rows] = await db.query(`
            SELECT 
                b.id, b.tanggal_booking, b.total_biaya, b.updatedAt as tanggal_selesai,
                f.nama_fasilitas, t.nama_tarif,
                u.nama as penyewa
            FROM tb_booking b
            JOIN tb_fasilitas f ON b.fasilitasId = f.id
            JOIN tb_fasilitas_tarif t ON b.tarifId = t.id
            JOIN tb_user u ON b.userId = u.id
            WHERE b.status_booking = 'CONFIRMED' AND ${dateFilter}
            ORDER BY b.tanggal_booking DESC
        `, queryParams);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
