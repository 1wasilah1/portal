const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating SSL certificates...');

try {
    // Generate private key
    execSync('openssl genrsa -out key.pem 2048', { stdio: 'inherit' });
    console.log('✅ Private key generated');
    
    // Generate certificate
    execSync('openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Development/CN=localhost"', { stdio: 'inherit' });
    console.log('✅ Certificate generated');
    
    console.log('🎉 SSL certificates created successfully!');
    console.log('📁 Files created: key.pem, cert.pem');
} catch (error) {
    console.error('❌ Error generating SSL certificates:', error.message);
    console.log('💡 Alternative: Server will run in HTTP mode');
} 