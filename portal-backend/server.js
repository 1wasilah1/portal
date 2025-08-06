const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const pool = require('./db');
const { authenticateToken, generateToken } = require('./auth');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "https://10.15.38.162:3100"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3600;
const HOST = process.env.HOST || 'localhost';
const LOGIN_PORT = process.env.LOGIN_PORT || 1225;
const GIS_FE_PORT = process.env.GIS_FE_PORT || 9100;
const PORTALDATA_PORT = process.env.PORTALDATA_PORT || 3000;
const USE_SSL = process.env.USE_SSL === 'true';
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || './ssl/cert.pem';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || './ssl/key.pem';
const SSO_API_URL = process.env.SSO_API_URL || 'https://10.15.38.162:3100';

// Proxy configuration
const proxyOptions = {
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  timeout: 10000,
  ws: true, // Enable WebSocket support
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔗 Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy Error:', err.message);
    res.status(500).json({ 
      error: 'Proxy Error', 
      message: err.message,
      service: req.url.split('/')[1]
    });
  }
};

// Login App Proxy - Route /login to port 1225
app.use('/login', createProxyMiddleware({
  ...proxyOptions,
  target: `http://${HOST}:${LOGIN_PORT}`,
  pathRewrite: {
    '^/login': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📱 Login App: ${req.method} ${req.url} → http://${HOST}:${LOGIN_PORT}${proxyReq.path}`);
  }
}));

// Handle Vite development server files for Login App
app.use(['/@vite', '/@react-refresh', '/src', '/node_modules', '/public', '/assets'], createProxyMiddleware({
  ...proxyOptions,
  target: `http://${HOST}:${LOGIN_PORT}`,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📱 Login Static: ${req.method} ${req.url} → http://${HOST}:${LOGIN_PORT}${proxyReq.path}`);
  }
}));

// GIS Frontend Proxy - Route /gis to port 9100
app.use('/gis', createProxyMiddleware({
  ...proxyOptions,
  target: `http://${HOST}:${GIS_FE_PORT}`,
  pathRewrite: {
    '^/gis': '/peta'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🗺️  GIS Frontend: ${req.method} ${req.url} → http://${HOST}:${GIS_FE_PORT}${proxyReq.path}`);
  }
}));

// Portal Data Proxy - Route /portal to port 3000
app.use('/portal', createProxyMiddleware({
  ...proxyOptions,
  target: `http://${HOST}:${PORTALDATA_PORT}`,
  pathRewrite: {
    '^/portal': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📊 Portal Data: ${req.method} ${req.url} → http://${HOST}:${PORTALDATA_PORT}${proxyReq.path}`);
  }
}));

// SSO API Proxy - Route /api/sso to external SSO server
app.use('/api/sso', createProxyMiddleware({
  ...proxyOptions,
  target: SSO_API_URL,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔐 SSO API: ${req.method} ${req.url} → ${SSO_API_URL}${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ SSO API Error:`, err.message);
    res.status(500).json({ error: 'SSO API Error', message: err.message });
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    portal: {
      port: PORT,
      host: HOST,
      ssl: USE_SSL
    },
    services: {
      login: `${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/login`,
      gis: `${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/gis`,
      portal: `${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/portal`,
      sso: `${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/api/sso`
    },
    targets: {
      login: `http://${HOST}:${LOGIN_PORT}`,
      gis: `http://${HOST}:${GIS_FE_PORT}`,
      portal: `http://${HOST}:${PORTALDATA_PORT}`,
      sso: SSO_API_URL
    }
  });
});

// Service status check endpoint
app.get('/status', async (req, res) => {
  const http = require('http');
  
  const checkService = (port, name) => {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: HOST,
        port: port,
        path: '/',
        method: 'GET',
        timeout: 3000
      }, (res) => {
        resolve({ name, port, status: 'running', code: res.statusCode });
      });
      
      req.on('error', () => {
        resolve({ name, port, status: 'down', code: null });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ name, port, status: 'timeout', code: null });
      });
      
      req.end();
    });
  };
  
  const results = await Promise.all([
    checkService(LOGIN_PORT, 'login'),
    checkService(GIS_FE_PORT, 'gis'),
    checkService(PORTALDATA_PORT, 'portal')
  ]);
  
  res.json({
    timestamp: new Date().toISOString(),
    services: results
  });
});

// User Registration API
app.post('/api/register', async (req, res) => {
  try {
    const { email, nama, no_hp, alamat } = req.body;
    
    // Validate required fields
    if (!email || !nama || !no_hp || !alamat) {
      return res.status(400).json({ 
        error: 'All fields are required: email, nama, no_hp, alamat' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate phone number format (Indonesian)
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(no_hp)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if email already exists
    const checkQuery = 'SELECT id FROM user_mail WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [email]);
    
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Insert new user
    const insertQuery = 'INSERT INTO user_mail (email, nama, no_hp, alamat) VALUES ($1, $2, $3, $4) RETURNING id, email, nama, no_hp, alamat, created_at';
    const result = await pool.query(insertQuery, [email, nama, no_hp, alamat]);
    
    const user = result.rows[0];
    const token = generateToken(user);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        no_hp: user.no_hp,
        alamat: user.alamat,
        created_at: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login API
app.post('/api/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const query = 'SELECT id, email, nama, no_hp, alamat, created_at FROM user_mail WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email not registered' });
    }

    const user = result.rows[0];
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        no_hp: user.no_hp,
        alamat: user.alamat,
        created_at: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile (protected route)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT id, email, nama, no_hp, alamat, created_at FROM user_mail WHERE id = $1';
    const result = await pool.query(query, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (protected route)
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { nama, no_hp, alamat } = req.body;
    
    // Validate required fields
    if (!nama || !no_hp || !alamat) {
      return res.status(400).json({ 
        error: 'All fields are required: nama, no_hp, alamat' 
      });
    }

    // Validate phone number format (Indonesian)
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(no_hp)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const updateQuery = 'UPDATE user_mail SET nama = $1, no_hp = $2, alamat = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, email, nama, no_hp, alamat, created_at, updated_at';
    const result = await pool.query(updateQuery, [nama, no_hp, alamat, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Default route - redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const startServer = () => {
  const server = USE_SSL ? https.createServer({
    cert: fs.readFileSync(SSL_CERT_PATH),
    key: fs.readFileSync(SSL_KEY_PATH)
  }, app) : http.createServer(app);

  server.listen(PORT, () => {
    console.log(`🚀 Portal Backend Service running on ${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}`);
    console.log(`📱 Login App: ${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/login`);
    console.log(`🗺️  GIS Frontend: ${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/gis`);
    console.log(`📊 Portal Data: ${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/portal`);
    console.log(`🔐 SSO API: ${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/api/sso`);
    console.log(`❤️  Health Check: ${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/health`);
    console.log(`📈 Status Check: ${USE_SSL ? 'https' : 'http'}://${HOST}:${PORT}/status`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use!`);
      console.error('💡 Please stop the existing process or change the port in .env file');
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
};

startServer(); 