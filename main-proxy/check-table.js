const pool = require('./db');

async function checkTable() {
  try {
    // Check table structure
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_mail'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check existing data
    const data = await pool.query('SELECT * FROM user_mail LIMIT 3');
    console.log('\n📊 Sample data:');
    data.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Email: ${row.email}, Nama: ${row.nama}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTable(); 