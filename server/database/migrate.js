require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    // We will create an explicit connection to ensure it connects correctly using railway env vars from .env.deploy if present
    const isRailway = process.env.MYSQLHOST ? true : false;

const dbConfig = isRailway
  ? {
      host: 'shuttle.proxy.rlwy.net',
      user: 'root',
      password: 'UQzrcBtlYdxKYAWATDHrSjWLDeTKJTim',
      database: 'railway',
      port: 33168,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sipendora',
      // No SSL for local development
    };

    console.log('Connecting to database:', dbConfig.host, 'DB:', dbConfig.database);

    try {
        const pool = mysql.createPool(dbConfig);
        
        console.log('Running migration: Adding nik and foto_profil to tb_user...');
        
        // Cek apakah kolom nik sudah ada
        const [columns] = await pool.query(`SHOW COLUMNS FROM tb_user LIKE 'nik'`);
        if (columns.length === 0) {
            await pool.query(`ALTER TABLE tb_user ADD COLUMN nik VARCHAR(16) DEFAULT NULL`);
            console.log('✅ Column "nik" added successfully.');
        } else {
            console.log('ℹ️ Column "nik" already exists.');
        }

        // Cek apakah kolom foto_profil sudah ada
        const [fotoColumns] = await pool.query(`SHOW COLUMNS FROM tb_user LIKE 'foto_profil'`);
        if (fotoColumns.length === 0) {
            await pool.query(`ALTER TABLE tb_user ADD COLUMN foto_profil VARCHAR(255) DEFAULT NULL`);
            console.log('✅ Column "foto_profil" added successfully.');
        } else {
            console.log('ℹ️ Column "foto_profil" already exists.');
        }

        console.log('Migration completed successfully!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
