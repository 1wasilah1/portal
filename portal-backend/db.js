const { Pool } = require('pg');

const pool = new Pool({
  user: 'wasil',
  host: 'localhost',
  database: 'sirukim',
  password: 'DataTim2025',
  port: 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

module.exports = pool; 