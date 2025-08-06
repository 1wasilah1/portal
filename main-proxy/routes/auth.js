const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Register citizen
router.post('/citizen/register', async (req, res) => {
  try {
    const { email, nama, no_hp, alamat } = req.body;

    // Validasi input
    if (!email || !nama || !no_hp || !alamat) {
      return res.status(400).json({ 
        error: 'Semua field harus diisi' 
      });
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Format email tidak valid' 
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await pool.query(
      'SELECT * FROM user_mail WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email sudah terdaftar' 
      });
    }

    // Insert user baru
    const newUser = await pool.query(
      `INSERT INTO user_mail (email, nama, no_hp, alamat) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, nama, no_hp, alamat, created_at`,
      [email, nama, no_hp, alamat]
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server' 
    });
  }
});

// Login citizen
router.post('/citizen/login', async (req, res) => {
  try {
    const { email } = req.body;

    // Validasi input
    if (!email) {
      return res.status(400).json({ 
        error: 'Email harus diisi' 
      });
    }

    // Cari user berdasarkan email
    const user = await pool.query(
      'SELECT * FROM user_mail WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Email tidak terdaftar' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.rows[0].id, 
        email: user.rows[0].email,
        nama: user.rows[0].nama
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        nama: user.rows[0].nama,
        no_hp: user.rows[0].no_hp,
        alamat: user.rows[0].alamat
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server' 
    });
  }
});

// Get user profile
router.get('/citizen/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token tidak ditemukan' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await pool.query(
      'SELECT id, email, nama, no_hp, alamat, created_at FROM user_mail WHERE id = $1',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User tidak ditemukan' 
      });
    }

    res.json({
      user: user.rows[0]
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server' 
    });
  }
});

module.exports = router; 