const mysql = require('mysql2/promise');
require('dotenv').config();

// Deteksi apakah sedang di Railway atau Lokal
const isRailway = process.env.RAILWAY_ENVIRONMENT_ID || process.env.MYSQLHOST;

const pool = mysql.createPool({
  host: isRailway ? (process.env.MYSQLHOST || 'localhost') : (process.env.DB_HOST || 'localhost'),
  user: isRailway ? (process.env.MYSQLUSER || 'root') : (process.env.DB_USER || 'root'),
  password: isRailway ? (process.env.MYSQLPASSWORD || '') : (process.env.DB_PASSWORD || 'roots'),
  database: isRailway ? (process.env.MYSQLDATABASE || 'railway') : (process.env.DB_NAME || 'sipendora'),
  port: isRailway ? (process.env.MYSQLPORT || 3306) : (process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: isRailway ? { rejectUnauthorized: false } : false
});

module.exports = pool;
