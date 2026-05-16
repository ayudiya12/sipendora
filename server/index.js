const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth')
const fasilitasRoutes = require('./routes/facilities')
const usersRoutes = require('./routes/users')
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const pimpinanRoutes = require('./routes/pimpinan');

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://sipendora.vercel.app', // Hardcoded sebagai cadangan
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // izinkan request tanpa origin (seperti mobile apps atau curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => origin.startsWith(o)) || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      console.log('CORS Blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.set('trust proxy', 1);
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));
console.log('🔧 [STATIC] Serving uploads from:', uploadsDir);

app.use('/api/auth', authRoutes)
app.use('/api/fasilitas', fasilitasRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/pimpinan', pimpinanRoutes)

// Test Route
app.get('/', (req, res) => {
  res.send('🚀 SIPENDORA API (Raw MySQL Mode) is Running!');
});

// Start Server
app.listen(PORT, async () => {
  console.log(`
  ==========================================
   🏛️  SIPENDORA SERVER (RAW MYSQL) STARTED
   📡 Port: ${PORT}
   🔗 URL: http://localhost:${PORT}
  ==========================================
  `);

  // Test Koneksi Database
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS connection_test');
    if (rows) {
      console.log(' ✅ DATABASE CONNECTION: SUCCESS (CONNECTED TO MYSQL)');
    }
  } catch (error) {
    console.error(' ❌ DATABASE CONNECTION: FAILED');
    console.error(' Error Detail:', error.message);
  }
});
