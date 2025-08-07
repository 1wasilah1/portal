const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const https = require('https');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Import auth routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const app = express();

// Cek apakah file SSL ada
const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');
const useHttps = fs.existsSync(keyPath) && fs.existsSync(certPath);

let sslOptions = null;
if (useHttps) {
  sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Tambahan untuk menyajikan gambar dari React (misalnya LANRI.png)
app.use('/portal/img', express.static(path.join(__dirname, '../portaldata-fe/public/img')));

// Route untuk health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

// Auth routes
app.use('/login', authRoutes);
app.use('/login', adminAuthRoutes);

// Proxy untuk static files portal (tanpa path rewrite)
app.use('/static', createProxyMiddleware({
  target: 'http://localhost:3000/static',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/portal/static': '/static',
  },
  onError: (err, req, res) => {
    console.error('Proxy error for /portal/static:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying static portal ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Proxy untuk portaldata-fe
app.use('/portal', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/': '/',
  },
  onError: (err, req, res) => {
    console.error('Proxy error for /portal:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying portal ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Proxy untuk portaldata-be
app.use('/portal-be', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/': '/',
  },
  onError: (err, req, res) => {
    console.error('Proxy error for /portal:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying portal ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Redirect /peta to /gis/peta
// app.use('/gis-fe', (req, res) => {
//     const newUrl = `/gis-fe${req.url}`;
//     console.log(`Redirecting ${req.url} to ${newUrl}`);
//     res.redirect(newUrl);
// });

// Proxy untuk GIS service (termasuk static files)
app.use('/gis-fe', createProxyMiddleware({
    target: 'http://localhost:9100/gis-fe', // GIS service running on port 9100
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '': '', // Redirect /gis to /peta in backend
    },
    onError: (err, req, res) => {
        console.error('Proxy error for /gis:', err.message);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
    }
}));

// Proxy GIS-BE
app.use('/gis-be', createProxyMiddleware({
  target: 'http://localhost:9000',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/': '/',
  },
  onError: (err, req, res) => {
    console.error('Proxy error for /gis:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Proxy static files dari /peta
app.use('/peta', createProxyMiddleware({
  target: 'http://localhost:9100/peta',
  changeOrigin: true,
  secure: false,
  onError: (err, req, res) => {
    console.error('Proxy error for /peta:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying static ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Proxy untuk login service
app.use('/login', createProxyMiddleware({
  target: 'http://localhost:1225',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/login': '/',
  },
  onError: (err, req, res) => {
    console.error('Proxy error for /login:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying login ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Proxy API BE
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/api': '/api',
  },
  onError: (err, req, res) => {
    console.error('Proxy error for /api:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying API ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Default proxy ke login jika bukan ke portal/gis/api
app.use('/', (req, res, next) => {
  if (
    req.path === '/health' ||
    req.path.startsWith('/portal') ||
    req.path.startsWith('/static') ||
    req.path.startsWith('/api')
  ) {
    return next();
  }

  const proxy = createProxyMiddleware({
    target: 'http://localhost:1225',
    changeOrigin: true,
    secure: false,
    onError: (err, req, res) => {
      console.error('Proxy error for static files:', err.message);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying static ${req.method} ${req.url} to ${proxyReq.path}`);
    }
  });

  proxy(req, res, next);
});

const PORT = process.env.PORT || 9200;

if (useHttps) {
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`✅ HTTPS Proxy server running on https://localhost:${PORT}`);
  });
} else {
  http.createServer(app).listen(PORT, () => {
    console.log(`✅ HTTP Proxy server running on http://localhost:${PORT}`);
    console.log('⚠️  SSL certificates not found, running in HTTP mode');
  });
}
