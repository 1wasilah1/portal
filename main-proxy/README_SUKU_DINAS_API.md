# Suku Dinas API Documentation

## Overview
API untuk mengelola data kegiatan suku dinas dengan spesifikasi field yang telah ditentukan.

## Base URL
```
https://localhost:9200/api/suku-dinas
```

## Database Schema
Tabel `suku_dinas` memiliki field berikut:
- `id` (SERIAL PRIMARY KEY)
- `alamat` (TEXT) - Alamat lokasi kegiatan
- `rw` (VARCHAR(10)) - Nomor RW
- `kelurahan` (VARCHAR(100)) - Nama kelurahan
- `kecamatan` (VARCHAR(100)) - Nama kecamatan
- `wilayah_administrasi` (VARCHAR(100)) - Wilayah administrasi
- `nama_kegiatan` (TEXT) - Nama kegiatan yang dilakukan
- `tipe_bahan` (VARCHAR(100)) - Tipe bahan yang digunakan
- `tahun_pelaksanaan` (INTEGER) - Tahun pelaksanaan kegiatan
- `volume` (DECIMAL(10,2)) - Volume pekerjaan
- `satuan` (VARCHAR(50)) - Satuan volume
- `anggaran` (DECIMAL(15,2)) - Anggaran kegiatan
- `nama_surveyor` (VARCHAR(100)) - Nama surveyor
- `foto` (VARCHAR(255)) - Nama file foto kegiatan
- `created_at` (TIMESTAMP) - Waktu pembuatan record
- `updated_at` (TIMESTAMP) - Waktu update terakhir

## API Endpoints

### 1. GET /api/suku-dinas
Mengambil semua data suku dinas dengan pagination dan search.

**Query Parameters:**
- `page` (optional): Halaman yang diminta (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)
- `search` (optional): Kata kunci pencarian

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "alamat": "Jl. Contoh No. 123",
      "rw": "001",
      "kelurahan": "Kelurahan Contoh",
      "kecamatan": "Kecamatan Contoh",
      "wilayah_administrasi": "Jakarta Selatan",
      "nama_kegiatan": "Pembangunan Jalan",
      "tipe_bahan": "Aspal",
      "tahun_pelaksanaan": 2024,
      "volume": 100.50,
      "satuan": "Meter",
      "anggaran": 50000000.00,
      "nama_surveyor": "John Doe",
      "foto": "foto-1234567890.jpg",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10
  }
}
```

### 2. GET /api/suku-dinas/:id
Mengambil data suku dinas berdasarkan ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "alamat": "Jl. Contoh No. 123",
    "rw": "001",
    "kelurahan": "Kelurahan Contoh",
    "kecamatan": "Kecamatan Contoh",
    "wilayah_administrasi": "Jakarta Selatan",
    "nama_kegiatan": "Pembangunan Jalan",
    "tipe_bahan": "Aspal",
    "tahun_pelaksanaan": 2024,
    "volume": 100.50,
    "satuan": "Meter",
    "anggaran": 50000000.00,
    "nama_surveyor": "John Doe",
    "foto": "foto-1234567890.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. POST /api/suku-dinas
Membuat data suku dinas baru.

**Request Body (multipart/form-data):**
- `alamat` (required): Alamat lokasi kegiatan
- `rw` (required): Nomor RW
- `kelurahan` (required): Nama kelurahan
- `kecamatan` (required): Nama kecamatan
- `wilayah_administrasi` (required): Wilayah administrasi
- `nama_kegiatan` (required): Nama kegiatan yang dilakukan
- `tipe_bahan` (required): Tipe bahan yang digunakan
- `tahun_pelaksanaan` (required): Tahun pelaksanaan kegiatan
- `volume` (required): Volume pekerjaan
- `satuan` (required): Satuan volume
- `anggaran` (required): Anggaran kegiatan
- `nama_surveyor` (required): Nama surveyor
- `foto` (optional): File foto (image only, max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Data suku dinas created successfully",
  "data": {
    "id": 1,
    "alamat": "Jl. Contoh No. 123",
    "rw": "001",
    "kelurahan": "Kelurahan Contoh",
    "kecamatan": "Kecamatan Contoh",
    "wilayah_administrasi": "Jakarta Selatan",
    "nama_kegiatan": "Pembangunan Jalan",
    "tipe_bahan": "Aspal",
    "tahun_pelaksanaan": 2024,
    "volume": 100.50,
    "satuan": "Meter",
    "anggaran": 50000000.00,
    "nama_surveyor": "John Doe",
    "foto": "foto-1234567890.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4. PUT /api/suku-dinas/:id
Mengupdate data suku dinas berdasarkan ID.

**Request Body (multipart/form-data):**
- `alamat` (required): Alamat lokasi kegiatan
- `rw` (required): Nomor RW
- `kelurahan` (required): Nama kelurahan
- `kecamatan` (required): Nama kecamatan
- `wilayah_administrasi` (required): Wilayah administrasi
- `nama_kegiatan` (required): Nama kegiatan yang dilakukan
- `tipe_bahan` (required): Tipe bahan yang digunakan
- `tahun_pelaksanaan` (required): Tahun pelaksanaan kegiatan
- `volume` (required): Volume pekerjaan
- `satuan` (required): Satuan volume
- `anggaran` (required): Anggaran kegiatan
- `nama_surveyor` (required): Nama surveyor
- `foto` (optional): File foto baru (image only, max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Data suku dinas updated successfully",
  "data": {
    "id": 1,
    "alamat": "Jl. Contoh No. 123",
    "rw": "001",
    "kelurahan": "Kelurahan Contoh",
    "kecamatan": "Kecamatan Contoh",
    "wilayah_administrasi": "Jakarta Selatan",
    "nama_kegiatan": "Pembangunan Jalan",
    "tipe_bahan": "Aspal",
    "tahun_pelaksanaan": 2024,
    "volume": 100.50,
    "satuan": "Meter",
    "anggaran": 50000000.00,
    "nama_surveyor": "John Doe",
    "foto": "foto-1234567890.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 5. DELETE /api/suku-dinas/:id
Menghapus data suku dinas berdasarkan ID.

**Response:**
```json
{
  "success": true,
  "message": "Data suku dinas deleted successfully",
  "data": {
    "id": 1,
    "alamat": "Jl. Contoh No. 123",
    "rw": "001",
    "kelurahan": "Kelurahan Contoh",
    "kecamatan": "Kecamatan Contoh",
    "wilayah_administrasi": "Jakarta Selatan",
    "nama_kegiatan": "Pembangunan Jalan",
    "tipe_bahan": "Aspal",
    "tahun_pelaksanaan": 2024,
    "volume": 100.50,
    "satuan": "Meter",
    "anggaran": 50000000.00,
    "nama_surveyor": "John Doe",
    "foto": "foto-1234567890.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 6. GET /api/suku-dinas/photo/:filename
Mengambil file foto berdasarkan nama file.

**Response:** File image

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields are required except foto"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Data not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## File Upload Specifications

- **Supported formats:** JPG, PNG, GIF, WebP
- **Maximum file size:** 5MB
- **Storage location:** `main-proxy/uploads/`
- **File naming:** `foto-{timestamp}-{random}.{extension}`

## Search Functionality

Search dilakukan pada field berikut:
- `alamat`
- `kelurahan`
- `kecamatan`
- `nama_kegiatan`
- `nama_surveyor`

Search bersifat case-insensitive dan menggunakan pattern matching (ILIKE).

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Run the server:
```bash
npm start
```

3. The API will be available at:
```
https://localhost:9200/api/suku-dinas
```

## Database Setup

The table will be created automatically when the server starts. Alternatively, you can run the SQL migration manually:

```bash
psql -h 10.15.38.162 -U gisuser -d gisdb -f migrations/create_suku_dinas_table.sql
``` 