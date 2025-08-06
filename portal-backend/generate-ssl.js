const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sslDir = './ssl';
const certPath = path.join(sslDir, 'cert.pem');
const keyPath = path.join(sslDir, 'key.pem');
const configPath = path.join(sslDir, 'openssl.conf');

// Create SSL directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

// Generate self-signed certificate with SAN
const generateCertificate = () => {
  try {
    console.log('🔐 Generating self-signed SSL certificate with SAN...');
    
    // Create OpenSSL config file
    const opensslConfig = `[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = ID
ST = Jakarta
L = Jakarta
O = DPRKP
OU = IT
CN = localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
DNS.3 = localhost.localdomain
`;
    
    fs.writeFileSync(configPath, opensslConfig);
    
    // Generate private key
    const keyCommand = `openssl genrsa -out ${keyPath} 2048`;
    execSync(keyCommand, { stdio: 'inherit' });
    
    // Generate certificate with SAN
    const certCommand = `openssl req -new -x509 -key ${keyPath} -out ${certPath} -days 365 -config ${configPath} -extensions v3_req`;
    execSync(certCommand, { stdio: 'inherit' });
    
    // Clean up config file
    fs.unlinkSync(configPath);
    
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