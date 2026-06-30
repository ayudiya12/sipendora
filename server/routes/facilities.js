const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const { put } = require('@vercel/blob');

// Deteksi environment
const isLocal = !process.env.VERCEL_ENV && !process.env.RAILWAY_ENVIRONMENT_ID;

// Buat folder uploads jika tidak ada (untuk local)
const uploadsDir = path.join(__dirname, '..', 'uploads', 'facilities');
console.log(' [FACILITIES] Upload Directory:', uploadsDir);
if (isLocal && !fs.existsSync(uploadsDir)) {
    console.log(' [FACILITIES] Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(' [FACILITIES] Upload directory created successfully');
}

// Konfigurasi Multer - disk untuk local, memory untuk production
const storage = isLocal
    ? multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => {
            const uniqueName = `facility-${Date.now()}${path.extname(file.originalname)}`;
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
    cb(new Error('Hanya diperbolehkan format .jpg, .jpeg, .png, dan .webp'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Limit 5MB
});

// Route khusus untuk Upload Gambar Fasilitas
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
  }

  try {
    if (isLocal) {
        // Local: simpan path relatif ke file
        const imageUrl = `/uploads/facilities/${req.file.filename}`;
        res.json({ url: imageUrl });
    } else {
        // Production: upload ke Vercel Blob
        const filename = `facilities/facility-${Date.now()}${path.extname(req.file.originalname)}`;
        const blob = await put(filename, req.file.buffer, {
          access: 'public',
        });
        res.json({ url: blob.url });
    }
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengunggah gambar: ' + error.message });
  }
});

// --- PUBLIC ROUTES (No Auth Required) ---

// 1. Ambil list fasilitas untuk Landing Page (Optimized)
router.get('/public', async (req, res) => {
    try {
      const [facilities] = await db.query('SELECT id, nama_fasilitas, jenis_fasilitas, status_fasilitas FROM tb_fasilitas WHERE status_fasilitas = 1 ORDER BY id DESC');
      const [images] = await db.query('SELECT id_fasilitas, url_gambar FROM tb_fasilitas_gambar');
      const [tariffs] = await db.query('SELECT id_fasilitas, harga FROM tb_fasilitas_tarif');
  
      const result = facilities.map(f => {
        const fImages = images.filter(img => img.id_fasilitas === f.id);
        const fPrices = tariffs.filter(t => t.id_fasilitas === f.id).map(t => parseFloat(t.harga));
        
        return {
          id: f.id,
          nama_fasilitas: f.nama_fasilitas,
          jenis_fasilitas: f.jenis_fasilitas,
          image: fImages.length > 0 ? fImages[0].url_gambar : null,
          minPrice: fPrices.length > 0 ? Math.min(...fPrices) : 0
        };
      });
  
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // 2. Ambil detail lengkap satu fasilitas untuk Public
  router.get('/public/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [[facility]] = await db.query('SELECT * FROM tb_fasilitas WHERE id = ?', [id]);
      if (!facility) return res.status(404).json({ error: 'Fasilitas tidak ditemukan' });
  
      const [images] = await db.query('SELECT url_gambar FROM tb_fasilitas_gambar WHERE id_fasilitas = ?', [id]);
      const [items] = await db.query('SELECT * FROM tb_fasilitas_item WHERE id_fasilitas = ?', [id]);
      const [tariffs] = await db.query('SELECT * FROM tb_fasilitas_tarif WHERE id_fasilitas = ? ORDER BY tipe_tarif DESC, jam_mulai ASC', [id]);
  
      res.json({
        ...facility,
        images: images.map(img => img.url_gambar),
        items,
        tariffs
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // 3. Cek ketersediaan sesi untuk satu fasilitas di tanggal tertentu
  router.get('/availability/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { date } = req.query; // Format: YYYY-MM-DD
      
      if (!date) return res.status(400).json({ error: "Tanggal wajib diisi" });

      // 1. Ambil data fisik fasilitas
      const [[facility]] = await db.query('SELECT jumlah_unit FROM tb_fasilitas WHERE id = ?', [id]);
      if (!facility) return res.status(404).json({ error: 'Fasilitas tidak ditemukan' });

      // 2. Ambil semua tarif/sesi
      const [tariffs] = await db.query('SELECT id, nama_tarif, tipe_tarif, jam_mulai, jam_selesai, harga, kapasitas FROM tb_fasilitas_tarif WHERE id_fasilitas = ?', [id]);

      // 3. Ambil detail booking (Hanya hitung APPROVED yang belum lewat 15 menit)
      const [bookings] = await db.query(
        `SELECT tarifId, completion_time FROM tb_booking 
         WHERE fasilitasId = ? AND tanggal_booking = ? 
         AND (
           status_booking IN ("PENDING", "WAITING_VERIFICATION", "CONFIRMED") 
           OR (status_booking = "APPROVED" AND updatedAt > NOW() - INTERVAL 10 MINUTE)
         )`,
        [id, date]
      );

      // 4. Gabungkan data dengan Analisis Antrean (Queue Analysis)
      const hasAnyBooking = bookings.length > 0;
      const [eventBooking] = await db.query(
          `SELECT b.id FROM tb_booking b 
           JOIN tb_fasilitas_tarif t ON b.tarifId = t.id 
           WHERE b.fasilitasId = ? AND b.tanggal_booking = ? 
           AND t.tipe_tarif = 'EVENT' AND b.status_booking IN ("PENDING", "APPROVED", "WAITING_VERIFICATION", "CONFIRMED")`,
          [id, date]
      );
      const isDayTakenByEvent = eventBooking.length > 0;

      const availability = tariffs.map(t => {
        const sessionBookings = bookings.filter(b => b.tarifId === t.id);
        const usedUnits = sessionBookings.length;
        const remainingUnits = facility.jumlah_unit - usedUnits;

        // Default times for EVENT
        const stStr = t.jam_mulai || '08:00:00';
        const enStr = t.jam_selesai || '22:00:00';

        const sessionStart = new Date(`${date} ${stStr}`);
        const sessionEnd = new Date(`${date} ${enStr}`);

        // Logika Ketersediaan Khusus EVENT vs SESI
        let isAvailable = true;
        let reason = "";

        // VALIDASI WAKTU (Minimal 2 Jam Sebelum Sesi Berakhir)
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        if (date === todayStr) {
            // Hitung sisa waktu dalam menit
            const diffMs = sessionEnd - now;
            const diffMins = Math.floor(diffMs / (1000 * 60));

            // Jika sisa waktu kurang dari 120 menit (2 jam), maka tutup
            if (diffMins < 120) {
                isAvailable = false;
                reason = t.tipe_tarif === 'EVENT' 
                    ? "Silakan pilih tanggal lain" 
                    : "Sesi Segera Berakhir. Pilih sesi lain agar bermain lebih maksimal.";
            }
        }

        if (isAvailable) {
            if (t.tipe_tarif === 'EVENT') {
                if (hasAnyBooking) {
                    isAvailable = false;
                    reason = "Gedung telah dibooking oleh sesi lain";
                }
            } else {
                if (isDayTakenByEvent) {
                    isAvailable = false;
                    reason = "Gedung telah dibooking untuk Event";
                }
            }
        }

        // Cari Waktu Selesai Terakhir (Queue Analysis)
        let lastCT = null;
        let estimatedNextStart = sessionStart;

        if (usedUnits > 0) {
            const sortedCTs = sessionBookings.map(b => new Date(b.completion_time)).sort((a,b) => a - b);
            lastCT = sortedCTs[sortedCTs.length - 1]; 

            if (usedUnits >= facility.jumlah_unit) {
                estimatedNextStart = sortedCTs[0]; 
            }
        }

        // Final check for availability based on units
        if (isAvailable && estimatedNextStart >= sessionEnd) {
            isAvailable = false;
            reason = "Sesi Penuh";
        }

        const occupiedUnits = sessionBookings.map(b => b.nomor_unit);
        const units = [];
        for (let i = 1; i <= facility.jumlah_unit; i++) {
            units.push({
                nomor_unit: i,
                isAvailable: isAvailable && !occupiedUnits.includes(i)
            });
        }

        return {
          ...t,
          jam_mulai: stStr,
          jam_selesai: enStr,
          usedUnits,
          totalUnits: facility.jumlah_unit,
          isAvailable,
          reason,
          remainingUnits: remainingUnits < 0 ? 0 : remainingUnits,
          units,
          queueInfo: {
            current_queue: usedUnits,
            last_completion: lastCT,
            estimated_next_start: estimatedNextStart
          }
        };
      });

      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- PRIVATE/ADMIN ROUTES ---
  
  // 1. Ambil SEMUA data fasilitas (Lengkap untuk Admin)
  router.get('/', [verifyToken, isAdmin], async (req, res) => {
    try {
      const [facilities] = await db.query('SELECT * FROM tb_fasilitas ORDER BY id DESC');
      const [images] = await db.query('SELECT id_fasilitas, url_gambar FROM tb_fasilitas_gambar');
      const [items] = await db.query('SELECT id_fasilitas, nama_item, status_item FROM tb_fasilitas_item');
      const [tariffs] = await db.query('SELECT * FROM tb_fasilitas_tarif');

      const result = facilities.map(f => {
        return {
          ...f,
          images: images.filter(img => img.id_fasilitas === f.id).map(img => img.url_gambar),
          items: items.filter(it => it.id_fasilitas === f.id),
          tariffs: tariffs.filter(t => t.id_fasilitas === f.id)
        };
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// 2. Tambah fasilitas baru (Kapasitas sekarang ada di level Tarif)
router.post('/', [verifyToken, isAdmin], async (req, res) => {
  const { nama_fasilitas, jenis_fasilitas, jumlah_unit, images, items, tariffs } = req.body;
  
  if (!nama_fasilitas || !jenis_fasilitas) {
    return res.status(400).json({ error: "Data fisik tidak lengkap" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insert Data Fisik (Kapasitas sudah dihapus dari sini)
    const [result] = await conn.query(
      'INSERT INTO tb_fasilitas (nama_fasilitas, jenis_fasilitas, jumlah_unit) VALUES (?, ?, ?)', 
      [nama_fasilitas, jenis_fasilitas, jumlah_unit || 1]
    );
    const id_fasilitas = result.insertId;

    // 2. Insert Gambar
    if (images && images.length > 0) {
      const imgValues = images.map(url => [id_fasilitas, url]);
      await conn.query('INSERT INTO tb_fasilitas_gambar (id_fasilitas, url_gambar) VALUES ?', [imgValues]);
    }

    // 3. Insert Item
    if (items && items.length > 0) {
      const itemValues = items.map(it => [id_fasilitas, it.nama_item, it.status_item || 'Tersedia']);
      await conn.query('INSERT INTO tb_fasilitas_item (id_fasilitas, nama_item, status_item) VALUES ?', [itemValues]);
    }

    // 4. Insert Tarif & Kapasitas Spesifik
    if (tariffs && tariffs.length > 0) {
        const tarifValues = tariffs.map(t => [
            id_fasilitas, t.tipe_tarif, t.nama_tarif, 
            t.jam_mulai || null, t.jam_selesai || null, 
            t.harga, t.kapasitas || 0
        ]);
        await conn.query(
            'INSERT INTO tb_fasilitas_tarif (id_fasilitas, tipe_tarif, nama_tarif, jam_mulai, jam_selesai, harga, kapasitas) VALUES ?', 
            [tarifValues]
        );
    }

    await conn.commit();
    res.status(201).json({ message: "Berhasil menambahkan fasilitas", id: id_fasilitas });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// 3. Update fasilitas (PUT)
router.put('/:id', [verifyToken, isAdmin], async (req, res) => {
  const { id } = req.params;
  const { nama_fasilitas, jenis_fasilitas, jumlah_unit, status_fasilitas, images, items, tariffs } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Update Data Fisik
    await conn.query(
      'UPDATE tb_fasilitas SET nama_fasilitas=?, jenis_fasilitas=?, jumlah_unit=?, status_fasilitas=? WHERE id=?',
      [nama_fasilitas, jenis_fasilitas, jumlah_unit || 1, status_fasilitas, id]
    );

    // 2. Sync Gambar
    await conn.query('DELETE FROM tb_fasilitas_gambar WHERE id_fasilitas = ?', [id]);
    if (images && images.length > 0) {
      const imgValues = images.map(url => [id, url]);
      await conn.query('INSERT INTO tb_fasilitas_gambar (id_fasilitas, url_gambar) VALUES ?', [imgValues]);
    }

    // 3. Sync Item
    await conn.query('DELETE FROM tb_fasilitas_item WHERE id_fasilitas = ?', [id]);
    if (items && items.length > 0) {
      const itemValues = items.map(it => [id, it.nama_item, it.status_item || 'Tersedia']);
      await conn.query('INSERT INTO tb_fasilitas_item (id_fasilitas, nama_item, status_item) VALUES ?', [itemValues]);
    }

    // 4. Sync Tarif & Kapasitas (Safely)
    // 4.1 Hapus tarif yang tidak ada di array baru
    const newTariffIds = tariffs.filter(t => t.id).map(t => t.id);
    if (newTariffIds.length > 0) {
        await conn.query(
            'DELETE FROM tb_fasilitas_tarif WHERE id_fasilitas = ? AND id NOT IN (?)',
            [id, newTariffIds]
        );
    } else {
        // Jika tidak ada tarif sama sekali, hapus semua tarif fasilitas ini
        await conn.query('DELETE FROM tb_fasilitas_tarif WHERE id_fasilitas = ?', [id]);
    }
    
    // 4.2 Update/Insert tarif yang ada di array
    if (tariffs && tariffs.length > 0) {
        for (const t of tariffs) {
            if (t.id) {
                // Jika ada ID, update saja
                await conn.query(
                    'UPDATE tb_fasilitas_tarif SET tipe_tarif=?, nama_tarif=?, jam_mulai=?, jam_selesai=?, harga=?, kapasitas=? WHERE id=?',
                    [t.tipe_tarif, t.nama_tarif, t.jam_mulai || null, t.jam_selesai || null, t.harga, t.kapasitas || 0, t.id]
                );
            } else {
                // Jika tidak ada ID, baru insert
                await conn.query(
                    'INSERT INTO tb_fasilitas_tarif (id_fasilitas, tipe_tarif, nama_tarif, jam_mulai, jam_selesai, harga, kapasitas) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [id, t.tipe_tarif, t.nama_tarif, t.jam_mulai || null, t.jam_selesai || null, t.harga, t.kapasitas || 0]
                );
            }
        }
    }

    await conn.commit();
    res.json({ message: "Data fasilitas & tarif berhasil diperbarui" });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// 4. Hapus fasilitas (DELETE)
router.delete('/:id', [verifyToken, isAdmin], async (req, res) => {
  try {
    await db.query('DELETE FROM tb_fasilitas WHERE id = ?', [req.params.id]);
    res.json({ message: "Fasilitas berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;