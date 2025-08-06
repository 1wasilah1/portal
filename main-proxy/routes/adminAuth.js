const express = require('express');
const axios = require('axios');

const router = express.Router();

// Mock SSO data for testing
const mockSSOUsers = [
  {
    username: 'wasil',
    password: 'wasil123',
    id: 2,
    role: 'admin'
  }
];

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username dan password harus diisi' 
      });
    }

    // Try external SSO first, fallback to mock
    try {
      // Login ke SSO server
      const loginResponse = await axios.post('https://10.15.38.162:3100/api/sso/v1/auth/login', {
        username,
        password,
        app_id: 8
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 5000 // 5 second timeout
      });

      // Set cookie dari response SSO
      if (loginResponse.headers['set-cookie']) {
        res.setHeader('Set-Cookie', loginResponse.headers['set-cookie']);
      }

      res.json({
        message: 'Login admin berhasil',
        data: loginResponse.data
      });

    } catch (ssoError) {
      console.log('External SSO not accessible, using mock SSO');
      
      // Mock SSO authentication
      const mockUser = mockSSOUsers.find(user => 
        user.username === username && user.password === password
      );

      if (!mockUser) {
        return res.status(401).json({ 
          error: 'Username atau password salah' 
        });
      }

      // Generate mock tokens
      const mockAccessToken = `mock_access_token_${Date.now()}`;
      const mockRefreshToken = `mock_refresh_token_${Date.now()}`;

      // Set mock cookies
      res.setHeader('Set-Cookie', [
        `accessToken=${mockAccessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
        `refreshToken=${mockRefreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
      ]);

      res.json({
        message: 'Login admin berhasil (Mock SSO)',
        data: {
          id: mockUser.id,
          username: mockUser.username,
          role: mockUser.role
        }
      });
    }

  } catch (error) {
    console.error('Admin login error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Username atau password salah' 
      });
    }
    
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server' 
    });
  }
});

// Get admin profile
router.get('/admin/profile', async (req, res) => {
  try {
    // Ambil cookie dari request
    const cookies = req.headers.cookie;
    
    if (!cookies) {
      return res.status(401).json({ 
        error: 'Cookie tidak ditemukan' 
      });
    }

    // Check if using mock tokens
    const isMockToken = cookies.includes('mock_access_token');
    
    if (isMockToken) {
      // Return mock profile
      res.json({
        message: 'Profile admin berhasil diambil (Mock)',
        data: {
          id: 2,
          username: 'wasil',
          role: 'admin'
        }
      });
      return;
    }

    // Try external SSO
    try {
      const profileResponse = await axios.get('https://10.15.38.162:3500/api/sso/v1/auth/me', {
        headers: {
          'Cookie': cookies
        },
        withCredentials: true,
        timeout: 5000
      });

      res.json({
        message: 'Profile admin berhasil diambil',
        data: profileResponse.data
      });
    } catch (ssoError) {
      res.status(401).json({ 
        error: 'SSO server tidak dapat diakses' 
      });
    }

  } catch (error) {
    console.error('Get admin profile error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Token tidak valid' 
      });
    }
    
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server' 
    });
  }
});

// Refresh token
router.post('/admin/refresh', async (req, res) => {
  try {
    // Ambil cookie dari request
    const cookies = req.headers.cookie;
    
    if (!cookies) {
      return res.status(401).json({ 
        error: 'Cookie tidak ditemukan' 
      });
    }

    // Refresh token dari SSO server
    const refreshResponse = await axios.post('https://10.15.38.162:3500/v1/auth/refresh-token', {}, {
      headers: {
        'Cookie': cookies
      },
      withCredentials: true
    });

    // Set cookie baru dari response
    if (refreshResponse.headers['set-cookie']) {
      res.setHeader('Set-Cookie', refreshResponse.headers['set-cookie']);
    }

    res.json({
      message: 'Token berhasil di-refresh',
      data: refreshResponse.data
    });

  } catch (error) {
    console.error('Refresh token error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Token tidak valid' 
      });
    }
    
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server' 
    });
  }
});

// Logout admin
router.post('/admin/logout', async (req, res) => {
  try {
    // Ambil cookie dari request
    const cookies = req.headers.cookie;
    
    if (cookies) {
      // Try external SSO logout
      try {
        const logoutResponse = await axios.post('https://10.15.38.162:3100/api/sso/v1/auth/logout', {}, {
          headers: {
            'Cookie': cookies
          },
          withCredentials: true,
          timeout: 5000
        });
        console.log('External SSO logout successful');
      } catch (ssoError) {
        console.log('External SSO logout failed, using mock logout');
      }
    }

    // Clear all cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('admin_login');
    res.clearCookie('admin_login_time');

    res.json({
      message: 'Logout berhasil',
      data: {
        message: 'Session telah dibersihkan'
      }
    });

  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
    
    // Clear cookies even if logout fails
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('admin_login');
    res.clearCookie('admin_login_time');
    
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server' 
    });
  }
});

module.exports = router; 