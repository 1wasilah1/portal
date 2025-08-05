const pool = require('./db');

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0]);
    
    // Test query user_mail table
    const userResult = await pool.query('SELECT COUNT(*) FROM user_mail');
    console.log('✅ User table accessible:', userResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection(); 