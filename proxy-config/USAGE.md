# 🚀 Panduan Penggunaan Proxy Service

## 📋 Ringkasan

Proxy service ini memungkinkan Anda mengakses 3 aplikasi frontend melalui satu port HTTPS (1500) dengan konfigurasi dinamis.

## 🎯 Aplikasi yang Didukung

| Aplikasi | Port Asli | Path Proxy | URL Akses |
|----------|-----------|------------|-----------|
| Login App | 1225 | `/login` | https://localhost:1500/login |
| FE App | 9000 | `/fe` | https://localhost:1500/fe |
| Portal Data App | 5500 | `/portal` | https://localhost:1500/portal |

## 🚀 Cara Menjalankan

### 1. Setup Awal (Hanya sekali)

```bash
cd proxy-config
./setup.sh
```

### 2. Menjalankan Semua Aplikasi

```bash
cd proxy-config
./start-apps.sh
```

Script ini akan:
- ✅ Menjalankan Login App di port 1225
- ✅ Menjalankan FE App di port 9000  
- ✅ Menjalankan Portal Data App di port 5500
- ✅ Menjalankan Proxy Service di port 1500 (HTTPS)

### 3. Menjalankan Proxy Service Saja

```bash
cd proxy-config
npm start
```

### 4. Mode Development

```bash
cd proxy-config
npm run dev
```

## 🛑 Cara Menghentikan

### Menghentikan Semua Aplikasi

```bash
cd proxy-config
./stop-apps.sh
```

### Menghentikan Proxy Service Saja

```bash
# Tekan Ctrl+C di terminal yang menjalankan proxy
# Atau
pkill -f "node server.js"
```

## 🔧 Konfigurasi

### Mengubah Port

Edit file `proxy-config/.env`:

```env
# Proxy Configuration
PROXY_PORT=1500
PROXY_HOST=localhost

# Frontend Applications Ports
LOGIN_PORT=1225
FE_PORT=9000
PORTALDATA_PORT=5500

# SSL Configuration
USE_SSL=true
```

### Mengubah Host

Jika aplikasi berjalan di server lain:

```env
PROXY_HOST=192.168.1.100
```

## 📊 Monitoring

### Health Check

```bash
curl -k https://localhost:1500/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "proxy": {
    "port": "1500",
    "host": "localhost",
    "ssl": true
  },
  "services": {
    "login": "https://localhost:1500/login",
    "fe": "https://localhost:1500/fe",
    "portaldata": "https://localhost:1500/portal"
  },
  "targets": {
    "login": "http://localhost:1225",
    "fe": "http://localhost:9000",
    "portaldata": "http://localhost:5500"
  }
}
```

### Status Check

```bash
curl -k https://localhost:1500/status
```

Response:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "login": {"port": "1225", "status": "running", "code": 200},
    "fe": {"port": "9000", "status": "running", "code": 200},
    "portaldata": {"port": "5500", "status": "running", "code": 200}
  }
}
```

## 🔐 SSL Certificate

### Generate Certificate Baru

```bash
cd proxy-config
npm run generate-ssl
```

### Disable HTTPS (HTTP Mode)

Edit file `.env`:
```env
USE_SSL=false
```

## 🐛 Troubleshooting

### Error: "Service Unavailable"

Ini berarti aplikasi target tidak berjalan. Solusi:

1. **Cek status aplikasi**:
   ```bash
   curl -k https://localhost:1500/status
   ```

2. **Jalankan aplikasi yang tidak berjalan**:
   ```bash
   # Login App
   cd login && npm start
   
   # FE App  
   cd fe && npm run dev
   
   # Portal Data App
   cd portaldata-fe && npm start
   ```

### Error: "Port already in use"

```bash
# Cek port yang digunakan
lsof -i :1500

# Kill process jika perlu
kill -9 <PID>
```

### Error: "SSL Certificate not found"

```bash
cd proxy-config
npm run generate-ssl
```

### Error: "Cannot find module"

```bash
cd proxy-config
npm install
```

## 📱 Akses Aplikasi

Setelah semua aplikasi berjalan:

- **Login App**: https://localhost:1500/login
- **FE App**: https://localhost:1500/fe  
- **Portal Data**: https://localhost:1500/portal
- **Health Check**: https://localhost:1500/health
- **Status Check**: https://localhost:1500/status

## 🔍 Logs

Proxy service akan menampilkan log untuk setiap request:

```
Proxying GET /login to /
Proxying POST /fe/api/data to /api/data
```

## ⚡ Tips

1. **Gunakan script otomatis**: `./start-apps.sh` untuk menjalankan semua aplikasi sekaligus
2. **Monitor status**: Gunakan `/status` endpoint untuk cek aplikasi mana yang berjalan
3. **HTTPS**: Proxy service menggunakan HTTPS secara default untuk keamanan
4. **Development**: Gunakan `npm run dev` untuk auto-restart saat ada perubahan kode

## 🆘 Bantuan

Jika mengalami masalah:

1. Cek status semua aplikasi: `curl -k https://localhost:1500/status`
2. Restart proxy service: `npm start`
3. Regenerate SSL certificate: `npm run generate-ssl`
4. Cek logs di terminal yang menjalankan proxy service 