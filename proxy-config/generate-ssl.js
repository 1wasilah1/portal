const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sslDir = './ssl';
const certPath = path.join(sslDir, 'cert.pem');
const keyPath = path.join(sslDir, 'key.pem');

// Create SSL directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

// Generate self-signed certificate
const generateCertificate = () => {
  try {
    console.log('🔐 Generating self-signed SSL certificate...');
    
    const command = `openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/C=ID/ST=Jakarta/L=Jakarta/O=DPRKP/OU=IT/CN=localhost"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ SSL certificate generated successfully!');
    console.log(`📁 Certificate: ${certPath}`);
    console.log(`🔑 Private Key: ${keyPath}`);
    console.log('💡 To enable HTTPS, set USE_SSL=true in your .env file');
    
  } catch (error) {
    console.error('❌ Error generating SSL certificate:', error.message);
    console.log('💡 Make sure OpenSSL is installed on your system');
    console.log('   macOS: brew install openssl');
    console.log('   Ubuntu: sudo apt-get install openssl');
    console.log('   Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
  }
};

generateCertificate(); 