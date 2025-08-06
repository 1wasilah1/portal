const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS suku_dinas (
    id SERIAL PRIMARY KEY,
    alamat TEXT NOT NULL,
    rw VARCHAR(10) NOT NULL,
    kelurahan VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    wilayah_administrasi VARCHAR(100) NOT NULL,
    nama_kegiatan TEXT NOT NULL,
    tipe_bahan VARCHAR(100) NOT NULL,
    tahun_pelaksanaan INTEGER NOT NULL,
    volume DECIMAL(10,2) NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    anggaran DECIMAL(15,2) NOT NULL,
    nama_surveyor VARCHAR(100) NOT NULL,
    foto VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize table
pool.query(createTableQuery, (err, result) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Suku dinas table ready');
  }
});

// GET all suku dinas data
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM suku_dinas';
    let countQuery = 'SELECT COUNT(*) FROM suku_dinas';
    let params = [];
    
    if (search) {
      const searchCondition = `
        WHERE alamat ILIKE $1 
        OR kelurahan ILIKE $1 
        OR kecamatan ILIKE $1 
        OR nama_kegiatan ILIKE $1 
        OR nama_surveyor ILIKE $1
      `;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : [])
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching suku dinas data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET single suku dinas by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM suku_dinas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching suku dinas data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST create new suku dinas data
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const {
      alamat,
      rw,
      kelurahan,
      kecamatan,
      wilayah_administrasi,
      nama_kegiatan,
      tipe_bahan,
      tahun_pelaksanaan,
      volume,
      satuan,
      anggaran,
      nama_surveyor
    } = req.body;
    
    // Validate required fields
    if (!alamat || !rw || !kelurahan || !kecamatan || !wilayah_administrasi || 
        !nama_kegiatan || !tipe_bahan || !tahun_pelaksanaan || !volume || 
        !satuan || !anggaran || !nama_surveyor) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required except foto' 
      });
    }
    
    const foto = req.file ? req.file.filename : null;
    
    const query = `
      INSERT INTO suku_dinas (
        alamat, rw, kelurahan, kecamatan, wilayah_administrasi, 
        nama_kegiatan, tipe_bahan, tahun_pelaksanaan, volume, 
        satuan, anggaran, nama_surveyor, foto
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const values = [
      alamat, rw, kelurahan, kecamatan, wilayah_administrasi,
      nama_kegiatan, tipe_bahan, parseInt(tahun_pelaksanaan), 
      parseFloat(volume), satuan, parseFloat(anggaran), nama_surveyor, foto
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({ 
      success: true, 
      message: 'Data suku dinas created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating suku dinas data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT update suku dinas data
router.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      alamat,
      rw,
      kelurahan,
      kecamatan,
      wilayah_administrasi,
      nama_kegiatan,
      tipe_bahan,
      tahun_pelaksanaan,
      volume,
      satuan,
      anggaran,
      nama_surveyor
    } = req.body;
    
    // Check if record exists
    const existingRecord = await pool.query('SELECT * FROM suku_dinas WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data not found' });
    }
    
    // Validate required fields
    if (!alamat || !rw || !kelurahan || !kecamatan || !wilayah_administrasi || 
        !nama_kegiatan || !tipe_bahan || !tahun_pelaksanaan || !volume || 
        !satuan || !anggaran || !nama_surveyor) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required except foto' 
      });
    }
    
    let foto = existingRecord.rows[0].foto;
    if (req.file) {
      // Delete old photo if exists
      if (foto) {
        const oldPhotoPath = path.join(__dirname, '../uploads', foto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      foto = req.file.filename;
    }
    
    const query = `
      UPDATE suku_dinas SET 
        alamat = $1, rw = $2, kelurahan = $3, kecamatan = $4, 
        wilayah_administrasi = $5, nama_kegiatan = $6, tipe_bahan = $7, 
        tahun_pelaksanaan = $8, volume = $9, satuan = $10, anggaran = $11, 
        nama_surveyor = $12, foto = $13, updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `;
    
    const values = [
      alamat, rw, kelurahan, kecamatan, wilayah_administrasi,
      nama_kegiatan, tipe_bahan, parseInt(tahun_pelaksanaan), 
      parseFloat(volume), satuan, parseFloat(anggaran), nama_surveyor, foto, id
    ];
    
    const result = await pool.query(query, values);
    
    res.json({ 
      success: true, 
      message: 'Data suku dinas updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating suku dinas data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE suku dinas data
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the record to delete the photo
    const existingRecord = await pool.query('SELECT foto FROM suku_dinas WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data not found' });
    }
    
    // Delete photo file if exists
    const foto = existingRecord.rows[0].foto;
    if (foto) {
      const photoPath = path.join(__dirname, '../uploads', foto);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    const result = await pool.query('DELETE FROM suku_dinas WHERE id = $1 RETURNING *', [id]);
    
    res.json({ 
      success: true, 
      message: 'Data suku dinas deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting suku dinas data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET photo by filename
router.get('/photo/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const photoPath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(photoPath)) {
      res.sendFile(photoPath);
    } else {
      res.status(404).json({ success: false, message: 'Photo not found' });
    }
  } catch (error) {
    console.error('Error serving photo:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 