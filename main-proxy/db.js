const { Pool } = require('pg');

const pool = new Pool({
  user: 'gisuser',
  host: '10.15.38.162',
  database: 'gisdb',
  password: 'G15U53r12',
  port: 5432,
});

module.exports = pool; 