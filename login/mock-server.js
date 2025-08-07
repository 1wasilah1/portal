import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:1225', 'http://localhost:1226'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Dummy data
const DUMMY_USERS = {
  'wasil': {
    username: 'wasil',
    password: 'wasil123',
    role: 'admin',
    app_id: 8
  },
  'admin': {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    app_id: 8
  }
};

// Generate dummy JWT tokens (for demo purposes)
const generateToken = (user) => {
  return {
    accessToken: `dummy-access-token-${user.username}-${Date.now()}`,
    refreshToken: `dummy-refresh-token-${user.username}-${Date.now()}`
  };
};

// Admin Login Endpoint
app.post('/admin/login', (req, res) => {
  console.log('🔵 Admin Login Request:', req.body);
  
  const { username, password, app_id } = req.body;
  
  // Validate input
  if (!username || !password || !app_id) {
    return res.status(400).json({
      error: 'Username, password, dan app_id harus diisi'
    });
  }
  
  // Check user exists
  const user = DUMMY_USERS[username];
  if (!user) {
    return res.status(401).json({
      error: 'Username tidak ditemukan'
    });
  }
  
  // Check password
  if (user.password !== password) {
    return res.status(401).json({
      error: 'Password salah'
    });
  }
  
  // Check app_id
  if (user.app_id !== app_id) {
    return res.status(401).json({
      error: 'App ID tidak valid'
    });
  }
  
  // Generate tokens
  const tokens = generateToken(user);
  
  // Set HTTP-only cookies
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  console.log('✅ Login successful for user:', username);
  console.log('🍪 Cookies set:', {
    accessToken: tokens.accessToken.substring(0, 20) + '...',
    refreshToken: tokens.refreshToken.substring(0, 20) + '...'
  });
  
  res.json({
    message: 'Login berhasil',
    user: {
      username: user.username,
      role: user.role
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
});

// Admin Profile Endpoint
app.get('/admin/profile', (req, res) => {
  console.log('🔵 Admin Profile Request');
  console.log('🍪 Cookies received:', req.cookies);
  
  const { accessToken } = req.cookies;
  
  if (!accessToken) {
    return res.status(401).json({
      error: 'Access token tidak ditemukan'
    });
  }
  
  // Extract username from dummy token (in real app, verify JWT)
  const tokenParts = accessToken.split('-');
  const username = tokenParts[3]; // dummy-access-token-{username}-{timestamp}
  
  const user = DUMMY_USERS[username];
  if (!user) {
    return res.status(401).json({
      error: 'User tidak ditemukan'
    });
  }
  
  console.log('✅ Profile retrieved for user:', username);
  
  res.json({
    data: {
      username: user.username,
      role: user.role,
      loginTime: new Date().toISOString()
    }
  });
});

// Admin Logout Endpoint
app.post('/admin/logout', (req, res) => {
  console.log('🔵 Admin Logout Request');
  
  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  console.log('✅ Logout successful, cookies cleared');
  
  res.json({
    message: 'Logout berhasil'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mock server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /admin/login`);
  console.log(`   GET  /admin/profile`);
  console.log(`   POST /admin/logout`);
  console.log(`   GET  /health`);
  console.log(`\n🔑 Test credentials:`);
  console.log(`   Username: wasil, Password: wasil123`);
  console.log(`   Username: admin, Password: admin123`);
  console.log(`   App ID: 8`);
});