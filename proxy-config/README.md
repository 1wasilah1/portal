# Proxy Service untuk Frontend Applications

Proxy service ini memungkinkan Anda mengakses 3 aplikasi frontend melalui satu port dengan konfigurasi dinamis menggunakan file `.env`.

## 🚀 Fitur

- **Routing Dinamis**: Akses aplikasi melalui path yang berbeda
- **Konfigurasi Dinamis**: Port dapat diubah melalui file `.env`
- **Dukungan HTTPS**: Opsional SSL/TLS encryption
- **Health Check**: Endpoint untuk monitoring status
- **Security**: Helmet.js untuk keamanan

## 📁 Struktur Routing

| Path | Target App | Port |
|------|------------|------|
| `/login` | Login App | 1225 |
| `/fe` | FE App | 9000 |
| `/portal` | Portal Data App | 5500 |
| `/health` | Health Check | - |

## 🛠️ Instalasi

1. **Clone atau buat folder proxy-config**
```bash
mkdir proxy-config
cd proxy-config
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp env.example .env
```

4. **Edit file .env sesuai kebutuhan**
```env
# Proxy Configuration
PROXY_PORT=1500
PROXY_HOST=localhost

# Frontend Applications Ports
LOGIN_PORT=1225
FE_PORT=9000
PORTALDATA_PORT=5500

# SSL Configuration (optional)
USE_SSL=false
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```

## 🚀 Menjalankan Proxy Service

### Mode Development
```bash
npm run dev
```

### Mode Production
```bash
npm start
```

## 🔐 Setup HTTPS (Opsional)

1. **Generate SSL certificate**
```bash
npm run generate-ssl
```

2. **Enable HTTPS di .env**
```env
USE_SSL=true
```

3. **Restart proxy service**
```bash
npm start
```

## 📱 Akses Aplikasi

Setelah proxy service berjalan, Anda dapat mengakses:

### HTTP Mode
- **Login App**: http://localhost:1500/login
- **FE App**: http://localhost:1500/fe
- **Portal Data**: http://localhost:1500/portal
- **Health Check**: http://localhost:1500/health

### HTTPS Mode
- **Login App**: https://localhost:1500/login
- **FE App**: https://localhost:1500/fe
- **Portal Data**: https://localhost:1500/portal
- **Health Check**: https://localhost:1500/health

## 🔧 Konfigurasi

### Mengubah Port

Edit file `.env`:
```env
PROXY_PORT=1500        # Port proxy service
LOGIN_PORT=1225        # Port login app
FE_PORT=9000          # Port FE app
PORTALDATA_PORT=5500   # Port portal data app
```

### Mengubah Host

Jika aplikasi berjalan di server lain:
```env
PROXY_HOST=192.168.1.100  # IP server aplikasi
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:1500/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "proxy": {
    "port": 1500,
    "host": "localhost"
  },
  "services": {
    "login": "http://localhost:1225",
    "fe": "http://localhost:9000",
    "portaldata": "http://localhost:5500"
  }
}
```

## 🛡️ Security

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input validation**: Sanitasi input
- **Error handling**: Proper error responses

## 🔍 Troubleshooting

### Port sudah digunakan
```bash
# Cek port yang digunakan
lsof -i :1500

# Kill process jika perlu
kill -9 <PID>
```

### SSL certificate error
```bash
# Regenerate certificate
npm run generate-ssl
```

### Aplikasi tidak dapat diakses
1. Pastikan aplikasi target berjalan
2. Cek port di file `.env`
3. Cek firewall settings
4. Cek network connectivity

## 📝 Logs

Proxy service akan menampilkan log untuk setiap request:
```
Proxying GET /login to /
Proxying POST /fe/api/data to /api/data
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License 