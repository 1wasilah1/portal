# Backend Setup untuk Admin Login

## Quick Start dengan Mock Server

Untuk testing cepat dengan data dummy:

```bash
# Install dependencies
npm install

# Jalankan mock server dan frontend bersamaan
npm run dev-with-mock

# Atau jalankan terpisah:
# Terminal 1: Mock server
npm run mock-server

# Terminal 2: Frontend
npm run dev
```

**Setelah running:**
- Mock Server: `http://localhost:3000`
- Frontend: `http://localhost:1225` atau `http://localhost:1226` (jika port 1225 sedang digunakan)

**Test Credentials:**
- Username: `wasil`, Password: `wasil123`
- Username: `admin`, Password: `admin123`
- App ID: `8`

## Konfigurasi Backend

Aplikasi ini mengharapkan backend server berjalan di `http://localhost:3000` dengan endpoint berikut:

### 1. Admin Login Endpoint

**POST** `/admin/login`

**Request Body:**
```json
{
  "username": "wasil",
  "password": "wasil123", 
  "app_id": 8
}
```

**Response (Success - 200):**
```json
{
  "message": "Login successful",
  "user": {
    "username": "wasil",
    "role": "admin"
  },
  "accessToken": "jwt-access-token-here",
  "refreshToken": "jwt-refresh-token-here"
}
```

**HTTP-Only Cookies yang harus di-set:**
- `accessToken` - HttpOnly, Secure, SameSite=Strict
- `refreshToken` - HttpOnly, Secure, SameSite=Strict

### 2. Admin Profile Endpoint

**GET** `/admin/profile`

**Headers:**
- Cookie: accessToken dan refreshToken (otomatis)

**Response (Success - 200):**
```json
{
  "data": {
    "username": "wasil",
    "role": "admin",
    "loginTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Admin Logout Endpoint

**POST** `/admin/logout`

**Headers:**
- Cookie: accessToken dan refreshToken (otomatis)

**Response (Success - 200):**
```json
{
  "message": "Logout successful"
}
```

**Action:** Clear HTTP-only cookies

## Konfigurasi Proxy

Vite development server sudah dikonfigurasi untuk mem-proxy request ke `http://localhost:3000`:

```typescript
// vite.config.ts
proxy: {
  '/admin': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false
  }
}
```

## Mode Development (Fallback)

Jika backend tidak tersedia, aplikasi akan otomatis menggunakan fallback authentication:

- ✅ Login tetap berfungsi dengan localStorage
- ✅ Dashboard dapat diakses
- ✅ User mendapat notifikasi bahwa menggunakan development mode

## Setup Backend Server

1. Pastikan backend server berjalan di port 3000
2. Implementasikan endpoint-endpoint di atas
3. Pastikan CORS dikonfigurasi untuk `http://localhost:1225`
4. Pastikan HTTP-only cookies dapat di-set dengan benar

## Testing

Untuk testing tanpa backend:
- Login akan otomatis menggunakan fallback mode
- Semua fitur tetap berfungsi normal
- User mendapat pesan bahwa backend tidak tersedia

Untuk testing dengan backend:
- Pastikan backend running di port 3000
- Login akan menggunakan API endpoints
- HTTP-only cookies akan digunakan untuk authentication