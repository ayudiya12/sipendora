/**
 * SIPENDORA — Node.js Seeder (Multi-Facility & DSS Demo Version)
 * Jalankan: node seeder.js
 *
 * Logika distribusi status (realistis berbasis FCFS auto-cancel):
 *   - Booking LAMA (> 3 hari lalu): hanya CONFIRMED atau CANCELED
 *     → booking yg tidak dibayar sudah otomatis ter-cancel oleh sistem
 *   - Booking BARU (kemarin s.d lusa): semua status bisa aktif
 *     → masih dalam window pembayaran / proses verifikasi admin
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker/locale/id_ID');
const { calculateFCFSMetrics } = require('../utils/fcfsHelper');
const { put } = require('@vercel/blob');

// Deteksi environment (sama persis dengan payments.js)
const isLocal = !process.env.VERCEL_ENV && !process.env.RAILWAY_ENVIRONMENT_ID;

const SALT_ROUNDS = 10;
const SEEDER_PASSWORD = 'sipendora123';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'roots',
    database: process.env.DB_NAME || 'sipendora',
    multipleStatements: true,
};

function log(section, msg) {
    console.log(`\n[${section}] ${msg}`);
}

async function replaceInto(conn, table, rows) {
    if (!rows.length) return;
    for (const row of rows) {
        const keys = Object.keys(row);
        const cols = keys.map(k => `\`${k}\``).join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const updates = keys.map(k => `\`${k}\` = VALUES(\`${k}\`)`).join(', ');
        const sql = `INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`;
        await conn.execute(sql, Object.values(row));
    }
}

// ── Helper: weighted random picker ──────────────────────────────────────────
function getWeightedStatus(weights) {
    let sum = 0;
    const r = Math.random() * 100;
    for (const { status, weight } of weights) {
        sum += weight;
        if (r <= sum) return status;
    }
    return weights[weights.length - 1].status;
}

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Status weights per era ───────────────────────────────────────────────────
//
// LAMA (> 3 hari lalu): booking yg tidak dibayar sudah di-cancel otomatis FCFS
//   → tidak ada PENDING / APPROVED / WAITING_VERIFICATION yang tersisa
const OLD_STATUS_WEIGHTS = [
    { status: 'CONFIRMED', weight: 70 }, // mayoritas berhasil
    { status: 'CANCELED', weight: 30 }, // sisanya gagal bayar / dibatalkan
];

// BARU (kemarin, hari ini, lusa): masih dalam window aktif
//   → semua status bisa muncul
const NEW_STATUS_WEIGHTS = [
    { status: 'CONFIRMED', weight: 30 }, // sebagian sudah selesai
    { status: 'WAITING_VERIFICATION', weight: 25 }, // sudah bayar, menunggu verif admin
    { status: 'APPROVED', weight: 20 }, // disetujui admin, menunggu bayar
    { status: 'PENDING', weight: 15 }, // baru masuk, belum dicek admin
    { status: 'CANCELED', weight: 10 }, // dibatalkan / tidak jadi
];

async function seed() {
    const conn = await mysql.createConnection(dbConfig);

    try {
        log('PREP', 'Menyiapkan file bukti pembayaran demo...');
        const sourceProof = path.join(__dirname, '../../proof.jpg');
        let PROOF_URL = null;

        if (isLocal) {
            // ── Mode LOCAL: copy file ke folder uploads server ──
            const targetDir = path.join(__dirname, '../uploads/payments');
            const targetFile = path.join(targetDir, 'demo_proof_verified.jpg');

            if (fs.existsSync(sourceProof)) {
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
                fs.copyFileSync(sourceProof, targetFile);
                // Path harus pakai leading slash agar konsisten dengan upload asli
                PROOF_URL = '/uploads/payments/demo_proof_verified.jpg';
                console.log(`    ✅ [LOCAL] File disalin ke: ${targetFile}`);
                console.log(`    ✅ [LOCAL] Path DB: ${PROOF_URL}`);
            } else {
                console.log(`    ⚠️  [LOCAL] proof.jpg tidak ditemukan di: ${sourceProof}`);
                console.log(`    ⚠️  Seeder tetap berjalan tapi bukti_pembayaran akan NULL`);
            }
        } else {
            // ── Mode PRODUCTION: upload ke Vercel Blob ──
            if (!process.env.BLOB_READ_WRITE_TOKEN) {
                console.log('    ⚠️  [PROD] BLOB_READ_WRITE_TOKEN tidak ada. bukti_pembayaran akan NULL.');
            } else if (fs.existsSync(sourceProof)) {
                console.log('    ⏳ [PROD] Mengupload proof.jpg ke Vercel Blob...');
                const fileBuffer = fs.readFileSync(sourceProof);
                const blob = await put('payments/demo_proof_verified.jpg', fileBuffer, {
                    access: 'public',
                    contentType: 'image/jpeg',
                });
                PROOF_URL = blob.url;
                console.log(`    ✅ [PROD] Blob URL: ${PROOF_URL}`);
            } else {
                console.log(`    ⚠️  [PROD] proof.jpg tidak ditemukan di: ${sourceProof}`);
            }
        }

        log('CLEANUP', 'Membersihkan data lama...');
        await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
        await conn.execute('TRUNCATE TABLE tb_pembayaran');
        await conn.execute('TRUNCATE TABLE tb_notifikasi');
        await conn.execute('TRUNCATE TABLE tb_booking');
        await conn.execute('TRUNCATE TABLE tb_laporan');
        await conn.execute("DELETE FROM tb_user WHERE role != 'ADMIN'");

        // ── 1. USERS ──────────────────────────────────────────────────────────────
        log('1/5', 'Menyiapkan akun penyewa...');
        const hash = await bcrypt.hash(SEEDER_PASSWORD, SALT_ROUNDS);

        const users = [
            { id: 2, nama: 'Budi Santoso', email: 'budi@gmail.com', password: hash, role: 'PENYEWA', no_telp: '081234567890', alamat: 'Jl. Merdeka No. 10, Palembang', status_akun: 1, nik: '1671010101900001', foto_profil: null },
            { id: 3, nama: 'Susi Susanti', email: 'susi@gmail.com', password: hash, role: 'PENYEWA', no_telp: '081234567891', alamat: 'Jl. Sudirman No. 5, Palembang', status_akun: 1, nik: '1671010101900002', foto_profil: null },
            { id: 4, nama: 'Alan Budikusuma', email: 'alan@gmail.com', password: hash, role: 'PENYEWA', no_telp: '081234567892', alamat: 'Kertapati, Palembang', status_akun: 1, nik: '1671010101900003', foto_profil: null },
        ];

        for (let i = 5; i <= 25; i++) {
            const fullName = faker.person.fullName();
            const firstName = fullName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
            users.push({
                id: i,
                nama: fullName,
                email: `${firstName}${i}@gmail.com`,
                password: hash,
                role: 'PENYEWA',
                no_telp: faker.phone.number('08##########'),
                alamat: `${faker.location.streetAddress()}, Palembang`,
                status_akun: 1,
                nik: `16710101019000${i.toString().padStart(2, '0')}`,
                foto_profil: null
            });
        }

        users.push({
            id: 999,
            nama: 'Kepala Dinas',
            email: 'pimpinan.dispora@palembang.go.id',
            password: hash,
            role: 'PIMPINAN',
            no_telp: '08111222333',
            alamat: 'Dispora Palembang',
            status_akun: 1,
            nik: null,
            foto_profil: null
        });

        await replaceInto(conn, 'tb_user', users);

        // ── 2. TARIF ──────────────────────────────────────────────────────────────
        log('2/5', 'Update Master Data Tarif...');
        const tarifs = [
            // Sepak Bola (id: 1)
            { id: 68, id_fasilitas: 1, tipe_tarif: 'SESI', nama_tarif: 'Sesi I', jam_mulai: '08:00:00', jam_selesai: '12:00:00', harga: 150000, kapasitas: 1 },
            { id: 69, id_fasilitas: 1, tipe_tarif: 'SESI', nama_tarif: 'Sesi II', jam_mulai: '13:00:00', jam_selesai: '17:00:00', harga: 150000, kapasitas: 1 },
            { id: 71, id_fasilitas: 1, tipe_tarif: 'EVENT', nama_tarif: 'Event / Keperluan Lain', jam_mulai: null, jam_selesai: null, harga: 7600000, kapasitas: 1 },
            // Badminton (id: 6)
            { id: 81, id_fasilitas: 6, tipe_tarif: 'SESI', nama_tarif: 'Sesi I', jam_mulai: '08:00:00', jam_selesai: '12:00:00', harga: 135000, kapasitas: 1 },
            { id: 82, id_fasilitas: 6, tipe_tarif: 'SESI', nama_tarif: 'Sesi II', jam_mulai: '13:00:00', jam_selesai: '17:00:00', harga: 135000, kapasitas: 1 },
            // Tenis (id: 4)
            { id: 84, id_fasilitas: 4, tipe_tarif: 'SESI', nama_tarif: 'Sesi I', jam_mulai: '08:00:00', jam_selesai: '12:00:00', harga: 120000, kapasitas: 1 },
        ];
        await replaceInto(conn, 'tb_fasilitas_tarif', tarifs);

        // ── 3. BOOKINGS ───────────────────────────────────────────────────────────
        log('3/5', 'Generate Simulasi Booking Massal & Kalkulasi FCFS...');

        const now = new Date();
        const today = new Date(now); today.setHours(0, 0, 0, 0);

        // Rentang LAMA: 1 Jan tahun ini s.d 4 hari lalu
        const oldRangeStart = new Date(now.getFullYear(), 0, 1);
        const oldRangeEnd = new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000);
        oldRangeEnd.setHours(23, 59, 59, 999);

        // Rentang BARU: kemarin s.d lusa
        const newRangeStart = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
        const newRangeEnd = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
        newRangeEnd.setHours(23, 59, 59, 999);

        const bookings = [];
        const pembayaran = [];
        let bookingIdCounter = 1;
        let pembayaranIdCounter = 1;
        const chunkSize = 50;

        const penyewaUsers = users.filter(u => u.role === 'PENYEWA');

        // ── Jumlah unit fisik per fasilitas (harus sinkron dengan data di tb_fasilitas) ──
        // Key: fasilitasId → jumlah_unit
        const FASILITAS_UNITS = { 1: 1, 4: 1, 6: 2 };

        // ── Slot tracker: per (fasilitasId-tarifId-tanggal) → Set<nomor_unit> yang aktif ──
        // "Aktif" = status booking bukan CANCELED
        const slotTracker = new Map();

        function getSlotKey(fasilitasId, tarifId, tanggal) {
            return `${fasilitasId}-${tarifId}-${tanggal}`;
        }

        /**
         * Coba assign nomor_unit untuk booking ini.
         * Mengembalikan nomor_unit jika tersedia, atau null jika semua unit penuh.
         * CANCELED tidak memblokir slot karena tidak merupakan booking aktif.
         */
        function assignUnit(fasilitasId, tarifId, tanggal, status) {
            if (status === 'CANCELED') return 1; // CANCELED tidak pakai slot

            const maxUnits = FASILITAS_UNITS[fasilitasId] || 1;
            const key = getSlotKey(fasilitasId, tarifId, tanggal);

            if (!slotTracker.has(key)) slotTracker.set(key, new Set());
            const occupied = slotTracker.get(key);

            // Cari unit pertama yang belum terpakai (FCFS: ambil terendah)
            for (let u = 1; u <= maxUnits; u++) {
                if (!occupied.has(u)) {
                    occupied.add(u);
                    return u;
                }
            }
            return null; // semua unit penuh → booking akan di-override ke CANCELED
        }

        // ── Helper generate satu booking ────────────────────────────────────────
        function buildBooking({ rangeStart, rangeEnd, maxOffsetDays, statusWeights }) {
            const selectedTariff = getRandomElement(tarifs);
            const selectedUser = getRandomElement(penyewaUsers);
            let status = getWeightedStatus(statusWeights);

            const arrivalTime = faker.date.between({ from: rangeStart, to: rangeEnd });
            const rawBookingDate = new Date(arrivalTime.getTime() + faker.number.int({ min: 1, max: maxOffsetDays }) * 24 * 60 * 60 * 1000);
            const bookingDateObj = rawBookingDate > rangeEnd ? rangeEnd : rawBookingDate;
            const tanggal_booking = bookingDateObj.toISOString().split('T')[0];

            const jamMulaiStr = selectedTariff.jam_mulai || '08:00:00';
            const jamSelesaiStr = selectedTariff.jam_selesai || '22:00:00';
            const [sH, sM] = jamMulaiStr.split(':').map(Number);
            const [eH, eM] = jamSelesaiStr.split(':').map(Number);
            const durationHours = ((eH * 60 + eM) - (sH * 60 + sM)) / 60;

            const nextAvailableST = new Date(`${tanggal_booking}T${jamMulaiStr}`);
            const metrics = calculateFCFSMetrics(arrivalTime, nextAvailableST, durationHours);

            // Coba assign unit; jika penuh → paksa CANCELED (realistis: datang terlambat, slot habis)
            const assignedUnit = assignUnit(selectedTariff.id_fasilitas, selectedTariff.id, tanggal_booking, status);
            if (assignedUnit === null) {
                status = 'CANCELED';
            }

            return {
                booking: {
                    id: bookingIdCounter,
                    userId: selectedUser.id,
                    fasilitasId: selectedTariff.id_fasilitas,
                    tarifId: selectedTariff.id,
                    nomor_unit: assignedUnit || 1, // CANCELED pakai 1, tidak memblokir slot
                    snapshot_nama_sesi: selectedTariff.nama_tarif,
                    snapshot_jam_mulai: jamMulaiStr,
                    snapshot_jam_selesai: jamSelesaiStr,
                    tanggal_booking,
                    arrival_time: metrics.arrival_time,
                    start_time: metrics.start_time,
                    completion_time: metrics.end_time,
                    burst_time: metrics.burst_time,
                    turnaround_time: metrics.turnaround_time,
                    waiting_time: metrics.waiting_time,
                    response_time: metrics.response_time,
                    total_biaya: selectedTariff.harga,
                    status_booking: status,
                    createdAt: arrivalTime,
                    updatedAt: new Date(arrivalTime.getTime() + 60 * 60 * 1000),
                },
                arrivalTime,
                status,
            };
        }

        // ── 120 booking LAMA ────────────────────────────────────────────────────
        for (let i = 0; i < 120; i++) {
            const { booking, arrivalTime, status } = buildBooking({
                rangeStart: oldRangeStart,
                rangeEnd: oldRangeEnd,
                maxOffsetDays: 10,
                statusWeights: OLD_STATUS_WEIGHTS,
            });

            bookings.push(booking);

            // Lama CONFIRMED: punya bukti bayar yang sudah diverifikasi
            if (status === 'CONFIRMED') {
                const tanggalBayar = new Date(arrivalTime.getTime() + faker.number.int({ min: 10, max: 60 }) * 60 * 1000);
                pembayaran.push({
                    id: pembayaranIdCounter++,
                    bookingId: bookingIdCounter,
                    metode_pembayaran: getRandomElement(['Transfer', 'QRIS']),
                    bukti_pembayaran: PROOF_URL,
                    status_verifikasi: 1,
                    tanggal_bayar: tanggalBayar,
                    createdAt: tanggalBayar,
                    updatedAt: new Date(tanggalBayar.getTime() + 30 * 60 * 1000),
                });
            }
            // Lama CANCELED: tidak ada record pembayaran (tidak sempat bayar → di-cancel FCFS)

            bookingIdCounter++;
        }

        // ── 30 booking BARU (kemarin, hari ini, lusa) ───────────────────────────
        for (let i = 0; i < 30; i++) {
            const { booking, arrivalTime, status } = buildBooking({
                rangeStart: newRangeStart,
                rangeEnd: newRangeEnd,
                maxOffsetDays: 3,
                statusWeights: NEW_STATUS_WEIGHTS,
            });

            // Fix: booking APPROVED harus punya updatedAt yang masih dalam window aktif
            // agar CountdownTimer di MyBookings.jsx menampilkan hitungan mundur (bukan "Waktu Habis")
            if (status === 'APPROVED') {
                const minutesAgo = faker.number.int({ min: 1, max: 5 });
                booking.updatedAt = new Date(Date.now() - minutesAgo * 60 * 1000);
            }

            bookings.push(booking);

            if (status === 'WAITING_VERIFICATION' || status === 'CONFIRMED') {
                // Baru: sudah upload bukti, mungkin sudah/belum diverifikasi
                const tanggalBayar = new Date(arrivalTime.getTime() + faker.number.int({ min: 5, max: 30 }) * 60 * 1000);
                pembayaran.push({
                    id: pembayaranIdCounter++,
                    bookingId: bookingIdCounter,
                    metode_pembayaran: getRandomElement(['Transfer', 'QRIS']),
                    bukti_pembayaran: '/uploads/payments/demo_proof_verified.jpg',
                    status_verifikasi: status === 'CONFIRMED' ? 1 : 0,
                    tanggal_bayar: tanggalBayar,
                    createdAt: tanggalBayar,
                    updatedAt: status === 'CONFIRMED'
                        ? new Date(tanggalBayar.getTime() + 30 * 60 * 1000)
                        : tanggalBayar,
                });
            }
            // PENDING / APPROVED: belum bayar, tidak ada record pembayaran

            bookingIdCounter++;
        }

        // Sort & insert
        bookings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        for (let i = 0; i < bookings.length; i += chunkSize) {
            await replaceInto(conn, 'tb_booking', bookings.slice(i, i + chunkSize));
        }
        log('4/5', `Berhasil meng-generate ${bookings.length} data booking (120 lama + 30 baru)...`);

        // ── 4. PEMBAYARAN ─────────────────────────────────────────────────────────
        if (pembayaran.length > 0) {
            for (let i = 0; i < pembayaran.length; i += chunkSize) {
                await replaceInto(conn, 'tb_pembayaran', pembayaran.slice(i, i + chunkSize));
            }
            log('5/5', `Berhasil meng-generate ${pembayaran.length} data pembayaran...`);
        }

        // ── Summary ───────────────────────────────────────────────────────────────
        const countByStatus = bookings.reduce((acc, b) => {
            acc[b.status_booking] = (acc[b.status_booking] || 0) + 1;
            return acc;
        }, {});
        console.log('\n📊 Distribusi Status Booking:');
        Object.entries(countByStatus).forEach(([s, c]) =>
            console.log(`   ${s.padEnd(25)} : ${c}`)
        );
        console.log(`\n   ${'Total'.padEnd(25)} : ${bookings.length}`);
        console.log(`   ${'Total Pembayaran'.padEnd(25)} : ${pembayaran.length}`);

        log('🏁', 'SEEDER MULTI-FASILITAS & FCFS SELESAI.');

    } catch (err) {
        console.error('❌ Gagal:', err.message);
    } finally {
        await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
        await conn.end();
    }
}

seed();