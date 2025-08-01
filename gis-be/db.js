//koneksi ke db

const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => console.error('❌ Failed to connect to database', err.stack));

// ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false

module.exports = pool;
